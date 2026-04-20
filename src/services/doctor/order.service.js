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
                uid: orderData.uid,
                patient_name: orderData.patient_name,
                age: orderData.age,
                teeth_no: orderData.teeth_no,
                sex: orderData.sex,
                color: orderData.color,
                type: orderData.type,
                description: orderData.description,
                screen: orderData.screen,
                price: orderData.price,
                paid: orderData.paid || 0,
                lab_id: orderData.lab_id,
                doc_id: doctorId,
                status: "DocReady(P)",
                doc_ready: true
            });
            
            return {
                success: true,
                message: { ar: "تم إنشاء الطلب بنجاح", en: "Order created successfully" },
                data: order
            };
        } catch (error) {
            console.log(error);
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
            console.log(error);
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
                doc_ready: false
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
                pending: orders.filter(o => o.status && o.status.includes('(P)')).length,
                finished: orders.filter(o => o.status && o.status.includes('(F)')).length,
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

    // ========== NEW METHODS ==========
async getDoctorLabs(doctorId) {
    try {
        const doctorIdNum = Number(doctorId);

        // ✅ جيب الدكتور الأول عشان تجيب عقوده
        const doctor = await User.findOne({
            where: { id: doctorIdNum, role: 'doctor' },
            attributes: ['id', 'labContract']
        });

        // ✅ جيب عقود الدكتور (لو موجودة)
        let doctorContracts = [];
        if (doctor && doctor.labContract) {
            try {
                doctorContracts = JSON.parse(doctor.labContract);
            } catch (e) {
                doctorContracts = [];
            }
        }

        // ✅ جيب كل المعامل
        const labs = await User.findAll({
            where: { role: 'lab' },
            attributes: ['id', 'uid', 'username', 'phone', 'email', 'address', 'docsId']
        });

        const doctorLabs = labs.filter((lab) => {
            let docsArray = [];

            if (lab.docsId) {
                try {
                    docsArray = JSON.parse(lab.docsId);
                } catch (e) {
                    docsArray = lab.docsId.split(',').map(i => i.trim());
                }
            }

            docsArray = docsArray.map(id => Number(id));
            return docsArray.includes(doctorIdNum);
        }).map((lab) => {
            // ✅ جيب العقود الخاصة بهذا المعمل فقط من عقود الدكتور
            const labContracts = doctorContracts.filter(c => c.labId == lab.id || c.labId == lab.uid);

            return {
                id: lab.id,
                uid: lab.uid,
                username: lab.username,
                phone: lab.phone,
                email: lab.email,
                address: lab.address,
                contracts: labContracts  // ✅ عقود هذا المعمل بس
            };
        });

        return {
            success: true,
            message: { ar: "تم جلب المعامل بنجاح", en: "Labs fetched successfully" },
            data: doctorLabs
        };

    } catch (error) {
        console.error("Get doctor labs error:", error);
        throw error;
    }
}


    // جلب معمل معين للدكتور
    async getDoctorLabById(doctorId, labId) {
        try {
            const lab = await User.findOne({
                where: { id: labId, role: 'lab' },
                attributes: ['id', 'uid', 'username', 'phone', 'email', 'address', 'docsId', 'labContract']
            });

            if (!lab) {
                throw {
                    success: false,
                    message: { ar: "المعمل غير موجود", en: "Lab not found" }
                };
            }

            // التحقق من إن الدكتور مضاف للمعمل
            let docsArray = [];
            if (lab.docsId) {
                try {
                    docsArray = JSON.parse(lab.docsId);
                } catch (e) {
                    docsArray = lab.docsId.split(',').filter(Boolean);
                }
            }

            const doctorIdStr = doctorId.toString();
            if (!docsArray.includes(doctorIdStr)) {
                throw {
                    success: false,
                    message: { ar: "غير مصرح - هذا المعمل لا يخدمك", en: "Unauthorized - This lab does not serve you" }
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
                message: { ar: "تم جلب بيانات المعمل بنجاح", en: "Lab data fetched successfully" },
                data: {
                    id: lab.id,
                    uid: lab.uid,
                    username: lab.username,
                    phone: lab.phone,
                    email: lab.email,
                    address: lab.address,
                    contracts: contracts
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // جلب عقود معمل معين للدكتور
async getDoctorLabContracts(doctorId, labId) {
    try {
        console.log("========== START ==========");
        console.log("1. Received doctorId:", doctorId, "Type:", typeof doctorId);
        console.log("2. Received labId:", labId, "Type:", typeof labId);

        // ✅ جيب الدكتور الأول
        const doctor = await User.findOne({
            where: { id: doctorId, role: 'doctor' },
            attributes: ['id', 'labContract']
        });

        console.log("3. Doctor found:", doctor ? doctor.id : "NOT FOUND");

        if (!doctor) {
            throw {
                success: false,
                message: { ar: "الطبيب غير موجود", en: "Doctor not found" }
            };
        }

        // ✅ جيب المعمل للتحقق من الصلاحية
        const lab = await User.findOne({
            where: { id: labId, role: 'lab' },
            attributes: ['id', 'docsId']
        });

        console.log("4. Lab found:", lab ? lab.id : "NOT FOUND");
        console.log("5. Lab docsId:", lab ? lab.docsId : "N/A");

        if (!lab) {
            throw {
                success: false,
                message: { ar: "المعمل غير موجود", en: "Lab not found" }
            };
        }

        // ✅ التحقق من إن الدكتور مضاف للمعمل
        let docsArray = [];
        if (lab.docsId) {
            try {
                docsArray = JSON.parse(lab.docsId);
                console.log("6. docsArray after JSON.parse:", docsArray);
            } catch (e) {
                docsArray = lab.docsId.split(',').filter(Boolean);
                console.log("6. docsArray after split:", docsArray);
            }
        }

        const doctorIdStr = doctorId.toString();
        const docsArrayStr = docsArray.map(id => id.toString());
        
        console.log("7. doctorIdStr:", doctorIdStr);
        console.log("8. docsArrayStr:", docsArrayStr);
        console.log("9. Includes check:", docsArrayStr.includes(doctorIdStr));

        if (!docsArrayStr.includes(doctorIdStr)) {
            throw {
                success: false,
                message: { ar: `غير مصرح - هذا المعمل لا يخدمك. أطباء المعمل: ${docsArrayStr.join(', ')}`, en: `Unauthorized - This lab does not serve you. Lab doctors: ${docsArrayStr.join(', ')}` }
            };
        }

        // ✅ جيب عقود الدكتور من الـ doctor.labContract
        let contracts = [];
        if (doctor.labContract) {
            try {
                contracts = JSON.parse(doctor.labContract);
                console.log("10. All contracts:", contracts);
                // ✅ فلتر العقود الخاصة بهذا المعمل فقط
                contracts = contracts.filter(c => c.labId == labId || c.labUid == lab.uid);
                console.log("11. Filtered contracts:", contracts);
            } catch (e) {
                console.log("10. Error parsing contracts:", e.message);
                contracts = [];
            }
        }

        console.log("========== SUCCESS ==========");

        return {
            success: true,
            message: { ar: "تم جلب العقود بنجاح", en: "Contracts fetched successfully" },
            data: contracts
        };
    } catch (error) {
        console.error("Get doctor lab contracts error:", error);
        throw error;
    }
}
}

module.exports = new OrderService();