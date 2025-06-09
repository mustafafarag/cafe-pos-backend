const { verifyToken } = require('../utils/jwt')
const { User } = require('../models') // Assuming you have a User model defined in your models directory


// Middleware to protect routes and verify JWT
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const token = authHeader.split(' ')[1]

    const decoded = verifyToken(token) // ✅ uses your helper

    const user = await User.findByPk(decoded.id)
    if (!user) return res.status(401).json({ error: 'User not found' })

    req.user = user 
    next()
  } catch (err) {
    console.error('JWT verification error:', err.message)
    res.status(401).json({ error: 'Invalid token' })
  }
}


// Middleware to restrict access to certain roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}


// exporting the middlewares
module.exports = { protect, restrictTo }