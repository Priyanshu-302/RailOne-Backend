const authRoutes = require("../routes/auth.routes");
const trainRoutes = require("../routes/train.routes");
const scheduleRoutes = require("../routes/schedule.routes");
const seatInventoryRoutes = require("../routes/seatInventory.routes");
const ticketRoutes = require("../routes/tickets.routes");
const paymentRoutes = require("../routes/payment.routes");
const complaintRoutes = require("../routes/complaint.routes");

const router = require("express").Router();

router.use("/auth", authRoutes);
router.use("/train", trainRoutes);
router.use("/schedule", scheduleRoutes);
router.use("/seat-inventory", seatInventoryRoutes);
router.use("/ticket", ticketRoutes);
router.use("/payment", paymentRoutes);
router.use("/complaint", complaintRoutes);

module.exports = router;