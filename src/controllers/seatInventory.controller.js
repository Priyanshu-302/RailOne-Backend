const {
  createSeatInventory,
  getSeatInventory,
} = require("../services/seatInventory.service");

// Create Seat Inventory
exports.createSeatInventory = async (req, res, next) => {
  try {
    const { train_id, class_train, total_seats, available_seats } = req.body;

    if (!train_id || !class_train || !total_seats || !available_seats) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    const seat = await createSeatInventory(
      train_id,
      class_train,
      total_seats,
      available_seats,
    );

    return res.status(201).json({ message: "Seat is created", seat });
  } catch (error) {
    next(error);
  }
};

// Get Seat Inventory
exports.getSeatInventory = async (req, res, next) => {
  try {
    const { train_id, date, class_train } = req.body;

    if (!train_id || !date || !class_train) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const seatInventory = await getSeatInventory(train_id, date, class_train);

    if (!seatInventory) {
      return res.status(400).json({ error: "Seat not found" });
    }

    return res
      .status(200)
      .json({ message: "Seat fetched successfully", seatInventory });
  } catch (error) {
    next(error);
  }
};
