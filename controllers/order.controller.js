const { User, Item, Order, OrderItem } = require('../models')
const { sequelize } = require('../models'); // Adjust to your sequelize instance
const { validateSequelizeId } = require('../utils/validateSequelizeId') // Utility function to validate Sequelize IDs




// Create a new order with items and assign to a waiter
const createOrder = async (req, res) => {
  try {
    const { items, waiterId } = req.body
    const cashierId = req.user.id
    validateSequelizeId(cashierId)

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required to create an order' })
    }

    if (!waiterId) {
      return res.status(400).json({ error: 'Waiter ID is required' })
    }

    // ✅ Validate waiter exists and is actually a waiter
    validateSequelizeId(waiterId)
    const waiter = await User.findByPk(waiterId)
    if (!waiter || waiter.role !== 'waiter') {
      return res.status(400).json({ error: 'Invalid waiter ID' })
    }

    const itemRecords = await Item.findAll({
      where: {
        id: items.map(i => i.itemId)
      }
    })

    const now = new Date()
    let totalCost = 0
    const orderItems = []

    for (const entry of items) {
      const item = itemRecords.find(i => i.id === entry.itemId)
      if (!item) {
        return res.status(400).json({ error: `Item not found: ${entry.itemId}` })
      }

      if (new Date(item.expiryDate) <= now) {
        return res.status(400).json({ error: `Item "${item.name}" is expired and cannot be added` })
      }

      const quantity = parseInt(entry.quantity)
      const priceSnapshot = item.price
      const cost = quantity * priceSnapshot
      totalCost += cost

      orderItems.push({
        itemId: item.id,
        quantity,
        priceSnapshot
      })
    }

    const newOrder = await Order.create({
      status: 'pending',
      totalCost,
      cashierId,
      waiterId
    })

    await Promise.all(orderItems.map((oi) =>
      OrderItem.create({ ...oi, orderId: newOrder.id })
    ))

    res.status(201).json({
      message: '✅ Order created',
      orderId: newOrder.id,
      totalCost
    })
  } catch (err) {
    console.error('❌ Order creation error:', err.message)
    res.status(500).json({ error: 'Failed to create order' })
  }
}





// Get all orders for manager Only
const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied' })
    }

    const orders = await Order.findAll({
      include: [
        { model: User, as: 'cashier', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'waiter', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'items', include: [{ model: Item }] }
      ],
      order: [['createdAt', 'DESC']]
    })

    res.status(200).json({ orders })
  } catch (err) {
    console.error('❌ Failed to fetch orders:', err.message)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
}





// Add item to an existing order
const addItemToOrder = async (req, res) => {
  try {
    const { orderId } = req.params
    const { itemId, quantity } = req.body
   
    

    if (!itemId || !quantity) {
      return res.status(400).json({ error: 'Item ID and quantity are required' })
    }

    // ✅ Check order exists and is still pending
    validateSequelizeId(orderId)
    const order = await Order.findByPk(orderId)
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot modify a completed order' })
    }

    // ✅ Validate the item
    validateSequelizeId(itemId)
    const item = await Item.findByPk(itemId)
    if (!item) {
      return res.status(404).json({ error: 'Item not found' })
    }

    if (new Date(item.expiryDate) < new Date()) {
      return res.status(400).json({ error: `Item ${item.name} is expired and cannot be added` })
    }

    const priceSnapshot = item.price
    const totalCostAddition = priceSnapshot * parseInt(quantity)

    // ✅ Add the item to the order
    await OrderItem.create({
      orderId,
      itemId,
      quantity,
      priceSnapshot
    })

    // ✅ Update total cost in order
    order.totalCost += totalCostAddition
    await order.save()

    res.status(201).json({
      message: `✅ Item ${item.name} added to order`,
      newTotal: order.totalCost
    })
  } catch (err) {
    console.error('❌ Add item error:', err.message)
    res.status(500).json({ error: 'Failed to add item to order' })
  }
}





