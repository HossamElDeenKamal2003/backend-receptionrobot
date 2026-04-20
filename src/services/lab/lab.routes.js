const express = require("express");
const router = express.Router();
const labController = require("./lab.controller");
const { authMiddleware, labMiddleware } = require("../../middlewares/auth");

router.use(authMiddleware, labMiddleware);

// ========== Doctor Management ==========
router.post("/doctors", labController.addDoctorToLab);
router.delete("/doctors/:doctorUID", labController.removeDoctorFromLab);  // ✅ إضافة حذف دكتور
router.get("/doctors", labController.getLabDoctors);

// ========== Contract Management (مرتبطة بالدكتور) ==========
router.post("/doctors/:doctorId/contracts", labController.addContract);
router.get("/doctors/:doctorId/contracts", labController.getDoctorContracts);
router.get("/doctors/:doctorId/contracts/:contractId", labController.getContractById);
router.put("/doctors/:doctorId/contracts/:contractId", labController.updateContract);
router.delete("/doctors/:doctorId/contracts/:contractId", labController.deleteContract);
router.post("/doctors/:doctorId/contracts/:contractId/services", labController.addServiceToContract);

// ========== Orders Management ==========
router.get("/orders", labController.getLabOrders);
router.get("/orders/stats", labController.getOrdersStats);
router.get("/orders/status/:status", labController.getOrdersByStatus);
router.get("/orders/:orderId", labController.getOrderById);
router.put("/orders/:orderId/status", labController.updateOrderStatus);
router.put("/orders/:orderId/price", labController.updateOrderPrice);
router.put("/orders/:orderId/payment", labController.updateOrderPayment);  // ✅ تعديل (updatePaymentStatus -> updateOrderPayment)
router.put("/orders/:orderId/teeth", labController.updateOrderTeethNumber);  // ✅ إضافة تحديث عدد الأسنان
router.put("/orders/:orderId/mark-ready", labController.markOrderAsReady);  // ✅ إضافة تعليم الطلب كجاهز
router.post("/orders/:orderId/files", labController.uploadOrderFiles);

// ========== Billing ==========
router.get("/billing/stats", labController.getBillingStats);  // ✅ إضافة الفواتير

module.exports = router;