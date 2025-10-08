// src/routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/DashboardController');

// Dashboard summary endpoint
router.get('/summary', dashboardController.getSummary);

module.exports = router;
