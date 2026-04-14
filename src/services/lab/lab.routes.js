const express = require("express");
const router = express.Router();
const labController = require("./lab.controller");
const { authMiddleware, labMiddleware } = require(".././../middlewares/auth");

router.use(authMiddleware, labMiddleware);

// Doctor management
router.post("/doctors", labController.addDoctorToLab);
router.get("/doctors", labController.getLabDoctors);

// Contract management
router.post("/contracts", labController.addContract);
router.get("/contracts", labController.getContracts);
router.put("/contracts/:contractId", labController.updateContract);
router.delete("/contracts/:contractId", labController.deleteContract);
router.post("/contracts/:contractId/services", labController.addServiceToContract);

// Orders management (existing)
router.get("/orders", labController.getLabOrders);
router.get("/orders/stats", labController.getOrdersStats);
router.get("/orders/status/:status", labController.getOrdersByStatus);
router.get("/orders/:orderId", labController.getOrderById);
router.put("/orders/:orderId/status", labController.updateOrderStatus);
router.put("/orders/:orderId/price", labController.updateOrderPrice);
router.put("/orders/:orderId/payment", labController.updatePaymentStatus);
router.post("/orders/:orderId/files", labController.uploadOrderFiles);

module.exports = router;