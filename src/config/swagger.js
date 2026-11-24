const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const swaggerUi = require("swagger-ui-express");

const loadOpenApiSpec = () => {
  const file = fs.readFileSync(
    path.join(__dirname, "../docs/openapi.yaml"),
    "utf8"
  );
  return YAML.parse(file);
};

const setupSwagger = (app) => {
  const spec = loadOpenApiSpec();
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
};

module.exports = { setupSwagger, loadOpenApiSpec };
