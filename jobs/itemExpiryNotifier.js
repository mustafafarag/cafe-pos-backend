const cron = require('node-cron')
const { Op } = require('sequelize')
const { Item, User } = require('../models')
const { sendMail } = require('../utils/mailer')

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

// Exported function to run manually or via cron
const runExpiryCheck = async () => {
  const today = new Date()
  const fiveDaysFromNow = new Date()
  fiveDaysFromNow.setDate(today.getDate() + 5)

  console.log('🔄 Checking for item expiry alerts...')

  try {
    const expiringItems = await Item.findAll({
      where: {
        expiryDate: {
            [Op.between]: [
                new Date(today.setHours(0, 0, 0, 0)),
                new Date(fiveDaysFromNow.setHours(23, 59, 59, 999))
            ]
        }
      }
    })

    console.log(`📦 Found ${expiringItems.length} expiring items`)

    if (!expiringItems.length) return

    const managers = await User.findAll({
      where: {
        role: 'manager',
        isVerified: true
      }
    })

    console.log(`👤 Found ${managers.length} verified managers`)

    if (!managers.length) return

    const itemList = expiringItems.map(item =>
      `- ${item.name} (Expires: ${formatDate(item.expiryDate)})`
    ).join('\n')

    const subject = '⚠️ Items Expiry Alert'
    const message = `The following items are expiring soon:\n\n${itemList}`

    for (const mgr of managers) {
      console.log(`✉️ Sending email to ${mgr.email}`)
      await sendMail(mgr.email, subject, message)
    }

    console.log('📧 Expiry alerts sent to managers')
  } catch (err) {
    console.error('❌ Failed to send expiry alerts:', err.message)
  }
}

module.exports = runExpiryCheck
