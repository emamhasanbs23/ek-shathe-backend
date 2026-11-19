require("dotenv").config();

const sequelize = require("./config/database");

// Assign the exported model to a variable so we can call User.create(), etc.
const User = require("./models/user.model");
const Trip = require("./models/trip.model");

const startServer = async () => {
  try {
    // Checks that our credentials/host/db name can reach PostgreSQL.
    // Does not create or change any tables by itself.
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Creates missing tables from our models (learning/prototype only).
    // Later we'll use migrations instead of sync() for real schema changes.
    await sequelize.sync();
    console.log("Database tables synchronized.");
  } catch (error) {
    console.error("Unable to connect to database:", error);
  }
};

startServer();
