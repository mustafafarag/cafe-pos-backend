
// Function to validate Sequelize IDs
// This utility function checks if the provided ID is a valid positive integer
const validateSequelizeId = (id, name = 'ID') => {
  const parsed = parseInt(id)

  if (!id || isNaN(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive number`)
  }
}

// export the utility function
module.exports =  { validateSequelizeId }
