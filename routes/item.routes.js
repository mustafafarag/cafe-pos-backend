const express = require('express')
const router = express.Router()
const itemController = require('../controllers/item.controller')
const { protect, restrictTo } = require('../middlewares/auth.middleware')
const upload = require('../middlewares/upload.middleware')
const { getAllItems, getItemById, createItem, updateItem, deleteItem, importItemsFromCSV, exportItemsToCSV } = require('../controllers/item.controller')
const { isVerified }=  require("../middlewares/isVerified") // Middleware to check if user is verified



// Create/Update/Delete → Manager only
router.post('/', protect , isVerified, restrictTo('manager'), createItem)
router.put('/:id', protect , isVerified, restrictTo('manager'), updateItem)
router.delete('/:id', protect , isVerified, restrictTo('manager'), deleteItem)

// 👇 Import CSV items
router.post('/import', protect, isVerified, restrictTo('manager'), upload.single('file'), importItemsFromCSV)
// Export items to CSV → Manager only
router.get('/export', protect, isVerified, restrictTo('manager'), exportItemsToCSV)


// Managers can retrieve all items and Waiters can retrieve only non-expired items
router.get('/', protect, isVerified, getAllItems)
// router.get('/:id', protect, isVerified, getItemById)



module.exports = router
