const { pool } = require("../config/db");

// Create Train Schedule
exports.createTrainSchedule = async (
  train_id,
  start_station,
  end_station,
  departure_time,
  arrival_time,
  day_off,
) => {
  try {
    const result = await pool.query(
      `insert into schedules(train_id, start_station, end_station, departure_time, arrival_time, day_off) values($1, $2, $3, $4, $5, $6) returning *`,
      [
        train_id,
        start_station,
        end_station,
        departure_time,
        arrival_time,
        day_off,
      ],
    );

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Update the Train Arrival and Departure Time
exports.updateTrainArrivalAndDepartureTime = async (
  train_id,
  arrival_time,
  departure_time,
) => {
  try {
    const result = await pool.query(
      `update schedules set departure_time = $3, arrival_time = $2 where train_id = $1 returning *`,
      [train_id, arrival_time, departure_time],
    );

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Update the Train Source and Destination
exports.updateTrainSourceAndDestination = async (
  train_id,
  start_station,
  end_station,
) => {
  try {
    const result = await pool.query(
      `update schedules set start_station = $2, end_station = $3 where train_id = $1 returning *`,
      [train_id, start_station, end_station],
    );

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Get the Train Schedule
exports.getTrainSchedule = async (train_id) => {
  try {
    const result = await pool.query(
      `select * from schedules where train_id = $1`,
      [train_id],
    );

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Get all the Train Schedules(ADMIN)
exports.getAllTrainSchedules = async () => {
  try {
    const result = await pool.query(`select * from schedules`);

    return result.rows;
  } catch (error) {
    console.log(error);
  }
};
