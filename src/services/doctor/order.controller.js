const orderService = require("./order.service");

class OrderController {
    // إنشاء طلب جديد
    async createOrder(req, res) {
        try {
            const doctorId = req.user.id;
            const result = await orderService.createOrder(req.body, doctorId);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // جلب طلبات الدكتور
    async getDoctorOrders(req, res) {
        try {
            const doctorId = req.user.id;
            const result = await orderService.getDoctorOrders(doctorId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // جلب طلب معين
    async getDoctorOrderById(req, res) {
        try {
            const doctorId = req.user.id;
            const { orderId } = req.params;
            const result = await orderService.getDoctorOrderById(orderId, doctorId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // تحديث الطلب
    async updateDoctorOrder(req, res) {
        try {
            const doctorId = req.user.id;
            const { orderId } = req.params;
            const result = await orderService.updateDoctorOrder(orderId, doctorId, req.body);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // إرسال طلب للمعمل
    async sendToLab(req, res) {
        try {
            const doctorId = req.user.id;
            const { orderId } = req.params;
            const result = await orderService.sendToLab(orderId, doctorId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // تأكيد استلام الطلب
    async confirmLabReady(req, res) {
        try {
            const doctorId = req.user.id;
            const { orderId } = req.params;
            const result = await orderService.confirmLabReady(orderId, doctorId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // إحصائيات الدكتور
    async getDoctorStats(req, res) {
        try {
            const doctorId = req.user.id;
            const result = await orderService.getDoctorStats(doctorId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }
}

module.exports = new OrderController();