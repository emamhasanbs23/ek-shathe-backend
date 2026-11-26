const { sequelize, Trip, TripMember, JoinRequest } = require("../../models");
const AppError = require("../../common/AppError");

const emptyToNull = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
};

const countActiveMembers = async (tripId, transaction) =>
  TripMember.count({
    where: { tripId, status: "ACTIVE" },
    transaction,
  });

const toTripDto = (trip, memberCount) => {
  const plain = typeof trip.toJSON === "function" ? trip.toJSON() : trip;
  const capacity = Number(plain.capacity);
  return {
    id: plain.id,
    title: plain.title ?? null,
    description: plain.description ?? null,
    origin: plain.origin ?? null,
    destination: plain.destination,
    startDate: plain.startDate,
    endDate: plain.endDate,
    capacity,
    organizerId: plain.organizerId,
    status: plain.status,
    memberCount,
    seatsLeft: Math.max(0, capacity - memberCount),
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
};

const toJoinRequestDto = (request) => {
  const plain = typeof request.toJSON === "function" ? request.toJSON() : request;
  return {
    id: plain.id,
    tripId: plain.tripId,
    userId: plain.userId,
    message: plain.message ?? null,
    status: plain.status,
    decidedAt: plain.decidedAt ?? null,
    decidedBy: plain.decidedBy ?? null,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
};

const toMemberDto = (member) => {
  const plain = typeof member.toJSON === "function" ? member.toJSON() : member;
  return {
    id: plain.id,
    tripId: plain.tripId,
    userId: plain.userId,
    role: plain.role,
    status: plain.status,
    joinedAt: plain.joinedAt,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
};

const assertOrganizer = (trip, userId) => {
  if (Number(trip.organizerId) !== Number(userId)) {
    throw new AppError("Only the trip organizer can perform this action", 403);
  }
};

const findTripOrThrow = async (tripId, options = {}) => {
  const trip = await Trip.findByPk(tripId, options);
  if (!trip) {
    throw new AppError("Trip not found", 404);
  }
  return trip;
};

const createTrip = async ({
  userId,
  destination,
  startDate,
  endDate,
  capacity,
  title,
  description,
  origin,
}) =>
  sequelize.transaction(async (t) => {
    const trip = await Trip.create(
      {
        destination,
        startDate,
        endDate,
        capacity,
        title: emptyToNull(title),
        description: emptyToNull(description),
        origin: emptyToNull(origin),
        organizerId: userId,
        status: "OPEN",
      },
      { transaction: t }
    );

    await TripMember.create(
      {
        tripId: trip.id,
        userId,
        role: "ORGANIZER",
        status: "ACTIVE",
        joinedAt: new Date(),
      },
      { transaction: t }
    );

    return toTripDto(trip, 1);
  });

const listMine = async (userId) => {
  const memberships = await TripMember.findAll({
    where: { userId, status: "ACTIVE" },
    include: [{ model: Trip, as: "trip" }],
    order: [[{ model: Trip, as: "trip" }, "createdAt", "DESC"]],
  });

  const trips = memberships.map((m) => m.trip).filter(Boolean);
  const result = [];
  for (const trip of trips) {
    const memberCount = await countActiveMembers(trip.id);
    result.push(toTripDto(trip, memberCount));
  }
  return result;
};

const discover = async () => {
  const trips = await Trip.findAll({
    where: { status: "OPEN" },
    order: [["createdAt", "DESC"]],
  });

  const result = [];
  for (const trip of trips) {
    const memberCount = await countActiveMembers(trip.id);
    if (memberCount < trip.capacity) {
      result.push(toTripDto(trip, memberCount));
    }
  }
  return result;
};

const getTripById = async (tripId) => {
  const trip = await findTripOrThrow(tripId);
  const memberCount = await countActiveMembers(trip.id);
  return toTripDto(trip, memberCount);
};

const createJoinRequest = async ({ tripId, userId, message }) => {
  const trip = await findTripOrThrow(tripId);

  if (trip.status !== "OPEN") {
    throw new AppError("Join requests are only allowed while the trip is OPEN", 409);
  }

  const memberCount = await countActiveMembers(trip.id);
  if (memberCount >= trip.capacity) {
    throw new AppError("Trip is full", 409);
  }

  const existingMember = await TripMember.findOne({
    where: { tripId, userId, status: "ACTIVE" },
  });
  if (existingMember) {
    throw new AppError("Already a member of this trip", 409);
  }

  const pending = await JoinRequest.findOne({
    where: { tripId, userId, status: "PENDING" },
  });
  if (pending) {
    throw new AppError("A pending join request already exists", 409);
  }

  const request = await JoinRequest.create({
    tripId,
    userId,
    message: emptyToNull(message),
    status: "PENDING",
  });

  return toJoinRequestDto(request);
};

const listJoinRequests = async ({ tripId, userId, status }) => {
  const trip = await findTripOrThrow(tripId);
  assertOrganizer(trip, userId);

  const where = { tripId };
  if (status) where.status = status;

  const requests = await JoinRequest.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });

  return requests.map(toJoinRequestDto);
};

const acceptJoinRequest = async ({ tripId, requestId, userId }) =>
  sequelize.transaction(async (t) => {
    const trip = await Trip.findByPk(tripId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!trip) {
      throw new AppError("Trip not found", 404);
    }
    assertOrganizer(trip, userId);

    const request = await JoinRequest.findOne({
      where: { id: requestId, tripId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!request) {
      throw new AppError("Join request not found", 404);
    }
    if (request.status !== "PENDING") {
      throw new AppError("Join request is not pending", 409);
    }

    if (trip.status !== "OPEN") {
      throw new AppError("Cannot accept join requests unless the trip is OPEN", 409);
    }

    const memberCount = await countActiveMembers(trip.id, t);
    if (memberCount >= trip.capacity) {
      throw new AppError("Trip is full", 409);
    }

    const alreadyMember = await TripMember.findOne({
      where: { tripId, userId: request.userId, status: "ACTIVE" },
      transaction: t,
    });
    if (alreadyMember) {
      throw new AppError("User is already a member of this trip", 409);
    }

    const now = new Date();
    const member = await TripMember.create(
      {
        tripId,
        userId: request.userId,
        role: "MEMBER",
        status: "ACTIVE",
        joinedAt: now,
      },
      { transaction: t }
    );

    await request.update(
      {
        status: "ACCEPTED",
        decidedAt: now,
        decidedBy: userId,
      },
      { transaction: t }
    );

    const newCount = memberCount + 1;
    return {
      request: toJoinRequestDto(request),
      member: toMemberDto(member),
      trip: {
        id: trip.id,
        memberCount: newCount,
        seatsLeft: Math.max(0, trip.capacity - newCount),
        capacity: trip.capacity,
        status: trip.status,
      },
    };
  });

const rejectJoinRequest = async ({ tripId, requestId, userId }) =>
  sequelize.transaction(async (t) => {
    const trip = await findTripOrThrow(tripId, { transaction: t });
    assertOrganizer(trip, userId);

    const request = await JoinRequest.findOne({
      where: { id: requestId, tripId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!request) {
      throw new AppError("Join request not found", 404);
    }
    if (request.status !== "PENDING") {
      throw new AppError("Join request is not pending", 409);
    }

    await request.update(
      {
        status: "REJECTED",
        decidedAt: new Date(),
        decidedBy: userId,
      },
      { transaction: t }
    );

    return toJoinRequestDto(request);
  });

const listMembers = async (tripId) => {
  await findTripOrThrow(tripId);

  const members = await TripMember.findAll({
    where: { tripId, status: "ACTIVE" },
    order: [
      ["role", "ASC"],
      ["joinedAt", "ASC"],
    ],
  });

  return members.map(toMemberDto);
};

const updateTripStatus = async ({ tripId, userId, status }) => {
  const trip = await findTripOrThrow(tripId);
  assertOrganizer(trip, userId);

  if (trip.status !== "OPEN") {
    throw new AppError("Only OPEN trips can change status", 409);
  }
  if (status !== "STARTED" && status !== "CANCELLED") {
    throw new AppError("Invalid status transition", 409);
  }

  await trip.update({ status });
  const memberCount = await countActiveMembers(trip.id);
  return toTripDto(trip, memberCount);
};

module.exports = {
  createTrip,
  listMine,
  discover,
  getTripById,
  createJoinRequest,
  listJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  listMembers,
  updateTripStatus,
};
