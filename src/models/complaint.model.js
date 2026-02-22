const { pool } = require("../config/db");

// Create Complaint
exports.createComplaint = async (user_id, train_id, message, status) => {
  try {
    const result = await pool.query(
      `insert into complaints(user_id, train_id, message, status) values($1, $2, $3, $4) returning *`,
      [user_id, train_id, message, status],
    );

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Update Complaint Status
exports.updateComplaintStatus = async (id, status) => {
  try {
    const result = await pool.query(
      `update complaints set status = $2 where id = $1 returning *`,
      [id, status],
    );

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Get Complaints By Id
exports.getComplaintsByUserId = async (user_id) => {
  try {
    const result = await pool.query(
      `select * from complaints where user_id = $1`,
      [user_id],
    );

    return result.rows;
  } catch (error) {
    console.log(error);
  }
};

// Get Complaints by id
exports.getComplaintsById = async (id) => {
  try {
    const result = await pool.query(`select * from complaints where id = $1`, [
      id,
    ]);

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Get Pending Complaints
exports.getPendingComplaints = async () => {
  try {
    const result = await pool.query(
      `select * from complaints where status = 'PENDING'`,
    );

    return result.rows;
  } catch (error) {
    console.log(error);
  }
};

// Get All Complaints(ADMIN)
exports.getAllComplaints = async () => {
  try {
    const result = await pool.query(`select * from complaints`);

    return result.rows;
  } catch (error) {
    console.log(error);
  }
};
