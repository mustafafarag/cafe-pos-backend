const express = require('express')
const router = express.Router()
const { protect, restrictTo  } = require('../middlewares/auth.middleware') // Middleware to protect routes and restrict access
const { isVerified }=  require("../middlewares/isVerified") // Middleware to check if user is verified
const { createUser , verifyEmail, login, forgotPassword, resetPassword } = require("../controllers/auth.controller") // Controller functions for user management



// ✅ Manager-only: create (cashier or waiter only) user
router.post('/create-user', protect, isVerified, restrictTo('manager'), createUser)


//  Login as a user (manager, cashier, or waiter)
router.post('/login' , isVerified, login)

// Verify email address
router.get('/verify/:token', verifyEmail)

//forgot password route
router.post('/forgot',isVerified, forgotPassword)

// Reset password route
router.post('/reset/:token', resetPassword)




// export router
module.exports = router
