const {
  createTrain,
  searchTrains,
  getAllTrains,
} = require("../services/train.service");

// Create The Train(ADMIN)
exports.createTrain = async (req, res, next) => {
  try {
    const { train_no, train_name, source, destination } = req.body;

    if (!train_no || !train_name || !source || !destination) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newTrain = await createTrain(
      train_no,
      train_name,
      source,
      destination,
    );

    return res
      .status(201)
      .json({ message: "Train created successfully", newTrain });
  } catch (error) {
    next(error);
  }
};

// Search Trains
exports.searchTrains = async (req, res, next) => {
  try {
    const { source, destination } = req.query;

    if (!source || !destination) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const trains = await searchTrains(source, destination);

    return res.status(200).json({ trains });
  } catch (error) {
    next(error);
  }
};

// Get All Trains(ADMIN)
exports.getAllTrains = async (req, res, next) => {
  try {
    const trains = await getAllTrains();

    if (!trains) {
      return res.status(404).json({ error: "No trains found" });
    }

    return res.status(200).json({ trains });
  } catch (error) {
    next(error);
  }
};
