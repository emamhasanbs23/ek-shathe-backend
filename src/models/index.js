const sequelize = require("../config/database");
const User = require("./user.model");
const RefreshToken = require("./refreshToken.model");
const Trip = require("./trip.model");

User.hasMany(RefreshToken, {
  foreignKey: "userId",
  as: "refreshTokens",
  onDelete: "CASCADE",
});
RefreshToken.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

module.exports = { sequelize, User, RefreshToken, Trip };
