const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");
const { authMiddleware, doctorMiddleware } = require("../../middlewares/auth");

router.use(authMiddleware, doctorMiddleware);

// ========== Order CRUD ==========
router.post("/orders", orderController.createOrder);
router.get("/orders", orderController.getDoctorOrders);
router.get("/orders/stats", orderController.getDoctorStats);
router.get("/orders/:orderId", orderController.getDoctorOrderById);
router.put("/orders/:orderId", orderController.updateDoctorOrder);
router.post("/orders/:orderId/send-to-lab", orderController.sendToLab);
router.post("/orders/:orderId/confirm", orderController.confirmLabReady);

// ========== Order Filters ==========
router.get("/orders/date", orderController.getOrdersByDate);           // ?startDate=2024-01-01&endDate=2024-12-31
router.get("/orders/status/:status", orderController.getOrdersByStatus); // pending, finished, underway, docready

// ========== Lab Management for Doctor ==========
router.get("/labs", orderController.getDoctorLabs);
router.get("/labs/:labId", orderController.getDoctorLabById);
router.get("/labs/:labId/contracts", orderController.getDoctorLabContracts);
router.get("/labs/:labId/contract", orderController.getMyContract);    // جلب عقد الدكتور مع معمل معين

module.exports = router;