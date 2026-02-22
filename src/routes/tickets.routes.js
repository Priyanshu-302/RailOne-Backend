const ticketController = require("../controllers/ticket.controller");
const { authHandler } = require("../middlewares/auth.middleware");

const router = require("express").Router();
router.use(authHandler);

// Book Ticket
router.post("/book-ticket", ticketController.bookTicket);

// Get Tickets By PNR
router.get("/get-tickets-by-PNR", ticketController.getTicketByPNR);

// Get User Tickets
router.get("/get-user-tickets", ticketController.getUserTickets);

// Check Seat Availability
router.get(
  "/check-seat-availability",
  ticketController.validateSeatAvailability,
);

module.exports = router;