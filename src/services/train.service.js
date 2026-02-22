const { createTrain } = require("../models/train.model");
const { findTrainByNumber } = require("../models/train.model");
const { searchTrains } = require("../models/train.model");
const { getAllTrains } = require("../models/train.model");

// Create Train(ADMIN)
exports.createTrain = async (train_no, train_name, source, destination) => {
  try {
    const existingTrain = await findTrainByNumber(train_no);
    if (existingTrain) {
      throw new Error("Train already exists");
    }

    const newTrain = await createTrain(
      train_no,
      train_name,
      source,
      destination,
    );

    return newTrain;
  } catch (error) {
    console.log(error);
  }
};

// Search Trains
exports.searchTrains = async (source, destination) => {
  try {
    const trains = await searchTrains(source, destination);

    if (!trains) {
      throw new Error("No trains found");
    }

    return trains;
  } catch (error) {
    console.log(error);
  }
};

// Get All Trains(ADMIN)
exports.getAllTrains = async () => {
  try {
    const trains = await getAllTrains();

    if (!trains) {
      throw new Error("No trains found");
    }

    return trains;
  } catch (error) {
    console.log(error);
  }
};
