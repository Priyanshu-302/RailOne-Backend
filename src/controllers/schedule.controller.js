const {
  createTrainSchedule,
  updateTrainArrivalAndDepartureTime,
  updateTrainSourceAndDestination,
  getTrainSchedule,
  getAllTrainSchedules,
} = require("../services/schedule.service");

// Create Train Schedule(ADMIN)
exports.createTrainSchedule = async (req, res, next) => {
  try {
    const {
      train_id,
      start_station,
      end_station,
      departure_time,
      arrival_time,
      day_off,
    } = req.body;

    if (
      !train_id ||
      !start_station ||
      !end_station ||
      !departure_time ||
      !arrival_time ||
      !day_off
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newSchedule = await createTrainSchedule(
      train_id,
      start_station,
      end_station,
      departure_time,
      arrival_time,
      day_off,
    );

    return res
      .status(201)
      .json({ message: "Train schedule created successfully", newSchedule });
  } catch (error) {
    next(error);
  }
};

// Update Train Arrival And Departure Time(ADMIN)
exports.updateTrainArrivalAndDepartureTime = async (req, res, next) => {
  try {
    const { train_id, arrival_time, departure_time } = req.body;

    if (!train_id || !arrival_time || !departure_time) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const updatedSchedule = await updateTrainArrivalAndDepartureTime(
      train_id,
      arrival_time,
      departure_time,
    );

    return res.status(200).json({
      message: "Train arrival and departure time updated successfully",
      updatedSchedule,
    });
  } catch (error) {
    next(error);
  }
};

// Update Train Source And Destination(ADMIN)
exports.updateTrainSourceAndDestination = async (req, res, next) => {
  try {
    const { train_id, start_station, end_station } = req.body;

    if (!train_id || !start_station || !end_station) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const updatedSchedule = await updateTrainSourceAndDestination(
      train_id,
      start_station,
      end_station,
    );

    return res.status(200).json({
      message: "Train source and destination updated successfully",
      updatedSchedule,
    });
  } catch (error) {
    next(error);
  }
};

// Get Train Schedule
exports.getTrainSchedule = async (req, res, next) => {
  try {
    const { train_id } = req.body;

    if (!train_id) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const schedule = await getTrainSchedule(train_id);

    if (!schedule) {
      return res.status(404).json({ error: "Train schedule not found" });
    }

    return res.status(200).json({ schedule });
  } catch (error) {
    next(error);
  }
};

// Get All Train Schedules(ADMIN)
exports.getAllTrainSchedules = async (req, res, next) => {
  try {
    const schedules = await getAllTrainSchedules();

    if (!schedules) {
      return res.status(404).json({ error: "No train schedules found" });
    }

    return res.status(200).json({ schedules });
  } catch (error) {
    next(error);
  }
};
