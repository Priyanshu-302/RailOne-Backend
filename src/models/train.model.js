const { pool } = require("../config/db");

// Function to create a train(ADMIN)
exports.createTrain = async (train_no, train_name, source, destination) => {
  try {
    const result = await pool.query(
      `insert into trains(train_no, train_name, source, destination) values ($1, $2, $3, $4) returning *`,
      [train_no, train_name, source, destination],
    );

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Function to find the train by train number
exports.findTrainByNumber = async (train_no) => {
  try {
    const result = await pool.query(
      `select * from trains where train_no = $1`,
      [train_no],
    );

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Function to get all trains(ADMIN)
exports.getAllTrains = async () => {
  try {
    const result = await pool.query(`select * from trains`);

    return result.rows;
  } catch (error) {
    console.log(error);
  }
};

// Function to search trains
exports.searchTrains = async (source, destination) => {
  try {
    const result = await pool.query(
      `select * from trains where source = $1 and destination = $2`,
      [source, destination],
    );

    return result.rows;
  } catch (error) {
    console.log(error);
  }
};
