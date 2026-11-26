const tripService = require("./trip.service");
const { sendSuccess } = require("../../common/response");

const create = async (req, res, next) => {
  try {
    const data = await tripService.createTrip({
      userId: req.user.id,
      ...req.body,
    });
    return sendSuccess(res, data, 201, "Trip created");
  } catch (err) {
    return next(err);
  }
};

const listMine = async (req, res, next) => {
  try {
    const data = await tripService.listMine(req.user.id);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

const discover = async (req, res, next) => {
  try {
    const data = await tripService.discover();
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const data = await tripService.getTripById(req.params.tripId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

const createJoinRequest = async (req, res, next) => {
  try {
    const data = await tripService.createJoinRequest({
      tripId: req.params.tripId,
      userId: req.user.id,
      message: req.body.message,
    });
    return sendSuccess(res, data, 201, "Join request submitted");
  } catch (err) {
    return next(err);
  }
};

const listJoinRequests = async (req, res, next) => {
  try {
    const data = await tripService.listJoinRequests({
      tripId: req.params.tripId,
      userId: req.user.id,
      status: req.query.status,
    });
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

const acceptJoinRequest = async (req, res, next) => {
  try {
    const data = await tripService.acceptJoinRequest({
      tripId: req.params.tripId,
      requestId: req.params.requestId,
      userId: req.user.id,
    });
    return sendSuccess(res, data, 200, "Join request accepted");
  } catch (err) {
    return next(err);
  }
};

const rejectJoinRequest = async (req, res, next) => {
  try {
    const data = await tripService.rejectJoinRequest({
      tripId: req.params.tripId,
      requestId: req.params.requestId,
      userId: req.user.id,
    });
    return sendSuccess(res, data, 200, "Join request rejected");
  } catch (err) {
    return next(err);
  }
};

const listMembers = async (req, res, next) => {
  try {
    const data = await tripService.listMembers(req.params.tripId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const data = await tripService.updateTripStatus({
      tripId: req.params.tripId,
      userId: req.user.id,
      status: req.body.status,
    });
    return sendSuccess(res, data, 200, "Trip status updated");
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  create,
  listMine,
  discover,
  getById,
  createJoinRequest,
  listJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  listMembers,
  updateStatus,
};
