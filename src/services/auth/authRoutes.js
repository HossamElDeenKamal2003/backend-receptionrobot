// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const AuthHandler = require("./auth.handler");
const {authMiddleware} = require("../../middlewares/auth");

// Public routes
router.post("/register", AuthHandler.createUser);
router.post("/login", AuthHandler.login);

// Protected routes
router.get("/profile", authMiddleware, AuthHandler.getUserProfile);
router.put("/profile", authMiddleware, AuthHandler.updateUser);
router.put("/change-password", authMiddleware, AuthHandler.changePassword);
router.delete("/profile", authMiddleware, AuthHandler.deleteUser);

// Admin routes
router.get("/users", authMiddleware, AuthHandler.getAllUsers);
router.delete("/users/:id", authMiddleware, AuthHandler.deleteUser);
router.put("/users/:id", authMiddleware, AuthHandler.updateUser);

module.exports = router;