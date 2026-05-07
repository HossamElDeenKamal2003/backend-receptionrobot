const Order = require("../../models/order");
const User = require("../../models/users");

class DeliveryService {
    // get all delivery orders

async getAllDeliveryOrders() {
    try {
        const orders = await Order.findAll({
            where: {
                status: [
                    "DocReady(P)",
                    "DocReady(F)",
                    "LabReady(P)",
                    "LabReady(F)",
                    "OTW_DOC(P)",
                    "OTW_DOC(F)",
                    "OTW_LAB(P)",
                    "OTW_LAB(F)",
                    "UNDERWAY(P)",
                    "UNDERWAY(F)"
                ]
            },
            include: [
                {
                    model: User,
                    as: 'doctor',
                    required: false,
                    
                },
                {
                    model: User,
                    as: 'lab',
                    required: false,
                    
                }
            ],
            order: [['created_at', 'DESC']]
        });

        return {
            success: true,
            data: orders
        };
    } catch (error) {
        console.error("Error in getAllDeliveryOrders:", error);
        throw new Error(error.message || "Failed to fetch delivery orders");
    }
}

    // update order status to OTW_DOC(P) or OTW_DOC(F)
   async reciveOrder(orderId) {
    try {
        const order = await Order.findByPk(orderId);

        if (!order) {
            return {
                success: false,
                message: "Order not found"
            };
        }

        if (order.status.includes("DocReady")) {
            order.status = order.status.includes("(P)")
                ? "OTW_LAB(P)"
                : "OTW_LAB(F)";
        }
        else if (order.status.includes("OTW_LAB")) {
            order.status = order.status.includes("(P)")
                ? "UNDERWAY(P)"
                : "UNDERWAY(F)";
        }
        else if (order.status.includes("LabReady")) {
            order.status = order.status.includes("(P)")
                ? "OTW_DOC(P)"
                : "OTW_DOC(F)";
        } 
        else if (order.status.includes("UNDERWAY")) {
            order.status = order.status.includes("(P)")
                ? "OTW_DOC(P)"
                : "OTW_DOC(F)";
        } 
        else if (order.status.includes("OTW_DOC")) {
            order.status = order.status.includes("(P)")
                ? "END(P)"
                : "END(F)";
        }

        await order.save();

        return {
            success: true,
            data: order
        };

    } catch (error) {
        throw new Error(error.message || "Failed to update order");
    }
}
}

module.exports = new DeliveryService();