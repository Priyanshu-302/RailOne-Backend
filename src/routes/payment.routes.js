const paymentController = require("../controllers/payment.controller");
const { authHandler } = require("../middlewares/auth.middleware");

const router = require("express").Router();
router.use(authHandler);

// Create Payment
router.post("/create-payment", paymentController.createPayment);

// Get Payment By User Id
router.get("/get-payment", paymentController.getPaymentByUserId);

module.exports = router;