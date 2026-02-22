const { createTrainSchedule } = require("../models/schedule.model");
const {
  updateTrainArrivalAndDepartureTime,
} = require("../models/schedule.model");
const { updateTrainSourceAndDestination } = require("../models/schedule.model");
const { getTrainSchedule } = require("../models/schedule.model");
const { getAllTrainSchedules } = require("../models/schedule.model");

// Create Train Schedule(ADMIN)
exports.createTrainSchedule = async (
  train_id,
  start_station,
  end_station,
  departure_time,
  arrival_time,
  day_off,
) => {
  try {
    const newSchedule = await createTrainSchedule(
      train_id,
      start_station,
      end_station,
      departure_time,
      arrival_time,
      day_off,
    );

    return newSchedule;
  } catch (error) {
    console.log(error);
  }
};

// Update Train Arrival and Departure Time
exports.updateTrainArrivalAndDepartureTime = async (
  train_id,
  arrival_time,
  departure_time,
) => {
  try {
    const updatedSchedule = await updateTrainArrivalAndDepartureTime(
      train_id,
      arrival_time,
      departure_time,
    );

    return updatedSchedule;
  } catch (error) {
    console.log(error);
  }
};

// Update Train Source and Destination
exports.updateTrainSourceAndDestination = async (
  train_id,
  start_station,
  end_station,
) => {
  try {
    const updatedSchedule = await updateTrainSourceAndDestination(
      train_id,
      start_station,
      end_station,
    );

    return updatedSchedule;
  } catch (error) {
    console.log(error);
  }
};

// Get the train schedule
exports.getTrainSchedule = async (train_id) => {
  try {
    const schedule = await getTrainSchedule(train_id);

    return schedule;
  } catch (error) {
    console.log(error);
  }
};

// Get all train schedules
exports.getAllTrainSchedules = async () => {
  try {
    const schedules = await getAllTrainSchedules();

    return schedules;
  } catch (error) {
    console.log(error);
  }
};
