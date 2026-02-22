const {
  createPayment,
  updatePaymentStatus,
  getPaymentById,
} = require("../services/payment.service");

// Create Payment
exports.createPayment = async (req, res, next) => {
  try {
    const { user_id, train_id, amount, payment_date } = req.body;

    if (!user_id || !train_id || !amount) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newPayment = await createPayment(
      user_id,
      train_id,
      amount,
      payment_date,
    );

    console.log(newPayment.status);

    if (newPayment.status === "PENDING") {
      await updatePaymentStatus(newPayment.id, "BOOKED");
    }

    return res
      .status(201)
      .json({ message: "Payment created successfully", newPayment });
  } catch (error) {
    next(error);
  }
};

// Get Payment By User Id
exports.getPaymentByUserId = async (req, res, next) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const payment = await getPaymentById(user_id);

    if (!payment) {
      return res.status(400).json({ error: "Payment not found" });
    }

    return res
      .status(200)
      .json({ message: "Payment fetched successfully", payment });
  } catch (error) {
    next(error);
  }
};
