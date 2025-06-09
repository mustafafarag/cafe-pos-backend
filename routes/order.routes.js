const express = require('express')
const router = express.Router()
const { protect, restrictTo } = require('../middlewares/auth.middleware')
const { isVerified }=  require("../middlewares/isVerified") // Middleware to check if user is verified
const { createOrder, getAllOrders, addItemToOrder, removeItemFromOrder, updateOrderStatus, cancelOrder }= require('../controllers/order.controller')




// Create a new order → Cashier only 
router.post('/', protect, isVerified, restrictTo('cashier'), createOrder)
// Get all orders → Cashier only
router.post('/:orderId/add-item', protect, isVerified, restrictTo('cashier'), addItemToOrder)
// Update order status → Cashier only
router.put('/:orderId/status', protect, isVerified, restrictTo('cashier'), updateOrderStatus);
// Remove an item from an order → Cashier only
router.delete('/:orderId/items/:itemId', protect, isVerified, restrictTo('cashier'), removeItemFromOrder)




// Get all orders → Manager only
router.get('/', protect, isVerified, restrictTo('manager'), getAllOrders)
// Update order status to Cancel → Manager only
router.patch('/:orderId/cancel', protect, isVerified, restrictTo('manager'), cancelOrder)


module.exports = router
