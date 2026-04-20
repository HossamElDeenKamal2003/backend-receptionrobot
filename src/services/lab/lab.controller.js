const labService = require("./lab.service");

class LabController {
    // جلب جميع طلبات المعمل
    async getLabOrders(req, res) {
        try {
            const labId = req.user.id;
            const result = await labService.getLabOrders(labId);
            console.log("Orders fetched successfully for lab ID:", labId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: { ar: "خطأ في الخادم", en: "Server error" },
                error: error.message
            });
        }
    }

    // إضافة دكتور للمعمل
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

    // إزالة دكتور من المعمل
    async removeDoctorFromLab(req, res) {
        try {
            const labId = req.user.id;
            const { doctorUID } = req.params;
            
            if (!doctorUID) {
                return res.status(400).json({
                    success: false,
                    message: { ar: "معرف الطبيب مطلوب", en: "Doctor UID is required" }
                });
            }
            
            const result = await labService.removeDoctorFromLab(labId, doctorUID);
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

    // ========== Contract Endpoints (مرتبطة بالدكتور) ==========
    
    // إضافة عقد لدكتور معين
    async addContract(req, res) {
        try {
            const labId = req.user.id;
            const { doctorId } = req.params;
            console.log("All params:", req.params);
            if (!doctorId) {
                return res.status(400).json({
                    success: false,
                    message: { ar: "معرف الطبيب مطلوب", en: "Doctor ID is required" }
                });
            }
            
            const result = await labService.addContract(labId, doctorId, req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // جلب عقود دكتور معين
    async getDoctorContracts(req, res) {
        try {
            const labId = req.user.id;
            const { doctorId } = req.params;
            
            if (!doctorId) {
                return res.status(400).json({
                    success: false,
                    message: { ar: "معرف الطبيب مطلوب", en: "Doctor ID is required" }
                });
            }
            
            const result = await labService.getDoctorContracts(labId, doctorId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // جلب عقد معين لدكتور معين
    async getContractById(req, res) {
        try {
            const labId = req.user.id;
            const { doctorId, contractId } = req.params;
            
            const result = await labService.getContractById(labId, doctorId, contractId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // تحديث عقد دكتور معين
    async updateContract(req, res) {
        try {
            const labId = req.user.id;
            const { doctorId, contractId } = req.params;
            
            const result = await labService.updateContract(labId, doctorId, contractId, req.body);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // حذف عقد دكتور معين
    async deleteContract(req, res) {
        try {
            const labId = req.user.id;
            const { doctorId, contractId } = req.params;
            
            const result = await labService.deleteContract(labId, doctorId, contractId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // إضافة خدمة لعقد دكتور معين
    async addServiceToContract(req, res) {
        try {
            const labId = req.user.id;
            const { doctorId, contractId } = req.params;
            
            const result = await labService.addServiceToContract(labId, doctorId, contractId, req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // ========== Orders Endpoints ==========

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

    // تحديث حالة الدفع مع rest
    async updateOrderPayment(req, res) {
        try {
            const labId = req.user.id;
            const { orderId } = req.params;
            const { paid } = req.body;
            
            if (typeof paid !== 'number' || paid < 0) {
                return res.status(400).json({
                    success: false,
                    message: { ar: "المبلغ المدفوع يجب أن يكون رقماً موجباً", en: "Paid amount must be a positive number" }
                });
            }
            
            const result = await labService.updateOrderPayment(orderId, labId, paid);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // تحديث عدد الأسنان في الطلب
    async updateOrderTeethNumber(req, res) {
        try {
            const labId = req.user.id;
            const { orderId } = req.params;
            const { teethNumber } = req.body;
            
            if (!teethNumber || teethNumber < 0) {
                return res.status(400).json({
                    success: false,
                    message: { ar: "عدد الأسنان مطلوب", en: "Teeth number is required" }
                });
            }
            
            const result = await labService.updateOrderTeethNumber(orderId, labId, teethNumber);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || { ar: "خطأ في الخادم", en: "Server error" }
            });
        }
    }

    // تحديد الطلب كـ Lab Ready
    async markOrderAsReady(req, res) {
        try {
            const labId = req.user.id;
            const { orderId } = req.params;
            
            const result = await labService.markOrderAsReady(orderId, labId);
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
            const files = req.body;
            
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

    // إحصائيات الفواتير
    async getBillingStats(req, res) {
        try {
            const labId = req.user.id;
            const { startDate, endDate } = req.query;
            
            const result = await labService.getBillingStats(labId, startDate, endDate);
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