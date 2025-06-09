const { User, sequelize } = require('../models')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const { sendMail } = require('../utils/mailer') 

async function createManager() {
  const name = 'Initial Manager'
  const email = 'manager@example.com'
  const password = '12345678'
  const hashed = await bcrypt.hash(password, 10)
  const token = crypto.randomBytes(32).toString('hex')
  const link = `${process.env.BASE_URL}/auth/verify/${token}`

  const existing = await User.findOne({ where: { email } })
  if (existing) {
    console.log('⚠️ Manager already exists.')
    return
  }

  const t = await sequelize.transaction()

  try {
    const newManager = await User.create(
      {
        name,
        email,
        password: hashed,
        role: 'manager',
        isVerified: false,
        verificationToken: token,
      },
      { transaction: t }
    )

    await sendMail(
      email,
      'Verify your account',
      `<p>Hi ${name},</p><p><a href="${link}">Click here to verify your account</a></p>`
    )

    await t.commit()
    console.log('✅ Manager created and verification email sent.')
  } catch (err) {
    await t.rollback()
    console.error('❌ Failed to seed manager:', err.message)
  }
}

createManager()
