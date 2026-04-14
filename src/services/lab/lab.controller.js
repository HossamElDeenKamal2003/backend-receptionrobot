const labService = require("./lab.service");

class LabController {
    // جلب جميع طلبات المعمل
    async getLabOrders(req, res) {
        try {
            const labId = req.user.id;
            const result = await labService.getLabOrders(labId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: { ar: "خطأ في الخادم", en: "Server error" },
                error: error.message
            });
        }
    }
     async addDoctorToLab(req, res) {
        try {
            const labId = req.user.id;
            const { doctorUID } = req.body;
            
            if (!doctorUID) {
                return res.status(400).json({
                    success: false,
                    message: { ar: "معرف الطبيب مطلوب", en: "Doctor UID is required" }
                });
            }
            
            const result = await labService.addDoctorToLab(labId, doctorUID);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // جلب أطباء المعمل
    async getLabDoctors(req, res) {
        try {
            const labId = req.user.id;
            const result = await labService.getLabDoctors(labId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // ========== Contract Endpoints ==========
    
    async addContract(req, res) {
        try {
            const labId = req.user.id;
            const result = await labContractService.addContract(labId, req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    async getContracts(req, res) {
        try {
            const labId = req.user.id;
            const result = await labContractService.getContracts(labId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    async updateContract(req, res) {
        try {
            const labId = req.user.id;
            const { contractId } = req.params;
            const result = await labContractService.updateContract(labId, contractId, req.body);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    async deleteContract(req, res) {
        try {
            const labId = req.user.id;
            const { contractId } = req.params;
            const result = await labContractService.deleteContract(labId, contractId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    async addServiceToContract(req, res) {
        try {
            const labId = req.user.id;
            const { contractId } = req.params;
            const result = await labContractService.addServiceToContract(labId, contractId, req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // جلب طلب معين
    async getOrderById(req, res) {
        try {
            const labId = req.user.id;
            const { orderId } = req.params;
            const result = await labService.getOrderById(orderId, labId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // تحديث حالة الطلب
    async updateOrderStatus(req, res) {
        try {
            const labId = req.user.id;
            const { orderId } = req.params;
            const { status } = req.body;
            
            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: { ar: "الحالة مطلوبة", en: "Status is required" }
                });
            }
            
            const result = await labService.updateOrderStatus(orderId, labId, status);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // تحديث سعر الطلب
    async updateOrderPrice(req, res) {
        try {
            const labId = req.user.id;
            const { orderId } = req.params;
            const { price } = req.body;
            
            const result = await labService.updateOrderPrice(orderId, labId, price);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // رفع ملفات
    async uploadOrderFiles(req, res) {
        try {
            const labId = req.user.id;
            const { orderId } = req.params;
            const files = req.body; // أو req.files إذا كنت تستخدم multer
            
            const result = await labService.uploadOrderFiles(orderId, labId, files);
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
            const labId = req.user.id;
            const { status } = req.params;
            const result = await labService.getOrdersByStatus(labId, status);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // إحصائيات الطلبات
    async getOrdersStats(req, res) {
        try {
            const labId = req.user.id;
            const result = await labService.getOrdersStats(labId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // تحديث حالة الدفع
    async updatePaymentStatus(req, res) {
        try {
            const labId = req.user.id;
            const { orderId } = req.params;
            const { paid } = req.body;
            
            const result = await labService.updatePaymentStatus(orderId, labId, paid);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }
}

module.exports = new LabController();