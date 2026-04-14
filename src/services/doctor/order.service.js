const Order = require("../../models/order");
const User = require("../../models/users");

class OrderService {
    // إنشاء طلب جديد من الدكتور
    async createOrder(orderData, doctorId) {
        try {
            // التحقق من وجود المعمل
            const lab = await User.findOne({
                where: { id: orderData.lab_id, role: 'lab' }
            });
            
            if (!lab) {
                throw {
                    success: false,
                    message: { ar: "المعمل غير موجود", en: "Lab not found" }
                };
            }

            const order = await Order.create({
                ...orderData,
                doc_id: doctorId,
                status: "DocReady(P)",
                docReady: true
            });
            
            return {
                success: true,
                message: { ar: "تم إنشاء الطلب بنجاح", en: "Order created successfully" },
                data: order
            };
        } catch (error) {
            throw error;
        }
    }

    // جلب طلبات الدكتور
    async getDoctorOrders(doctorId) {
        try {
            const orders = await Order.findAll({
                where: { doc_id: doctorId },
                order: [['created_at', 'DESC']]
            });
            
            return {
                success: true,
                message: { ar: "تم جلب الطلبات بنجاح", en: "Orders fetched successfully" },
                data: orders
            };
        } catch (error) {
            throw error;
        }
    }

    // جلب طلب معين للدكتور
    async getDoctorOrderById(orderId, doctorId) {
        try {
            const order = await Order.findOne({
                where: { id: orderId, doc_id: doctorId }
            });
            
            if (!order) {
                throw {
                    success: false,
                    message: { ar: "الطلب غير موجود", en: "Order not found" }
                };
            }
            
            return {
                success: true,
                message: { ar: "تم جلب الطلب بنجاح", en: "Order fetched successfully" },
                data: order
            };
        } catch (error) {
            throw error;
        }
    }

    // تحديث الطلب من قبل الدكتور
    async updateDoctorOrder(orderId, doctorId, updateData) {
        try {
            const order = await Order.findOne({
                where: { id: orderId, doc_id: doctorId }
            });
            
            if (!order) {
                throw {
                    success: false,
                    message: { ar: "الطلب غير موجود", en: "Order not found" }
                };
            }

            // لا يمكن تعديل الطلب إذا كان في حالة متقدمة
            const blockedStatuses = ['LabReady(P)', 'LabReady(F)', 'OTW_DOC(P)', 'OTW_DOC(F)', 'END(P)', 'END(F)'];
            if (blockedStatuses.includes(order.status)) {
                throw {
                    success: false,
                    message: { ar: "لا يمكن تعديل الطلب في هذه المرحلة", en: "Cannot edit order at this stage" }
                };
            }

            await order.update(updateData);
            
            return {
                success: true,
                message: { ar: "تم تحديث الطلب بنجاح", en: "Order updated successfully" },
                data: order
            };
        } catch (error) {
            throw error;
        }
    }

    // إرسال طلب للمعمل
    async sendToLab(orderId, doctorId) {
        try {
            const order = await Order.findOne({
                where: { id: orderId, doc_id: doctorId }
            });
            
            if (!order) {
                throw {
                    success: false,
                    message: { ar: "الطلب غير موجود", en: "Order not found" }
                };
            }

            await order.update({ 
                status: "OTW_LAB(P)",
                docReady: false
            });
            
            return {
                success: true,
                message: { ar: "تم إرسال الطلب للمعمل بنجاح", en: "Order sent to lab successfully" },
                data: order
            };
        } catch (error) {
            throw error;
        }
    }

    // تأكيد استلام الطلب من المعمل
    async confirmLabReady(orderId, doctorId) {
        try {
            const order = await Order.findOne({
                where: { id: orderId, doc_id: doctorId }
            });
            
            if (!order) {
                throw {
                    success: false,
                    message: { ar: "الطلب غير موجود", en: "Order not found" }
                };
            }

            await order.update({ status: "END(P)" });
            
            return {
                success: true,
                message: { ar: "تم تأكيد استلام الطلب", en: "Order receipt confirmed" },
                data: order
            };
        } catch (error) {
            throw error;
        }
    }

    // إحصائيات طلبات الدكتور
    async getDoctorStats(doctorId) {
        try {
            const orders = await Order.findAll({ where: { doc_id: doctorId } });
            
            const stats = {
                total: orders.length,
                withLab: orders.filter(o => o.status !== 'DocReady(P)').length,
                pending: orders.filter(o => o.status.includes('(P)')).length,
                finished: orders.filter(o => o.status.includes('(F)')).length,
                totalSpent: orders.reduce((sum, o) => sum + (parseFloat(o.price) || 0), 0)
            };
            
            return {
                success: true,
                message: { ar: "تم جلب الإحصائيات بنجاح", en: "Stats fetched successfully" },
                data: stats
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new OrderService();