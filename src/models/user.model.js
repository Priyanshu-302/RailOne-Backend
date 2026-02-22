const { pool } = require("../config/db");

// Function to fetch the user through his/her email
exports.getUserByEmail = async (email) => {
  try {
    const result = await pool.query(`select * from users where email = $1`, [
      email,
    ]);

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Function to fetch the user through id
exports.getUserById = async (id) => {
  try {
    const result = await pool.query(`select * from users where id = $1`, [id]);

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Function to fetch the user through his/her phone number
exports.getUserByPhoneNumber = async (phone) => {
  try {
    const result = await pool.query(`select * from users where phone = $1`, [
      phone,
    ]);

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Function to create the user
exports.createUser = async (name, email, phone, password, role) => {
  try {
    const result = await pool.query(
      `insert into users(name, email, phone, password, role) values ($1, $2, $3, $4, $5) returning *`,
      [name, email, phone, password, role],
    );

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Check whether user exists or not
exports.checkUserExists = async (email, phone) => {
  try {
    const result = await pool.query(
      `select * from users where email = $1 and phone = $2`,
      [email, phone],
    );

    return result.rows[0] ? true : false;
  } catch (error) {
    console.log(error);
  }
};
