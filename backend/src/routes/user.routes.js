// src/routes/user.routes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const { authenticate, authorize } = require("../middleware/auth");

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize("admin"));

// Get all users
router.get("/", userController.getAllUsers);

// Create user (by admin)
router.post("/", userController.createUserByAdmin);

// Update user role
router.put("/:id/role", userController.updateUserRole);

// Toggle user status (activate/deactivate)
router.put("/:id/toggle-status", userController.toggleUserStatus);

module.exports = router;
