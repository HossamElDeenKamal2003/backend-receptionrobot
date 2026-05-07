const DeliveryController = require('./del.handler');

const express = require('express');
const router = express.Router();

// Route to get all delivery orders
router.get('/orders', (req, res) => DeliveryController.getAllDeliveryOrders(req, res));
router.post('/orders/recive', (req, res) => DeliveryController.reciverOrder(req, res));

module.exports = router;