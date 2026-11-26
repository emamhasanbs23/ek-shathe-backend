const express = require("express");
const errorHandler = require("./common/errorHandler");
const { setupSwagger } = require("./config/swagger");
const authRoutes = require("./modules/auth/auth.routes");
const tripRoutes = require("./modules/trips/trip.routes");

const createApp = () => {
  const app = express();
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (req, res) => {
    res.status(200).json({ success: true, data: { status: "ok" } });
  });

  setupSwagger(app);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/trips", tripRoutes);

  app.use(errorHandler);
  return app;
};

module.exports = { createApp };
