const DeliveryService = require('./del.service');

class DeliveryController {
    async getAllDeliveryOrders(req, res) { 
        const result = await DeliveryService.getAllDeliveryOrders();
        if(result.success){
            return res.status(200).json(result);
        }
    }

    async reciverOrder(req, res){
        const { orderId } = req.body;
        const result = await DeliveryService.reciveOrder(orderId);
        if(result.message === "not found"){
            return res.status(404).json(result);
        }
        return res.status(200).json(result);
    }
}

module.exports = new DeliveryController();