const { createSeatInventory } = require("../models/seatInventory.model");
const { getSeatInventory } = require("../models/seatInventory.model");
const { lockSeatInventory } = require("../models/seatInventory.model");
const { decrementAvailableSeats } = require("../models/seatInventory.model");
const { incrementAvailableSeats } = require("../models/seatInventory.model");

// Create Seat Inventory(ADMIN)
exports.createSeatInventory = async (
  train_id,
  class_train,
  total_seats,
  available_seats,
) => {
  try {
    const newSeatInventory = await createSeatInventory(
      train_id,
      class_train,
      total_seats,
      available_seats,
    );

    return newSeatInventory;
  } catch (error) {
    console.log(error);
  }
};

// Get seat inventory
exports.getSeatInventory = async (train_id, date, class_train) => {
  try {
    const seatInventory = await getSeatInventory(train_id, date, class_train);

    if (!seatInventory) {
      throw new Error("Seat inventory not found");
    }

    return seatInventory;
  } catch (error) {
    console.log(error);
  }
};

// Lock Seat Inventory
exports.lockSeatInventory = async (train_id, date, class_train) => {
  try {
    const lockedSeatInventory = await lockSeatInventory(
      train_id,
      date,
      class_train,
    );

    return lockedSeatInventory;
  } catch (error) {
    console.log(error);
  }
};

// Decrement Available Seats
exports.decrementAvailableSeats = async (train_id, date, class_train) => {
  try {
    const updatedSeatInventory = await decrementAvailableSeats(
      train_id,
      date,
      class_train,
    );

    return updatedSeatInventory;
  } catch (error) {
    console.log(error);
  }
};

// Increment Available Seats
exports.incrementAvailableSeats = async (train_id, date, class_train) => {
  try {
    const updatedSeatInventory = await incrementAvailableSeats(
      train_id,
      date,
      class_train,
    );

    return updatedSeatInventory;
  } catch (error) {
    console.log(error);
  }
};
