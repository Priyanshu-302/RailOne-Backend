const { pool } = require("../config/db");

// Create Seat Inventory
exports.createSeatInventory = async (
  train_id,
  class_train,
  total_seats,
  available_seats,
) => {
  try {
    const result = await pool.query(
      `insert into seat_inventory(train_id, class_train, total_seats, available_seats) values($1, $2, $3, $4) returning *`,
      [train_id, class_train, total_seats, available_seats],
    );

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Get Seat Inventory
exports.getSeatInventory = async (train_id, date, class_train) => {
  try {
    const result = await pool.query(
      `select * from seat_inventory where train_id = $1 and date = $2 and class_train = $3`,
      [train_id, date, class_train],
    );

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Lock Seat Inventory
exports.lockSeatInventory = async (client, train_id, date, class_train) => {
  try {
    const result = await client.query(
      `select * from seat_inventory where train_id = $1 and date = $2 and class_train = $3 for update`,
      [train_id, date, class_train],
    );

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Decrement Available Seats
exports.decrementAvailableSeats = async (client, train_id, date, class_train) => {
  try {
    const result = await client.query(
      `update seat_inventory set available_seats = available_seats - 1 where train_id = $1 and date = $2 and class_train = $3 returning *`,
      [train_id, date, class_train],
    );

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Increment Available Seats
exports.incrementAvailableSeats = async (train_id, date, class_train) => {
  try {
    const result = await pool.query(
      `update seat_inventory set available_seats = available_seats + 1 where train_id = $1 and date = $2 and class_train = $3 returning *`,
      [train_id, date, class_train],
    );

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Check Seat Availability
exports.checkSeatAvailability = async (train_id, date, class_train) => {
  try {
    const result = await pool.query(
      `select train_id, date, class_train, total_seats, available_seats from seat_inventory where train_id = $1 and date = $2 and class_train = $3`,
      [train_id, date, class_train],
    );

    return {
      train_id : result.rows[0].train_id,
      date : result.rows[0].date,
      class_train : result.rows[0].class_train,
      total_seats : result.rows[0].total_seats,
      available_seats : result.rows[0].available_seats
    }
  } catch (error) {
    console.log(error);
  }
};
