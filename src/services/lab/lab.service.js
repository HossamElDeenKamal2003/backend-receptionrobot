const User = require("../../models/users");
const Order = require("../../models/order");

class LabService {
    // جلب جميع طلبات المعمل
    async getLabOrders(labId) {
        try {
            console.log("Fetching orders for lab ID:", labId);
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

    // إضافة دكتور للمعمل
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

            let docsArray = [];
            if (lab.docsId) {
                try {
                    docsArray = JSON.parse(lab.docsId);
                } catch (e) {
                    docsArray = lab.docsId.split(',').filter(Boolean);
                }
            }

            if (docsArray.includes(doctor.id.toString())) {
                throw {
                    success: false,
                    message: { ar: "الطبيب مضاف بالفعل", en: "Doctor already added" }
                };
            }

            docsArray.push(doctor.id);
            lab.docsId = JSON.stringify(docsArray);
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

    // جلب أطباء المعمل
    async getLabDoctors(labId) {
        try {
            const lab = await User.findOne({ where: { id: labId, role: 'lab' } });
            
            if (!lab) {
                throw {
                    success: false,
                    message: { ar: "المعمل غير موجود", en: "Lab not found" }
                };
            }

            let doctorIds = [];
            if (lab.docsId) {
                try {
                    doctorIds = JSON.parse(lab.docsId);
                } catch (e) {
                    doctorIds = lab.docsId.split(',').filter(Boolean);
                }
            }

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

    // ========== CONTRACT METHODS (مرتبطة بالدكتور) ==========

async addContract(labId, doctorId, contractData) {
    try {
        const lab = await User.findOne({ where: { id: labId, role: 'lab' } });
        const doctor = await User.findOne({ where: { id: doctorId, role: 'doctor' } });
        
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

        // ✅ اصلح المقارنة هنا
        let docsArray = [];
        if (lab.docsId) {
            try {
                // لو كان JSON string
                if (lab.docsId.startsWith('[')) {
                    docsArray = JSON.parse(lab.docsId);
                } else {
                    // لو كان CSV
                    docsArray = lab.docsId.split(',').filter(Boolean);
                }
            } catch (e) {
                docsArray = [];
            }
        }

        // ✅ تأكد من تحويل الكل لنفس النوع (string)
        const doctorIdStr = String(doctorId);
        const docsArrayStr = docsArray.map(id => String(id));
        
        console.log("Doctor ID to check:", doctorIdStr);
        console.log("Lab doctors IDs:", docsArrayStr);
        
        if (!docsArrayStr.includes(doctorIdStr)) {
            throw {
                success: false,
                message: { 
                    ar: `هذا الطبيب ليس ضمن أطباء المعمل. أطباء المعمل: ${docsArrayStr.join(', ')}`, 
                    en: `This doctor is not in your lab. Lab doctors: ${docsArrayStr.join(', ')}` 
                }
            };
        }

        // جلب العقود الحالية للدكتور
        let doctorContracts = [];
        if (doctor.labContract) {
            try {
                doctorContracts = JSON.parse(doctor.labContract);
                if (!Array.isArray(doctorContracts)) {
                    doctorContracts = [];
                }
            } catch (e) {
                doctorContracts = [];
            }
        }

        const newContract = {
            id: Date.now().toString(),
            labId: labId,
            labName: lab.username,
            name: contractData.name,
            description: contractData.description || "",
            services: contractData.services || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        doctorContracts.push(newContract);
        doctor.labContract = JSON.stringify(doctorContracts);
        await doctor.save();

        return {
            success: true,
            message: { ar: "تم إضافة العقد للطبيب بنجاح", en: "Contract added to doctor successfully" },
            data: newContract
        };
    } catch (error) {
        console.error("Add contract error:", error);
        throw error;
    }
}
    // جلب عقود دكتور معين
    async getDoctorContracts(labId, doctorId) {
        try {
            const lab = await User.findOne({ where: { id: labId, role: 'lab' } });
            const doctor = await User.findOne({ where: { id: doctorId, role: 'doctor' } });
            
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

            let contracts = [];
            if (doctor.labContract) {
                try {
                    contracts = JSON.parse(doctor.labContract);
                    // فلترة العقود الخاصة بهذا المعمل فقط
                    contracts = contracts.filter(c => c.labId == labId);
                } catch (e) {
                    contracts = [];
                }
            }

            return {
                success: true,
                message: { ar: "تم جلب عقود الطبيب بنجاح", en: "Doctor contracts fetched successfully" },
                data: contracts
            };
        } catch (error) {
            throw error;
        }
    }

    // جلب عقد معين لدكتور معين
async getContractById(labId, doctorId, contractId) {
    try {
        const doctor = await User.findOne({
            where: { id: doctorId, role: 'doctor' },
            attributes: ['labContract']
        });

        if (!doctor) {
            throw {
                success: false,
                message: { ar: "الطبيب غير موجود", en: "Doctor not found" }
            };
        }

        let contracts = [];
        if (doctor.labContract) {
            try {
                contracts = JSON.parse(doctor.labContract);
            } catch (e) {
                contracts = [];
            }
        }

        const contract = contracts.find(c => c.id === contractId && (c.labId == labId || c.labUid == labId));
        
        if (!contract) {
            throw {
                success: false,
                message: { ar: "العقد غير موجود", en: "Contract not found" }
            };
        }

        return {
            success: true,
            message: { ar: "تم جلب العقد بنجاح", en: "Contract fetched successfully" },
            data: contract
        };
    } catch (error) {
        throw error;
    }
}
    // تحديث عقد دكتور معين
    async updateContract(labId, doctorId, contractId, updateData) {
        try {
            const doctor = await User.findOne({ where: { id: doctorId, role: 'doctor' } });
            
            if (!doctor) {
                throw {
                    success: false,
                    message: { ar: "الطبيب غير موجود", en: "Doctor not found" }
                };
            }

            let contracts = [];
            if (doctor.labContract) {
                try {
                    contracts = JSON.parse(doctor.labContract);
                } catch (e) {
                    contracts = [];
                }
            }

            const contractIndex = contracts.findIndex(c => c.id === contractId && c.labId == labId);
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

            doctor.labContract = JSON.stringify(contracts);
            await doctor.save();

            return {
                success: true,
                message: { ar: "تم تحديث العقد بنجاح", en: "Contract updated successfully" },
                data: contracts[contractIndex]
            };
        } catch (error) {
            throw error;
        }
    }

    // حذف عقد دكتور معين
    async deleteContract(labId, doctorId, contractId) {
        try {
            const doctor = await User.findOne({ where: { id: doctorId, role: 'doctor' } });
            
            if (!doctor) {
                throw {
                    success: false,
                    message: { ar: "الطبيب غير موجود", en: "Doctor not found" }
                };
            }

            let contracts = [];
            if (doctor.labContract) {
                try {
                    contracts = JSON.parse(doctor.labContract);
                } catch (e) {
                    contracts = [];
                }
            }

            const newContracts = contracts.filter(c => !(c.id === contractId && c.labId == labId));
            doctor.labContract = JSON.stringify(newContracts);
            await doctor.save();

            return {
                success: true,
                message: { ar: "تم حذف العقد بنجاح", en: "Contract deleted successfully" }
            };
        } catch (error) {
            throw error;
        }
    }

    // إضافة خدمة لعقد دكتور معين
    async addServiceToContract(labId, doctorId, contractId, service) {
        try {
            const doctor = await User.findOne({ where: { id: doctorId, role: 'doctor' } });
            
            if (!doctor) {
                throw {
                    success: false,
                    message: { ar: "الطبيب غير موجود", en: "Doctor not found" }
                };
            }

            let contracts = [];
            if (doctor.labContract) {
                try {
                    contracts = JSON.parse(doctor.labContract);
                } catch (e) {
                    contracts = [];
                }
            }

            const contractIndex = contracts.findIndex(c => c.id === contractId && c.labId == labId);
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

            doctor.labContract = JSON.stringify(contracts);
            await doctor.save();

            return {
                success: true,
                message: { ar: "تم إضافة الخدمة بنجاح", en: "Service added successfully" },
                data: newService
            };
        } catch (error) {
            throw error;
        }
    }

    // باقي الدوال (updateOrderStatus, updateOrderPrice, etc...) نفس ما هي
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
// ========== ADD THESE METHODS TO LabService ==========

// إزالة دكتور من المعمل
async removeDoctorFromLab(labId, doctorUID) {
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

        let docsArray = [];
        if (lab.docsId) {
            try {
                docsArray = JSON.parse(lab.docsId);
            } catch (e) {
                docsArray = lab.docsId.split(',').filter(Boolean);
            }
        }

        const doctorIdStr = doctor.id.toString();
        if (!docsArray.includes(doctorIdStr)) {
            throw {
                success: false,
                message: { ar: "الطبيب غير موجود في قائمة أطباء المعمل", en: "Doctor not found in lab" }
            };
        }

        // إزالة الدكتور من قائمة الأطباء
        docsArray = docsArray.filter(id => id.toString() !== doctorIdStr);
        lab.docsId = JSON.stringify(docsArray);
        await lab.save();

        // إزالة عقود المعمل من عند الدكتور
        let doctorContracts = [];
        if (doctor.labContract) {
            try {
                doctorContracts = JSON.parse(doctor.labContract);
                doctorContracts = doctorContracts.filter(c => c.labId != labId);
                doctor.labContract = JSON.stringify(doctorContracts);
                await doctor.save();
            } catch (e) {
                console.log("Error parsing doctor contracts:", e);
            }
        }

        return {
            success: true,
            message: { ar: "تم إزالة الطبيب من المعمل بنجاح", en: "Doctor removed from lab successfully" },
            data: {
                lab: {
                    id: lab.id,
                    name: lab.username,
                    doctors: docsArray
                },
                removedDoctor: {
                    id: doctor.id,
                    uid: doctor.uid,
                    username: doctor.username
                }
            }
        };
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// تحديث سعر الطلب (مع rest)
async updateOrderPayment(orderId, labId, paid) {
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

        if (paid > order.price) {
            throw {
                success: false,
                message: { ar: "المبلغ المدفوع لا يمكن أن يتجاوز السعر الإجمالي", en: "Paid amount cannot exceed total price" }
            };
        }

        const rest = order.price - paid;
        await order.update({ paid, rest });
        
        return {
            success: true,
            message: { ar: "تم تحديث حالة الدفع بنجاح", en: "Payment status updated successfully" },
            data: order
        };
    } catch (error) {
        throw error;
    }
}

// تحديد الطلب كـ Lab Ready
async markOrderAsReady(orderId, labId) {
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

        let newStatus = order.status;
        if (order.status.includes('(P)')) {
            newStatus = order.status.replace('(P)', '(F)');
            newStatus = newStatus.replace('UNDERWAY', 'LabReady');
        } else if (order.status.includes('(F)')) {
            newStatus = order.status.replace('(F)', '(F)');
            newStatus = newStatus.replace('UNDERWAY', 'LabReady');
        } else {
            throw {
                success: false,
                message: { ar: "لا يمكن تحديث حالة هذا الطلب", en: "Cannot update this order status" }
            };
        }

        await order.update({ status: newStatus });
        
        return {
            success: true,
            message: { ar: "تم تحديث الطلب كجاهز من المعمل", en: "Order marked as Lab Ready" },
            data: order
        };
    } catch (error) {
        throw error;
    }
}

// إحصائيات الفواتير
async getBillingStats(labId, startDate, endDate) {
    try {
        let whereClause = { lab_id: labId };
        
        if (startDate || endDate) {
            whereClause.created_at = {};
            if (startDate) {
                whereClause.created_at[Op.gte] = new Date(startDate);
            }
            if (endDate) {
                whereClause.created_at[Op.lte] = new Date(endDate);
            }
        }

        const allOrders = await Order.findAll({ where: whereClause });
        
        // تجميع حسب الدكتور
        const doctorStats = {};
        for (const order of allOrders) {
            const doctorId = order.doc_id;
            if (!doctorStats[doctorId]) {
                doctorStats[doctorId] = {
                    doctorId: doctorId,
                    totalOrders: 0,
                    totalAmount: 0,
                    totalPaid: 0,
                    totalRest: 0
                };
            }
            doctorStats[doctorId].totalOrders++;
            doctorStats[doctorId].totalAmount += parseFloat(order.price) || 0;
            doctorStats[doctorId].totalPaid += parseFloat(order.paid) || 0;
            doctorStats[doctorId].totalRest += (parseFloat(order.price) - parseFloat(order.paid)) || 0;
        }

        // جلب بيانات الأطباء
        const doctorIds = Object.keys(doctorStats);
        const doctors = await User.findAll({
            where: {
                id: doctorIds,
                role: 'doctor'
            },
            attributes: ['id', 'uid', 'username', 'phone']
        });

        const doctorMap = {};
        doctors.forEach(doc => {
            doctorMap[doc.id] = doc;
        });

        const byDoctor = {};
        for (const [docId, stats] of Object.entries(doctorStats)) {
            const doctor = doctorMap[docId];
            byDoctor[docId] = {
                doctor: doctor ? {
                    id: doctor.id,
                    uid: doctor.uid,
                    username: doctor.username,
                    phone: doctor.phone
                } : { username: 'Unknown' },
                totalOrders: stats.totalOrders,
                totalAmount: Math.round(stats.totalAmount),
                totalPaid: Math.round(stats.totalPaid),
                totalRest: Math.round(stats.totalRest)
            };
        }

        const summary = {
            totalOrders: allOrders.length,
            totalRevenue: Math.round(allOrders.reduce((sum, o) => sum + (parseFloat(o.price) || 0), 0)),
            totalPaid: Math.round(allOrders.reduce((sum, o) => sum + (parseFloat(o.paid) || 0), 0)),
            totalRest: Math.round(allOrders.reduce((sum, o) => sum + ((parseFloat(o.price) || 0) - (parseFloat(o.paid) || 0)), 0)),
            byDoctor: byDoctor,
            dateRange: { startDate: startDate || null, endDate: endDate || null }
        };
        
        return {
            success: true,
            message: { ar: "تم جلب إحصائيات الفواتير بنجاح", en: "Billing stats fetched successfully" },
            data: summary
        };
    } catch (error) {
        throw error;
    }
}

// تحديث عدد الأسنان في الطلب
async updateOrderTeethNumber(orderId, labId, teethNumber) {
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

        await order.update({ teeth_no: teethNumber });
        
        return {
            success: true,
            message: { ar: "تم تحديث عدد الأسنان بنجاح", en: "Teeth number updated successfully" },
            data: order
        };
    } catch (error) {
        throw error;
    }
}
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

    async getOrdersStats(labId) {
        try {
            const allOrders = await Order.findAll({ where: { lab_id: labId } });
            
            const stats = {
                total: allOrders.length,
                pending: allOrders.filter(o => o.status && o.status.includes('(P)')).length,
                finished: allOrders.filter(o => o.status && o.status.includes('(F)')).length,
                underway: allOrders.filter(o => o.status && o.status.startsWith('UNDERWAY')).length,
                ready: allOrders.filter(o => o.status && o.status.startsWith('LabReady')).length,
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