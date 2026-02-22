const seatInventoryController = require("../controllers/seatInventory.controller");
const { authHandler } = require("../middlewares/auth.middleware");
const { roleHandler } = require("../middlewares/role.middleware");

const router = require("express").Router();
router.use(authHandler);

// Create Seat Inventory(ADMIN)
router.post(
  "/create-seat-inventory",
  roleHandler("ADMIN"),
  seatInventoryController.createSeatInventory,
);

// Get Seat Inventory
router.get("/get-seat-inventory", seatInventoryController.getSeatInventory);

module.exports = router;