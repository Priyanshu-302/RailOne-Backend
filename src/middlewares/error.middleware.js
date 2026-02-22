// Global Error Middleware
exports.errorHandler = (err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });

  next();
};
