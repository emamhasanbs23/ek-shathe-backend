const AppError = require("../common/AppError");
const { verifyAccessToken } = require("../utils/jwt.util");

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  const token = header.slice(7).trim();
  if (!token) {
    return next(new AppError("Authentication required", 401));
  }

  try {
    const decoded = verifyAccessToken(token);
    const id = Number(decoded.sub);
    if (!Number.isInteger(id) || id < 1) {
      return next(new AppError("Invalid access token", 401));
    }
    req.user = { id };
    return next();
  } catch (err) {
    return next(new AppError("Invalid or expired access token", 401));
  }
};

module.exports = { authenticate };
