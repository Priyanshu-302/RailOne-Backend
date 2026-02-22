const { pool } = require("../config/db");

// Create the Ticket
exports.createTicket = async (
  client,
  { user_id, train_id, journey_date, class_train, seat_no, status, PNR_no },
) => {
  try {
    const result = await client.query(
      `insert into tickets(user_id, train_id, journey_date, class_train, seat_no, status, PNR_no) values($1, $2, $3, $4, $5, $6, $7) returning *`,
      [user_id, train_id, journey_date, class_train, seat_no, status, PNR_no],
    );

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Find ticket by id
exports.findTicketById = async (id) => {
  try {
    const result = await pool.query(`select * from tickets where id = $1`, [
      id,
    ]);

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Get User Tickets
exports.getUserTickets = async (user_id) => {
  try {
    const result = await pool.query(
      `select * from tickets where user_id = $1`,
      [user_id],
    );

    return result.rows;
  } catch (error) {
    console.log(error);
  }
};

// Update Ticket Status
exports.updateTicketStatus = async (id, status) => {
  try {
    const result = await pool.query(
      `update tickets set status = $2 where id = $1 returning *`,
      [id, status],
    );

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

// Find ticket by PNR
exports.findTicketByPNR = async (PNR_no) => {
  try {
    const result = await pool.query(`select * from tickets where PNR_no = $1`, [
      PNR_no,
    ]);

    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};
