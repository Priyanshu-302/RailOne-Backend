const { pool } = require("../config/db");
const { createTicket } = require("../models/ticket.model");
const seatInventoryModel = require("../models/seatInventory.model");
const { findTicketByPNR } = require("../models/ticket.model");
const { getUserTickets } = require("../models/ticket.model");
const { getPaymentByUserId } = require("../models/payment.model");

// Generate PNR number
function generatePNR() {
  return "PNR" + Date.now() + Math.floor(Math.random() * 1000);
}

// Book Ticket
exports.bookTicket = async (user_id, train_id, journey_date, class_train) => {
  const client = await pool.connect();

  try {
    const payment = await getPaymentByUserId(user_id);

    if (payment && payment.status === "BOOKED") {
      await client.query("BEGIN");

      // Lock Seat Inventory
      const inventory = await seatInventoryModel.lockSeatInventory(
        client,
        train_id,
        journey_date,
        class_train,
      );

      if (inventory.available_seats <= 0) {
        throw new Error("No seats available");
      }

      // Assign Seat Number
      const seatNo = inventory.total_seats - inventory.available_seats + 1;

      // Generate PNR number
      const PNR_no = generatePNR();

      // Create Ticket
      const ticket = await createTicket(client, {
        user_id,
        train_id,
        journey_date,
        class_train,
        seat_no: seatNo,
        status: "BOOKED",
        PNR_no,
      });

      // Decrement Available Seats
      await seatInventoryModel.decrementAvailableSeats(
        client,
        train_id,
        journey_date,
        class_train,
      );

      await client.query("COMMIT");

      return ticket;
    }

    throw new Error("Please complete the payment process to book the ticket");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Get Ticket by PNR
exports.getTicketByPNR = async (PNR_no) => {
  try {
    const ticket = await findTicketByPNR(PNR_no);

    if (!ticket) {
      throw new Error("Ticket not found!");
    }

    return ticket;
  } catch (error) {
    console.log(error);
  }
};

// Get User Tickets
exports.getUserTickets = async (user_id) => {
  try {
    const allTickets = await getUserTickets(user_id);

    if (!allTickets) {
      throw new Error("User have no tickets!");
    }

    return allTickets;
  } catch (error) {
    console.log(error);
  }
};

// Validate Seat Availability
exports.validateSeatAvailability = async (train_id, date, class_train) => {
  try {
    const inventory = await seatInventoryModel.checkSeatAvailability(
      train_id,
      date,
      class_train,
    );

    if (inventory.available_seats <= 0) {
      throw new Error("No seats available!");
    }

    if (inventory.available_seats > inventory.total_seats) {
      throw new Error("Seat inventory is corrupted!");
    }

    return inventory;
  } catch (error) {
    console.log(error);
  }
};
