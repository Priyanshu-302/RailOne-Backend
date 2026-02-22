require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const index = require("./routes/index.routes");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser());

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Railway Reservation API is running",
  });
});

// Main endpoint from which all the types of api's will be called
app.use("/rail-one/v1", index);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Error handler middleware
app.use(errorHandler);

module.exports = app;
