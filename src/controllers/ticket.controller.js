const {
  bookTicket,
  getTicketByPNR,
  getUserTickets,
  validateSeatAvailability,
} = require("../services/ticket.service");

// Book Ticket
exports.bookTicket = async (req, res, next) => {
  try {
    const { user_id, train_id, journey_date, class_train } = req.body;

    if (!user_id || !train_id || !journey_date || !class_train) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const ticket = await bookTicket(
      user_id,
      train_id,
      journey_date,
      class_train,
    );

    return res
      .status(201)
      .json({ message: "Ticket Booked Successfully", ticket });
  } catch (error) {
    next(error);
  }
};

// Get Ticket by PNR number
exports.getTicketByPNR = async (req, res, next) => {
  try {
    const { PNR_no } = req.body;

    if (!PNR_no) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const ticket = await getTicketByPNR(PNR_no);

    if (!ticket) {
      return res.status(400).json({ error: "Ticket not found" });
    }

    return res
      .status(200)
      .json({ message: "Ticket found successfully" }, ticket);
  } catch (error) {
    next(error);
  }
};

// Get User Tickets
exports.getUserTickets = async (req, res, next) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "All fields required" });
    }

    const userTickets = await getUserTickets(user_id);

    if (!userTickets) {
      return res.status(400).json({ error: "No tickets found" });
    }

    return res
      .status(200)
      .json({ message: "Ticket fetched successfully", userTickets });
  } catch (error) {
    next(error);
  }
};

// Validate Seat Availability
exports.validateSeatAvailability = async (req, res, next) => {
  try {
    const { train_id, date, class_train } = req.body;

    if (!train_id || !date || !class_train) {
      return res.status(400).json({ error: "All fields required" });
    }

    const seats = await validateSeatAvailability(train_id, date, class_train);

    if (!seats) {
      return res.status(400).json({ error: "No seats available" });
    }

    return res.status(200).json({ message: "Available seats", seats });
  } catch (error) {
    next(error);
  }
};
