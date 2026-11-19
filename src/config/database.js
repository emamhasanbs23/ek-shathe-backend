const { Sequelize } = require("sequelize");
require("dotenv").config();

// This Sequelize instance is our app's connection to PostgreSQL.
// It holds host/db/user settings and is used by every model.
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "postgres",
    logging: console.log, // prints the SQL Sequelize generates (helpful while learning)
  }
);

module.exports = sequelize;
