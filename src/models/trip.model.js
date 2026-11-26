const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Trip extends Model {}

Trip.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    origin: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    destination: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    organizerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "organizer_id",
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "start_date",
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "end_date",
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "OPEN",
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
    tableName: "trips",
    modelName: "Trip",
  }
);

module.exports = Trip;
