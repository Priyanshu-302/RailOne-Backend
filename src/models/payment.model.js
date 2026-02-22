const { pool } = require("../config/db");

// Create Payment
exports.createPayment = async ({ user_id, train_id, amount, payment_date, status = "PENDING" }) => {
  try {
    const result = await pool.query(
      `insert into payments(user_id, train_id, amount, payment_date, status) values($1, $2, $3, $4, $5) returning *`,
      [user_id, train_id, amount, payment_date, status],
    );

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Update Payment Status
exports.updatePaymentStatus = async (id, status) => {
  try {
    const result = await pool.query(
      `update payments set status = $2 where id = $1 returning *`,
      [id, status],
    );

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Get Payment By User Id
exports.getPaymentByUserId = async (user_id) => {
  try {
    const result = await pool.query(
      `select * from payments where user_id = $1`,
      [user_id],
    );

    console.log(result.rows[0].status);

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Get Payment By Train
exports.getPaymentByTrain = async (train_id) => {
  try {
    const result = await pool.query(
      `select * from payments where train_id = $1`,
      [train_id],
    );

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};
