// src/routes/contrato.routes.js
const express = require('express');
const router = express.Router();
const contratoController = require('../controllers/ContratoController');

// Contrato routes
router.get('/', contratoController.getContratos);
router.get('/:id', contratoController.getContrato);
router.post('/', contratoController.createContrato);
router.put('/:id', contratoController.updateContrato);
router.delete('/:id', contratoController.deleteContrato);

module.exports = router;