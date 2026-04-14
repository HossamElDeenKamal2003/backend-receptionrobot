const { model } = require("mongoose");
const User = require("../../models/users");
const Order = require("../../models/order");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class LabService {
    // جلب جميع طلبات المعمل
    async getLabOrders(labId) {
        try {
            const orders = await Order.findAll({
                where: { lab_id: labId },
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

async addDoctorToLab(labId, doctorUID) {
    try {
        const lab = await User.findOne({ where: { id: labId, role: 'lab' } });
        const doctor = await User.findOne({ where: { uid: doctorUID, role: 'doctor' } });

        if (!lab) {
            throw {
                success: false,
                message: { ar: "المعمل غير موجود", en: "Lab not found" }
            };
        }

        if (!doctor) {
            throw {
                success: false,
                message: { ar: "الطبيب غير موجود", en: "Doctor not found" }
            };
        }

        // ✅ تحويل docsId من نص لـ array لو موجود
        let docsArray = [];
        if (lab.docsId) {
            try {
                docsArray = JSON.parse(lab.docsId);
            } catch (e) {
                docsArray = lab.docsId.split(',').filter(Boolean);
            }
        }

        // ✅ التحقق إذا كان الدكتور موجود بالفعل
        if (docsArray.includes(doctor.id.toString())) {
            throw {
                success: false,
                message: { ar: "الطبيب مضاف بالفعل", en: "Doctor already added" }
            };
        }

        // ✅ إضافة الدكتور
        docsArray.push(doctor.id);
        lab.docsId = JSON.stringify(docsArray);  // ✅ خزنها كـ JSON string
        await lab.save();

        return {
            success: true,
            message: { ar: "تم إضافة الطبيب إلى المعمل بنجاح", en: "Doctor added to lab successfully" },
            data: {
                lab: {
                    id: lab.id,
                    name: lab.username,
                    doctors: docsArray
                }
            }
        };
    } catch (error) {
        console.log(error);
        throw error;
    }
}
    // جلب طلب معين
    async getOrderById(orderId, labId) {
        try {
            const order = await Order.findOne({
                where: { id: orderId, lab_id: labId }
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
async getLabDoctors(labId) {
    try {
        const lab = await User.findOne({ where: { id: labId, role: 'lab' } });
        
        if (!lab) {
            throw {
                success: false,
                message: { ar: "المعمل غير موجود", en: "Lab not found" }
            };
        }

        // ✅ تحويل docsId من JSON string لـ array
        let doctorIds = [];
        if (lab.docsId) {
            try {
                doctorIds = JSON.parse(lab.docsId);
            } catch (e) {
                doctorIds = lab.docsId.split(',').filter(Boolean);
            }
        }

        // ✅ جلب بيانات الأطباء
        const doctors = await User.findAll({
            where: {
                id: doctorIds,
                role: 'doctor'
            },
            attributes: ['id', 'uid', 'username', 'phone', 'email', 'address']
        });

        return {
            success: true,
            message: { ar: "تم جلب الأطباء بنجاح", en: "Doctors fetched successfully" },
            data: doctors
        };
    } catch (error) {
        console.log(error);
        throw error;
    }
}
// إضافة عقد جديد للمعمل
    async addContract(labId, contractData) {
        try {
            const lab = await User.findOne({ where: { id: labId, role: 'lab' } });
            
            if (!lab) {
                throw {
                    success: false,
                    message: { ar: "المعمل غير موجود", en: "Lab not found" }
                };
            }

            // ✅ جلب العقود الموجودة
            let contracts = [];
            if (lab.labContract) {
                try {
                    contracts = JSON.parse(lab.labContract);
                } catch (e) {
                    contracts = [];
                }
            }

            // ✅ إنشاء عقد جديد
            const newContract = {
                id: Date.now().toString(),
                name: contractData.name,
                description: contractData.description,
                services: contractData.services, // [{ name, price }, ...]
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            contracts.push(newContract);
            lab.labContract = JSON.stringify(contracts);
            await lab.save();

            return {
                success: true,
                message: { ar: "تم إضافة العقد بنجاح", en: "Contract added successfully" },
                data: newContract
            };
        } catch (error) {
            throw error;
        }
    }

    // تحديث عقد موجود
    async updateContract(labId, contractId, updateData) {
        try {
            const lab = await User.findOne({ where: { id: labId, role: 'lab' } });
            
            if (!lab) {
                throw {
                    success: false,
                    message: { ar: "المعمل غير موجود", en: "Lab not found" }
                };
            }

            let contracts = [];
            if (lab.labContract) {
                try {
                    contracts = JSON.parse(lab.labContract);
                } catch (e) {
                    contracts = [];
                }
            }

            const contractIndex = contracts.findIndex(c => c.id === contractId);
            if (contractIndex === -1) {
                throw {
                    success: false,
                    message: { ar: "العقد غير موجود", en: "Contract not found" }
                };
            }

            contracts[contractIndex] = {
                ...contracts[contractIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            lab.labContract = JSON.stringify(contracts);
            await lab.save();

            return {
                success: true,
                message: { ar: "تم تحديث العقد بنجاح", en: "Contract updated successfully" },
                data: contracts[contractIndex]
            };
        } catch (error) {
            throw error;
        }
    }

    // جلب كل عقود المعمل
    async getContracts(labId) {
        try {
            const lab = await User.findOne({ where: { id: labId, role: 'lab' } });
            
            if (!lab) {
                throw {
                    success: false,
                    message: { ar: "المعمل غير موجود", en: "Lab not found" }
                };
            }

            let contracts = [];
            if (lab.labContract) {
                try {
                    contracts = JSON.parse(lab.labContract);
                } catch (e) {
                    contracts = [];
                }
            }

            return {
                success: true,
                message: { ar: "تم جلب العقود بنجاح", en: "Contracts fetched successfully" },
                data: contracts
            };
        } catch (error) {
            throw error;
        }
    }

    // حذف عقد
    async deleteContract(labId, contractId) {
        try {
            const lab = await User.findOne({ where: { id: labId, role: 'lab' } });
            
            if (!lab) {
                throw {
                    success: false,
                    message: { ar: "المعمل غير موجود", en: "Lab not found" }
                };
            }

            let contracts = [];
            if (lab.labContract) {
                try {
                    contracts = JSON.parse(lab.labContract);
                } catch (e) {
                    contracts = [];
                }
            }

            const newContracts = contracts.filter(c => c.id !== contractId);
            lab.labContract = JSON.stringify(newContracts);
            await lab.save();

            return {
                success: true,
                message: { ar: "تم حذف العقد بنجاح", en: "Contract deleted successfully" }
            };
        } catch (error) {
            throw error;
        }
    }

    // إضافة خدمة لعقد معين
    async addServiceToContract(labId, contractId, service) {
        try {
            const lab = await User.findOne({ where: { id: labId, role: 'lab' } });
            
            if (!lab) {
                throw {
                    success: false,
                    message: { ar: "المعمل غير موجود", en: "Lab not found" }
                };
            }

            let contracts = [];
            if (lab.labContract) {
                try {
                    contracts = JSON.parse(lab.labContract);
                } catch (e) {
                    contracts = [];
                }
            }

            const contractIndex = contracts.findIndex(c => c.id === contractId);
            if (contractIndex === -1) {
                throw {
                    success: false,
                    message: { ar: "العقد غير موجود", en: "Contract not found" }
                };
            }

            const newService = {
                id: Date.now().toString(),
                name: service.name,
                price: service.price,
                description: service.description || ""
            };

            if (!contracts[contractIndex].services) {
                contracts[contractIndex].services = [];
            }
            contracts[contractIndex].services.push(newService);
            contracts[contractIndex].updatedAt = new Date().toISOString();

            lab.labContract = JSON.stringify(contracts);
            await lab.save();

            return {
                success: true,
                message: { ar: "تم إضافة الخدمة بنجاح", en: "Service added successfully" },
                data: newService
            };
        } catch (error) {
            throw error;
        }
    }
    // تحديث حالة الطلب
    async updateOrderStatus(orderId, labId, status) {
        try {
            const order = await Order.findOne({
                where: { id: orderId, lab_id: labId }
            });
            
            if (!order) {
                throw {
                    success: false,
                    message: { ar: "الطلب غير موجود", en: "Order not found" }
                };
            }

            await order.update({ status });
            
            return {
                success: true,
                message: { ar: "تم تحديث حالة الطلب بنجاح", en: "Order status updated successfully" },
                data: order
            };
        } catch (error) {
            throw error;
        }
    }

    // تحديث سعر الطلب
    async updateOrderPrice(orderId, labId, price) {
        try {
            const order = await Order.findOne({
                where: { id: orderId, lab_id: labId }
            });
            
            if (!order) {
                throw {
                    success: false,
                    message: { ar: "الطلب غير موجود", en: "Order not found" }
                };
            }

            await order.update({ price });
            
            return {
                success: true,
                message: { ar: "تم تحديث سعر الطلب بنجاح", en: "Order price updated successfully" },
                data: order
            };
        } catch (error) {
            throw error;
        }
    }

    // رفع ملفات للطلب
    async uploadOrderFiles(orderId, labId, files) {
        try {
            const order = await Order.findOne({
                where: { id: orderId, lab_id: labId }
            });
            
            if (!order) {
                throw {
                    success: false,
                    message: { ar: "الطلب غير موجود", en: "Order not found" }
                };
            }

            const updateData = {};
            if (files.image) updateData.image = files.image;
            if (files.image1) updateData.image1 = files.image1;
            if (files.image2) updateData.image2 = files.image2;
            if (files.file) updateData.file = files.file;
            if (files.video) updateData.video = files.video;

            await order.update(updateData);
            
            return {
                success: true,
                message: { ar: "تم رفع الملفات بنجاح", en: "Files uploaded successfully" },
                data: order
            };
        } catch (error) {
            throw error;
        }
    }

    // جلب طلبات حسب الحالة
    async getOrdersByStatus(labId, status) {
        try {
            const orders = await Order.findAll({
                where: { lab_id: labId, status },
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

    // إحصائيات الطلبات
    async getOrdersStats(labId) {
        try {
            const allOrders = await Order.findAll({ where: { lab_id: labId } });
            
            const stats = {
                total: allOrders.length,
                pending: allOrders.filter(o => o.status.includes('(P)')).length,
                finished: allOrders.filter(o => o.status.includes('(F)')).length,
                underway: allOrders.filter(o => o.status.startsWith('UNDERWAY')).length,
                ready: allOrders.filter(o => o.status.startsWith('LabReady')).length,
                totalRevenue: allOrders.reduce((sum, o) => sum + (parseFloat(o.price) || 0), 0)
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

    // تحديث حالة الدفع
    async updatePaymentStatus(orderId, labId, paid) {
        try {
            const order = await Order.findOne({
                where: { id: orderId, lab_id: labId }
            });
            
            if (!order) {
                throw {
                    success: false,
                    message: { ar: "الطلب غير موجود", en: "Order not found" }
                };
            }

            await order.update({ paid });
            
            return {
                success: true,
                message: { ar: "تم تحديث حالة الدفع بنجاح", en: "Payment status updated successfully" },
                data: order
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new LabService();