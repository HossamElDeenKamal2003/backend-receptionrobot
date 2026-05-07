const DeliveryService = require("../services/delivery/del.service");

module.exports = (io) => {
    io.on("connection", (socket) => {

        socket.on("join-delivery", async () => {
            socket.join("delivery-room");

            const orders = await DeliveryService.getAllDeliveryOrders();

            socket.emit("delivery-orders", orders.data);
        });

    });
}; 