const sendSuccess = (res, data, statusCode = 200, message) => {
  const body = { success: true, data };
  if (message) body.message = message;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess };
