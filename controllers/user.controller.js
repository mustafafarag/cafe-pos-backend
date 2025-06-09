const { User } = require('../models') // Import the User model
const { validateSequelizeId } = require('../utils/validateSequelizeId') // Utility function to validate Sequelize IDs




// ✅ Manager-only: get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'isVerified', 'createdAt']
    })

    res.status(200).json({ users })
  } catch (err) {
    console.error('❌ Failed to fetch users:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}


// ✅ Manager-only: get user by ID
const getUserById = async (req, res) => {
  try {
    validateSequelizeId(req.params.id, 'User ID')

    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'role', 'isVerified', 'createdAt']
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json({ user })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}



// ✅ Manager-only: update user by ID
const updateUserById = async (req, res) => {
  try {
    validateSequelizeId(req.params.id, 'User ID')

    const user = await User.findByPk(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const { name, email, role } = req.body

    // Only update fields if values are provided
    if (name) user.name = name
    if (email) user.email = email
    if (role) user.role = role

    await user.save()

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    })
  } catch (err) {
    console.error('❌ Failed to update user:', err.message)
    res.status(400).json({ error: err.message })
  }
}




// ✅ Manager-only: delete user by ID
const deleteUserById = async (req, res) => {
  try {
    validateSequelizeId(req.params.id, 'User ID')

    const user = await User.findByPk(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    await user.destroy()

    res.status(200).json({ message: 'User deleted successfully' })
  } catch (err) {
    console.error('❌ Failed to delete user:', err.message)
    res.status(400).json({ error: err.message })
  }
}



// Export the controller functions
module.exports = { getAllUsers, getUserById, deleteUserById, updateUserById }