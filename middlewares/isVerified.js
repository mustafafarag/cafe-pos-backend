const { User } = require('../models')


// Middleware to check if user is verified
// This middleware checks if the user is verified before allowing access to certain routes
const isVerified = async (req, res, next) => {
  try {
    let user

    // Case 1: User already authenticated (protect middleware ran before)
    if (req.user) {
      user = req.user
    }

    // Case 2: Not authenticated, but email provided in body (like /login or /forgot)
    else if (req.body.email) {
      user = await User.findOne({ where: { email: req.body.email } })
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }
    }

    // No user found either way
    if (!user) {
      return res.status(400).json({ error: 'User not found or not provided' })
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Account not verified. Please check your email.' })
    }

    // Attach the user to req.user for downstream use
    req.user = user

    next()
  } catch (err) {
    console.error('❌ isVerified middleware error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { isVerified }
