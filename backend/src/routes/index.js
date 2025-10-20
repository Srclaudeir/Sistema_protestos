// src/routes/index.js
const express = require("express");
const router = express.Router();

// Import route modules
const clienteRoutes = require("./cliente.routes");
const contratoRoutes = require("./contrato.routes");
const protestoRoutes = require("./protesto.routes");
const avalistaRoutes = require("./avalista.routes");
const especieRoutes = require("./especie.routes");
const userRoutes = require("./user.routes");
const healthRoutes = require("./health.routes");

// Mount routes
router.use("/clientes", clienteRoutes);
router.use("/contratos", contratoRoutes);
router.use("/protestos", protestoRoutes);
router.use("/avalistas", avalistaRoutes);
router.use("/especies", especieRoutes);
router.use("/users", userRoutes);
router.use("/health", healthRoutes);

module.exports = router;
