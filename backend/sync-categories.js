const { sequelize } = require('./src/config/database');
const Category = require('./src/modules/categories/category.model');

async function syncCategories() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Sync Category to add new column
    await Category.sync({ alter: true });
    console.log('Category synced (added imagen).');

    process.exit(0);
  } catch (error) {
    console.error('Error syncing DB:', error);
    process.exit(1);
  }
}

syncCategories();
