const express = require('express')
const router = express.Router()
const { getAllUsers , getUserById , deleteUserById, updateUserById } = require("../controllers/user.controller") // Controller functions for user management
const { isVerified }=  require("../middlewares/isVerified") // Middleware to check if user is verified
const { protect, restrictTo } = require('../middlewares/auth.middleware.js') // Middleware to protect routes and restrict access


// ✅ Manager-only: get all users
router.get('/', protect,  isVerified, restrictTo('manager'), getAllUsers)

// ✅ Manager-only: get user by ID
router.get('/:id', protect , isVerified, restrictTo('manager'), getUserById)

// ✅ Manager-only: update user by ID
router.put('/:id', protect, isVerified, restrictTo('manager'), updateUserById)

// ✅ Manager-only: delete user by ID
router.delete('/:id', protect, isVerified, restrictTo('manager'), deleteUserById)


// export default router
// Export the router to be used in the main app
module.exports = router
