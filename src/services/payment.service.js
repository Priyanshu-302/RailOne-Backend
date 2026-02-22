const { createPayment } = require("../models/payment.model");
const { updatePaymentStatus } = require("../models/payment.model");
const {
  getPaymentByTrain,
  getPaymentByUserId,
} = require("../models/payment.model");

// Create Payment
exports.createPayment = async (user_id, train_id, amount, payment_date) => {
  try {
    const newPayment = await createPayment({
      user_id,
      train_id,
      amount,
      payment_date,
    });

    return newPayment;
  } catch (error) {
    console.log(error);
  }
};

// Update Payment Status
exports.updatePaymentStatus = async (id, status) => {
  try {
    const updatedPayment = await updatePaymentStatus(id, status);

    return updatedPayment;
  } catch (error) {
    console.log(error);
  }
};

// Get Payment By Train Id
exports.getPaymentByTrainId = async (train_id) => {
  try {
    const payment = await getPaymentByTicket(train_id);

    return payment ? true : false;
  } catch (error) {
    console.log(error);
  }
};

// Get Payment By User Id
exports.getPaymentById = async (user_id) => {
  try {
    const payment = await getPaymentByUserId(user_id);

    return payment ? true : false;
  } catch (error) {
    console.log(error);
  }
};

// Handle Payment Failure
exports.handlePaymentFailure = async (train_id) => {
  try {
    const payment = await getPaymentByTrain(train_id);

    if (!payment) {
      throw new Error("Payment not found");
    }

    await updatePaymentStatus(payment.id, "FAILED");

    return payment;
  } catch (error) {
    console.log(error);
  }
};
