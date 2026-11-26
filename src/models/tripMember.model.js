const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class TripMember extends Model {}

TripMember.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tripId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "trip_id",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    role: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "joined_at",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "trip_members",
    modelName: "TripMember",
    indexes: [{ unique: true, fields: ["trip_id", "user_id"] }],
  }
);

module.exports = TripMember;
