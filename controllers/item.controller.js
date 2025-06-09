const { Item } = require('../models')
const { Op } = require('sequelize')
const { Parser } = require('json2csv')
const { Readable } = require('stream')
const csv = require('csv-parser')
const { validateSequelizeId } = require('../utils/validateSequelizeId') // Utility function to validate Sequelize IDs


// // ✅ Manager-only: Create items
const createItem = async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      const items = await Item.bulkCreate(req.body)
      return res.status(201).json(items)
    } else {
      const item = await Item.create(req.body)
      return res.status(201).json(item)
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}



// // ✅ Manager-only: getall Items & for waiter get only non-expired items
// Read All with filters
// support numeric and date sorting
const getAllItems = async (req, res) => {
  try {
    const { role } = req.user
    const { category, sortBy, order = 'asc' } = req.query

    // ❌ Restrict access to waiter or manager only
    if (!['waiter', 'manager'].includes(role)) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const where = {}

    // ✅ Filter by category (optional)
    if (category) {
      where.category = category
    }

    // ✅ If waiter, show only non-expired items
    if (role === 'waiter') {
      where.expiryDate = { [Op.gt]: new Date() }
    }

    // ✅ Sorting logic
    let orderClause = []
    if (sortBy === 'totalStockValue') {
      orderClause.push([sequelize.literal('"price" * "stockQuantity"'), order])
    } else if (['name', 'price', 'expiryDate'].includes(sortBy)) {
      orderClause.push([sortBy, order])
    }

    // ✅ Query DB
    const items = await Item.findAll({ where, order: orderClause })

    res.status(200).json(items)
  } catch (err) {
    console.error('❌ Failed to fetch items:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}




// // ✅ Manager-only: Update items
const updateItem = async (req, res) => {
  const { id } = req.params

  try {
    validateSequelizeId(id)
    const item = await Item.findByPk(id)
    if (!item) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const allowedFields = ['name', 'description', 'price', 'category', 'expiryDate', 'stockQuantity']
    const updates = {}

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    })

    await item.update(updates)

    res.status(200).json({ message: 'Item updated successfully', item })
  } catch (err) {
    console.error('❌ Error updating item:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}


// ✅ Manager-only: Delete items
const deleteItem = async (req, res) => {
  const { id } = req.params

  try {
    validateSequelizeId(id)

    const item = await Item.findByPk(id)
    if (!item) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await item.destroy()
    res.json({ message: 'Item deleted' })
  } catch (err) {
    console.error('❌ Failed to delete item:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}

// ✅ Manager-only: Export all items to CSV
const exportItemsToCSV = async (req, res) => {
  try {
    const items = await Item.findAll({
      attributes: ['sku', 'name', 'description', 'price', 'category', 'expiryDate', 'stockQuantity']
    })

    if (!items.length) {
      return res.status(404).json({ message: 'No items found to export' })
    }

    const fields = ['sku', 'name', 'description', 'price', 'category', 'expiryDate', 'stockQuantity']
    const parser = new Parser({ fields })
    const csv = parser.parse(items.map(item => item.toJSON()))

    res.header('Content-Type', 'text/csv')
    res.attachment('items.csv')
    return res.send(csv)
  } catch (err) {
    console.error('❌ CSV export error:', err)
    res.status(500).json({ error: 'Failed to export items to CSV' })
  }
}





// ✅ Manager-only: Import items from CSV
const importItemsFromCSV = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'CSV file is required' })

  const rows = []
  const created = []
  const updated = []

  const stream = Readable.from(req.file.buffer)

  try {
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row) => {
          rows.push(row) // collect all rows first
        })
        .on('end', resolve)
        .on('error', reject)
    })

    console.log(`📦 Total rows parsed: ${rows.length}`)

    // Process each row in series (or you can use Promise.all for parallel)
    for (const row of rows) {
      const result = await processRow(row)
      if (result === 'created') created.push(row.sku)
      if (result === 'updated') updated.push(row.sku)
    }

    console.log(`✅ Import complete. Created: ${created.length}, Updated: ${updated.length}`)

    return res.status(200).json({
      message: '✅ CSV import complete',
      created: created.length,
      updated: updated.length
    })

  } catch (err) {
    console.error('❌ CSV import error:', err.message)
    return res.status(500).json({ error: 'Failed to import CSV' })
  }

  async function processRow(row) {
    console.log('📥 Processing row:', row)

    if (!row.sku || !row.name || !row.price || !row.expiryDate) {
      console.log('⛔ Skipping invalid row')
      return
    }

    const itemData = {
      sku: row.sku.trim(),
      name: row.name.trim(),
      description: row.description?.trim() || '',
      price: parseFloat(row.price),
      category: row.category?.trim() || 'general',
      expiryDate: new Date(row.expiryDate),
      stockQuantity: parseInt(row.stockQuantity) || 0
    }

    const existing = await Item.findOne({ where: { sku: itemData.sku } })

    if (existing) {
      await existing.update(itemData)
      console.log(`🔄 Updated item with SKU ${itemData.sku}`)
      return 'updated'
    } else {
      await Item.create(itemData)
      console.log(`➕ Created item with SKU ${itemData.sku}`)
      return 'created'
    }
  }
}



module.exports = { getAllItems, createItem, updateItem, deleteItem, importItemsFromCSV, exportItemsToCSV }