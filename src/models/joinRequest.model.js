const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class JoinRequest extends Model {}

JoinRequest.init(
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
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "PENDING",
    },
    decidedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "decided_at",
    },
    decidedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "decided_by",
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
    tableName: "join_requests",
    modelName: "JoinRequest",
  }
);

module.exports = JoinRequest;
