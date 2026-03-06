const User = require('./users/user.model');
const Role = require('./roles/role.model');
const Permission = require('./permissions/permission.model');
const Product = require('./products/product.model');
const Category = require('./categories/category.model');
const Brand = require('./brands/brand.model');
const ProductImage = require('./products/product-image.model');

// Role-Permission associations (Many-to-Many)
// Verificar si ya existen en los modelos antes de definir
if (!Role.associations.permissions) {
  Role.belongsToMany(Permission, { 
    through: 'role_permissions', 
    foreignKey: 'role_id', 
    otherKey: 'permission_id',
    as: 'permissions'
  });
}

if (!Permission.associations.roles) {
  Permission.belongsToMany(Role, { 
    through: 'role_permissions', 
    foreignKey: 'permission_id', 
    otherKey: 'role_id',
    as: 'roles'
  });
}

// User-Role associations ya estan definidas en user.model.js
// No las redefinimos aqui para evitar errores

// Product Associations
Product.belongsTo(Category, { foreignKey: 'categoria_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoria_id', as: 'products' });

Product.belongsTo(Brand, { foreignKey: 'marca_id', as: 'brand' });
Brand.hasMany(Product, { foreignKey: 'marca_id', as: 'products' });

Product.hasMany(ProductImage, { foreignKey: 'producto_id', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'producto_id', as: 'product' });

module.exports = { 
  User, 
  Role, 
  Permission,
  Product,
  Category,
  Brand,
  ProductImage
};
