// src/routes/avalista.routes.js
const express = require('express');
const router = express.Router();
const avalistaController = require('../controllers/AvalistaController');

// Avalista routes
router.get('/', avalistaController.getAvalistas);
router.get('/:id', avalistaController.getAvalista);
router.post('/', avalistaController.createAvalista);
router.put('/:id', avalistaController.updateAvalista);
router.delete('/:id', avalistaController.deleteAvalista);

module.exports = router;