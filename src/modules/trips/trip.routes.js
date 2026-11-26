const express = require("express");
const validate = require("../../common/validate");
const { authenticate } = require("../../middlewares/auth.middleware");
const {
  tripIdParams,
  requestIdParams,
  createTripSchema,
  joinRequestBodySchema,
  listJoinRequestsQuery,
  updateStatusSchema,
} = require("./trip.validation");
const tripController = require("./trip.controller");

const router = express.Router();

router.use(authenticate);

router.post("/", validate({ body: createTripSchema }), tripController.create);
router.get("/mine", tripController.listMine);
router.get("/discover", tripController.discover);

router.get(
  "/:tripId",
  validate({ params: tripIdParams }),
  tripController.getById
);

router.post(
  "/:tripId/join-requests",
  validate({ params: tripIdParams, body: joinRequestBodySchema }),
  tripController.createJoinRequest
);

router.get(
  "/:tripId/join-requests",
  validate({ params: tripIdParams, query: listJoinRequestsQuery }),
  tripController.listJoinRequests
);

router.post(
  "/:tripId/join-requests/:requestId/accept",
  validate({ params: requestIdParams }),
  tripController.acceptJoinRequest
);

router.post(
  "/:tripId/join-requests/:requestId/reject",
  validate({ params: requestIdParams }),
  tripController.rejectJoinRequest
);

router.get(
  "/:tripId/members",
  validate({ params: tripIdParams }),
  tripController.listMembers
);

router.patch(
  "/:tripId/status",
  validate({ params: tripIdParams, body: updateStatusSchema }),
  tripController.updateStatus
);

module.exports = router;
