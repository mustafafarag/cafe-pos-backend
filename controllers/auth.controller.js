const bcrypt = require('bcrypt') // Importing bcrypt for password hashing
const { User } = require('../models') // Importing the User model
const { signToken } = require('../utils/jwt') // utility to sign JWT tokens
const { sendMail } = require('../utils/mailer') // mailer utility to send emails
const crypto = require('crypto')  // Importing crypto for generating tokens for email verification and password reset
const { Op } = require('sequelize'); // Importing Sequelize operators for querying the database





// ✅ Manager-only: create a new user (cashier or waiter)
const createUser = async (req, res) => {
  const { name, email, password, role } = req.body

  const ALLOWED_ROLES = ['cashier', 'waiter'] 
  
  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(', ')}` })
  }

  try {
    const hashed = await bcrypt.hash(password, 10)
    const verificationToken = crypto.randomBytes(32).toString('hex')

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      isVerified: false,
      verificationToken
    })

    const link = `${process.env.BASE_URL}/auth/verify/${verificationToken}`
    await sendMail(email, 'Verify your account', `
      <p>Hi ${name},</p>
      <p><a href="${link}">Click here to verify your account</a></p>
    `)

    res.status(201).json({ message: 'User created and verification email sent.' })
  } catch (err) {
    console.error('❌ Failed to create user:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}





// Verify email address using the token sent to the user by email after user creation
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params
    const user = await User.findOne({ where: { verificationToken: token } })

    if (!user) return res.status(400).json({ error: 'Invalid or expired token.' })

    user.isVerified = true
    user.verificationToken = null
    await user.save()

    res.json({ message: 'Email verified successfully.' })
  } catch (err) {
    console.error('❌ Email verification error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}




// Login user (manager, cashier, or waiter)
const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email } })

    if (!user || !user.isVerified)
      return res.status(401).json({ error: 'Invalid credentials or unverified email' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'Wrong password' })

    const token = signToken({ id: user.id, role: user.role })
    res.json({ token })
  } catch (err) {
    console.error('❌ Login error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}



// Forgot password: send reset link to user's email
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetToken = resetToken
    user.resetTokenExpires = new Date(Date.now() + 3600000)
    await user.save()

    const link = `${process.env.BASE_URL}/auth/reset/${resetToken}`
    await sendMail(email, 'Reset Password', `<a href="${link}">Reset Password</a>`)

    res.json({ message: 'Reset email sent' })
  } catch (err) {
    console.error('❌ Forgot password error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}




// Reset password using the token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body

    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpires: { [Op.gt]: new Date() }
      }
    })

    if (!user) return res.status(400).json({ error: 'Invalid or expired token' })

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)

    user.resetToken = null
    user.resetTokenExpires = null
    await user.save()

    res.json({ message: 'Password reset successfully' })
  } catch (err) {
    console.error('❌ Reset password error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}


// Exporting the controller functions
module.exports = { createUser , verifyEmail, login, forgotPassword, resetPassword }