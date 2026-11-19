const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Trip maps to the "trips" table.
// organizerId is a plain integer for now; we'll add a real foreign key later.
class Trip extends Model {}

Trip.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    destination: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    organizerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "organizer_id", // JS: organizerId  →  DB column: organizer_id
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
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "open",
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
