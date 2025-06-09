const multer = require('multer')
const path = require('path')

// Define storage (we use memory for simplicity)
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname)
  if (ext !== '.csv') {
    return cb(new Error('Only CSV files are allowed'), false)
  }
  cb(null, true)
}

const upload = multer({ storage, fileFilter })

module.exports = upload