// Remove item from order
const removeItemFromOrder = async (req, res) => {
  const { orderId, itemId } = req.params
  const userId = req.user.id

  try {
    // 1. Find the order and verify the cashier owns it
    const order = await Order.findOne({ where: { id: orderId, cashierId: userId } })
    if (!order) return res.status(404).json({ error: 'Order not found or not yours' })

    // 2. Check if the item exists in the order
    const orderItem = await OrderItem.findOne({ where: { orderId, itemId } })
    if (!orderItem) return res.status(404).json({ error: 'Item not found in order' })

    // 3. Check if item is expired
    const item = await Item.findByPk(itemId)
    if (!item || new Date(item.expiryDate) <= new Date()) {
      return res.status(400).json({ error: 'Item is expired or invalid' })
    }

    // 4. Remove item from order
    await orderItem.destroy()

    // 5. Restore item stock
    item.stockQuantity += orderItem.quantity
    await item.save()

    // 6. Recalculate order total
    const remainingItems = await OrderItem.findAll({ where: { orderId } })

    let newTotal = 0
    for (const oi of remainingItems) {
      const i = await Item.findByPk(oi.itemId)
      newTotal += i.price * oi.quantity
    }

    order.totalCost = newTotal
    await order.save()

    res.status(200).json({
      message: '✅ Item removed from order',
      newTotal,
      remainingItems: remainingItems.length
    })
  } catch (err) {
    console.error('❌ Remove item error:', err.message)
    res.status(500).json({ error: 'Failed to remove item' })
  }
}









// Update order status (pending, complete, cancelled)
const updateOrderStatus = async (req, res) => {
  const t = await sequelize.transaction() // Start transaction
  try {
    const { orderId } = req.params
    const { newStatus } = req.body
    const cashierId = req.user.id
    validateSequelizeId(cashierId)
    
    const validStatuses = ['pending', 'complete', 'cancelled']
    if (!validStatuses.includes(newStatus)) {
      await t.rollback()
      return res.status(400).json({ error: 'Invalid status value' })
    }

    // Fetch order with related items
    validateSequelizeId(orderId)
    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem, as: 'items' }],
      transaction: t
    })

    if (!order) {
      await t.rollback()
      return res.status(404).json({ error: 'Order not found' })
    }

    // Ensure only the cashier who created the order can update it
    if (order.cashierId !== cashierId) {
      await t.rollback()
      return res.status(403).json({ error: 'Unauthorized action' })
    }

    if (order.status === 'complete') {
      await t.rollback()
      return res.status(400).json({ error: 'Order is already complete' })
    }

    // If marking order as complete, update item stock
    if (newStatus === 'complete') {
      for (const orderItem of order.items) {
        const item = await Item.findByPk(orderItem.itemId, { transaction: t })

        if (!item) {
          await t.rollback()
          return res.status(400).json({ error: `Item not found: ${orderItem.itemId}` })
        }

        const newStock = item.stockQuantity - orderItem.quantity

        if (newStock < 0) {
          await t.rollback()
          return res.status(400).json({ error: `Insufficient stock for item: ${item.name}` })
        }

        console.log(`Updating item ${item.id}: current stock = ${item.stockQuantity}, quantity ordered = ${orderItem.quantity}`)

        await item.update(
          { stockQuantity: newStock },
          { transaction: t }
        )

        console.log(`Updated item ${item.id} stockQuantity to ${newStock}`)
      }
    }

    // Update order status
    await order.update({ status: newStatus }, { transaction: t })

    await t.commit() // Finalize transaction
    console.log(`✅ Order ${orderId} marked as ${newStatus}`)

    res.status(200).json({
      message: `Order marked as ${newStatus}`,
      orderId: order.id
    })

  } catch (err) {
    await t.rollback() // Rollback on error
    console.error('❌ Error updating order status:', err.message)
    res.status(500).json({ error: 'Failed to update order status' })
  }
}




// Cancel an order (only if it's completed) By manager Only
const cancelOrder = async (req, res) => {
  const { orderId } = req.params

  try {
    // Fetch the order
    validateSequelizeId(orderId)
    const order = await Order.findByPk(orderId)
    console.log('🔍 Looking for order with ID:', orderId)


    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (order.status !== 'complete') {
      return res.status(400).json({ error: 'Only completed orders can be cancelled' })
    }

    // Update status
    order.status = 'cancelled'
    await order.save()

    res.status(200).json({
      message: `✅ Order #${orderId} cancelled successfully`,
      status: order.status
    })
  } catch (err) {
    console.error('❌ Failed to cancel order:', err.message)
    res.status(500).json({ error: 'Failed to cancel order' })
  }
}



module.exports = { createOrder, getAllOrders, addItemToOrder, removeItemFromOrder, updateOrderStatus, cancelOrder }