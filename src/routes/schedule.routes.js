const scheduleController = require("../controllers/schedule.controller");
const { authHandler } = require("../middlewares/auth.middleware");
const { roleHandler } = require("../middlewares/role.middleware");

const router = require("express").Router();
router.use(authHandler);

// Create Train Schedule(ADMIN)
router.post(
  "/create-train-schedule",
  roleHandler("ADMIN"),
  scheduleController.createTrainSchedule,
);

// Update Train Arrival and Departure Time(ADMIN)
router.patch(
  "/update-train-arrival-and-departure-time",
  roleHandler("ADMIN"),
  scheduleController.updateTrainArrivalAndDepartureTime,
);

// Update Train Source and Destination(ADMIN)
router.patch(
  "/update-train-source-and-destination",
  roleHandler("ADMIN"),
  scheduleController.updateTrainSourceAndDestination,
);

// Get Train Schedule
router.get("/train-schedule", scheduleController.getTrainSchedule);

// Get All Train Schedule(ADMIN)
router.get(
  "/all-train-schedule",
  roleHandler("ADMIN"),
  scheduleController.getAllTrainSchedules,
);

module.exports = router;