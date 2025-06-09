const express = require('express')
const runExpiryCheck = require('./jobs/itemExpiryNotifier')
require('dotenv').config()
const app = express()

const expireOldPendingOrders = require('./jobs/expirePendingOrders')
const cron = require('node-cron')
// Import routes
const orderRoutes = require('./routes/order.routes')
const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.routes')
const itemRoutes = require('./routes/item.routes')

// run once immediately to check for any items expiring today
// (This ensures at least one check runs even if the server restarted during the 8 AM window.)
runExpiryCheck()

// Schedule the job to run every day at 8 AM
cron.schedule('0 8 * * *', runExpiryCheck)

// Run once on startup
expireOldPendingOrders()

// Run every 10 minutes to expire old pending orders 
cron.schedule('*/10 * * * *', expireOldPendingOrders)


app.use(express.json())
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/items', itemRoutes)
app.use('/api/v1/orders', orderRoutes)

app.use('/api/v1/users', userRoutes)


app.listen(process.env.PORT, () => {
  console.log('Server running on port', process.env.PORT)
})
