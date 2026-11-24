const { ValidationError } = require("joi");
const { UniqueConstraintError } = require("sequelize");
const AppError = require("./AppError");

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err.isJoi || err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: (err.details || []).map((d) => ({
        path: d.path.join("."),
        message: d.message,
      })),
    });
  }

  if (err instanceof UniqueConstraintError) {
    const fields = Object.keys(err.fields || {});
    const message = fields.includes("email")
      ? "Email already registered"
      : "Resource already exists";
    return res.status(409).json({
      success: false,
      message,
      errors: [],
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: [],
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    errors: [],
  });
};

module.exports = errorHandler;
