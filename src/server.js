require("dotenv").config();

const sequelize = require("./config/database");
require("./models");
const { createApp } = require("./app");

const PORT = Number(process.env.PORT) || 5050;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    await sequelize.sync({ alter: true });
    console.log("Database tables synchronized.");

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
