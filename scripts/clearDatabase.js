const { sequelize } = require('../models')

async function clearDB() {
  try {
    await sequelize.sync({ force: true }) // Drops and recreates all tables
    console.log('✅ Database cleared and re-synced')
    process.exit()
  } catch (err) {
    console.error('❌ Failed to clear database:', err)
    process.exit(1)
  }
}

clearDB()
