// src/app.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Load environment variables
dotenv.config();

// Import database connection
const { sequelize } = require("./config/database");

// Import routes
const clienteRoutes = require("./routes/cliente.routes");
const contratoRoutes = require("./routes/contrato.routes");
const protestoRoutes = require("./routes/protesto.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const avalistaRoutes = require("./routes/avalista.routes");
const especieRoutes = require("./routes/especie.routes");
const authRoutes = require("./routes/auth.routes");

// Import error handling middleware
const {
  errorHandler,
  notFoundHandler,
  validationErrorHandler,
} = require("./middleware/errorHandler");

// Import swagger
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
); // Enable CORS
app.use(morgan("combined")); // Logging
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded bodies

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Sistema de Gestão de Protestos Financeiros - API",
    version: "1.0.0",
    status: "running",
    documentation: "/api-docs",
  });
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();

    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      service: "protestos-api",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      service: "protestos-api",
      database: "disconnected",
      error: error.message,
    });
  }
});

// Swagger documentation endpoint
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/clientes", clienteRoutes);
app.use("/api/v1/contratos", contratoRoutes);
app.use("/api/v1/protestos", protestoRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/avalistas", avalistaRoutes);
app.use("/api/v1/especies", especieRoutes);

// Validation error handling middleware
app.use(validationErrorHandler);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (should be last)
app.use(errorHandler);

module.exports = app;
