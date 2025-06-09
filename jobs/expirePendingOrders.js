const { Op } = require('sequelize')
const { Order } = require('../models')


/*
Run every 10 minutes to automatically update the status of orders to "expired" if they remain pending for over 4 hours.
Also execute on server restart to ensure no pending orders are missed due to downtime or failures.
*/


async function expireOldPendingOrders() {
  const now = new Date()
  const cutoffTime = new Date(now.getTime() - 4 * 60 * 60 * 1000) // 4 hours ago

  const expiredOrders = await Order.update(
    { status: 'expired' },
    {
      where: {
        status: 'pending',
        createdAt: { [Op.lte]: cutoffTime }
      }
    }
  )

  console.log(`🕒 Order expiry check complete — ${expiredOrders[0]} orders marked as expired`)
}

module.exports = expireOldPendingOrders
