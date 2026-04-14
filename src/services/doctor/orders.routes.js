const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");
const { authMiddleware, doctorMiddleware } = require('../../middlewares/auth');

// جميع routes تحتاج مصادقة ودور دكتور
router.use(authMiddleware, doctorMiddleware);

// إنشاء طلب جديد
router.post("/orders", orderController.createOrder);

// جلب جميع طلبات الدكتور
router.get("/orders", orderController.getDoctorOrders);

// إحصائيات الدكتور
router.get("/orders/stats", orderController.getDoctorStats);

// جلب طلب معين
router.get("/orders/:orderId", orderController.getDoctorOrderById);

// تحديث الطلب
router.put("/orders/:orderId", orderController.updateDoctorOrder);

// إرسال طلب للمعمل
router.post("/orders/:orderId/send-to-lab", orderController.sendToLab);

// تأكيد استلام الطلب من المعمل
router.post("/orders/:orderId/confirm", orderController.confirmLabReady);

module.exports = router;