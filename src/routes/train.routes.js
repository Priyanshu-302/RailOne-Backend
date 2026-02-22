const trainController = require("../controllers/train.controller");
const { authHandler } = require("../middlewares/auth.middleware");
const { roleHandler } = require("../middlewares/role.middleware");

const router = require("express").Router();
router.use(authHandler);

// Create Train
router.post("/create-train", roleHandler("ADMIN"), trainController.createTrain);

// Search Trains
router.get("/search-train", trainController.searchTrains);

// Get All Trains(ADMIN)
router.get(
  "/get-all-trains",
  roleHandler("ADMIN"),
  trainController.getAllTrains,
);

module.exports = router;