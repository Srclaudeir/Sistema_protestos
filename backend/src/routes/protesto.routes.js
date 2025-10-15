// src/routes/protesto.routes.js
const express = require("express");
const router = express.Router();
const protestoController = require("../controllers/ProtestoController");

// Protesto routes
router.get("/export", protestoController.exportProtestos); // Must be before /:id
router.get("/", protestoController.getProtestos);
router.get("/:id", protestoController.getProtesto);
router.post("/", protestoController.createProtesto);
router.put("/:id", protestoController.updateProtesto);
router.delete("/:id", protestoController.deleteProtesto);

module.exports = router;
