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
     async getDoctorLabs(req, res) {
        try {
            const doctorId = req.user.id;
            console.log("doctorId:", doctorId);
            const result = await orderService.getDoctorLabs(doctorId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // جلب معمل معين للدكتور
    async getDoctorLabById(req, res) {
        try {
            const doctorId = req.user.id;
            const { labId } = req.params;
            const result = await orderService.getDoctorLabById(doctorId, labId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }
// order.controller.js - أضف الدوال دي

// جلب طلبات حسب التاريخ
async getOrdersByDate(req, res) {
    try {
        const doctorId = req.user.id;
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: { ar: "تاريخ البداية والنهاية مطلوب", en: "Start date and end date are required" }
            });
        }
        
        const result = await orderService.getDoctorOrdersByDate(doctorId, startDate, endDate);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
        });
    }
}

// جلب طلبات حسب الحالة
async getOrdersByStatus(req, res) {
    try {
        const doctorId = req.user.id;
        const { status } = req.params;
        
        const result = await orderService.getDoctorOrdersByStatus(doctorId, status);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
        });
    }
}

// جلب عقد الدكتور مع معمل
async getMyContract(req, res) {
    try {
        const doctorId = req.user.id;
        const { labId } = req.params;
        
        const result = await orderService.getMyContractWithLab(doctorId, labId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
        });
    }
}
    // جلب عقود معمل معين للدكتور
    async getDoctorLabContracts(req, res) {
        try {
            const doctorId = req.user.id;
            const { labId } = req.params;
            const result = await orderService.getDoctorLabContracts(doctorId, labId);
            res.status(200).json(result);
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