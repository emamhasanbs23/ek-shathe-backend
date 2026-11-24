const authService = require("./auth.service");
const { sendSuccess } = require("../../common/response");

const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    return sendSuccess(res, data, 201, "Registered successfully");
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const data = await authService.refresh(req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.body);
    return sendSuccess(res, null, 200, "Logged out");
  } catch (err) {
    return next(err);
  }
};

module.exports = { register, login, refresh, logout };
