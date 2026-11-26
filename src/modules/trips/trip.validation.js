const Joi = require("joi");

const tripIdParams = Joi.object({
  tripId: Joi.number().integer().positive().required(),
});

const requestIdParams = Joi.object({
  tripId: Joi.number().integer().positive().required(),
  requestId: Joi.number().integer().positive().required(),
});

const createTripSchema = Joi.object({
  destination: Joi.string().trim().min(1).max(150).required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")).required(),
  capacity: Joi.number().integer().min(2).required(),
  title: Joi.string().trim().max(150).allow("", null),
  description: Joi.string().trim().allow("", null),
  origin: Joi.string().trim().max(150).allow("", null),
});

const joinRequestBodySchema = Joi.object({
  message: Joi.string().trim().max(1000).allow("", null),
}).default({});

const listJoinRequestsQuery = Joi.object({
  status: Joi.string().valid("PENDING", "ACCEPTED", "REJECTED").optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid("STARTED", "CANCELLED").required(),
});

module.exports = {
  tripIdParams,
  requestIdParams,
  createTripSchema,
  joinRequestBodySchema,
  listJoinRequestsQuery,
  updateStatusSchema,
};
