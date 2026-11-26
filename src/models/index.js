const sequelize = require("../config/database");
const User = require("./user.model");
const RefreshToken = require("./refreshToken.model");
const Trip = require("./trip.model");
const TripMember = require("./tripMember.model");
const JoinRequest = require("./joinRequest.model");

User.hasMany(RefreshToken, {
  foreignKey: "userId",
  as: "refreshTokens",
  onDelete: "CASCADE",
});
RefreshToken.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Trip.belongsTo(User, { foreignKey: "organizerId", as: "organizer" });
User.hasMany(Trip, { foreignKey: "organizerId", as: "organizedTrips" });

Trip.hasMany(TripMember, { foreignKey: "tripId", as: "members" });
TripMember.belongsTo(Trip, { foreignKey: "tripId", as: "trip" });
User.hasMany(TripMember, { foreignKey: "userId", as: "tripMemberships" });
TripMember.belongsTo(User, { foreignKey: "userId", as: "user" });

Trip.hasMany(JoinRequest, { foreignKey: "tripId", as: "joinRequests" });
JoinRequest.belongsTo(Trip, { foreignKey: "tripId", as: "trip" });
User.hasMany(JoinRequest, { foreignKey: "userId", as: "joinRequests" });
JoinRequest.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = {
  sequelize,
  User,
  RefreshToken,
  Trip,
  TripMember,
  JoinRequest,
};
