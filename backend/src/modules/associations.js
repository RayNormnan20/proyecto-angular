const User = require('./users/user.model');
const Role = require('./roles/role.model');
const Permission = require('./permissions/permission.model');
const Product = require('./products/product.model');
const Category = require('./categories/category.model');
const Brand = require('./brands/brand.model');
const ProductImage = require('./products/product-image.model');
const Order = require('./orders/order.model');
const OrderItem = require('./orders/order-item.model');
const Setting = require('./settings/setting.model');
const Session = require('./auth/session.model');
const AccessLog = require('./auth/access-log.model');
const Favorite = require('./favorites/favorite.model');
const PaymentMethod = require('./payment-methods/payment-method.model');
const EmailLog = require('./email-logs/email-log.model');
const Testimonial = require('./testimonials/testimonial.model');

// Role-Permission associations (Many-to-Many)
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

// User-Role associations
User.belongsTo(Role, { foreignKey: 'rol_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'rol_id', as: 'users' });

// Product Associations
Product.belongsTo(Category, { foreignKey: 'categoria_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoria_id', as: 'products' });

Product.belongsTo(Brand, { foreignKey: 'marca_id', as: 'brand' });
Brand.hasMany(Product, { foreignKey: 'marca_id', as: 'products' });

Product.hasMany(ProductImage, { foreignKey: 'producto_id', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'producto_id', as: 'product' });

// Order Associations
Order.belongsTo(User, { foreignKey: 'usuario_id', as: 'user' });
User.hasMany(Order, { foreignKey: 'usuario_id', as: 'orders' });

Order.belongsTo(PaymentMethod, { foreignKey: 'metodo_pago_id', as: 'paymentMethod' });
PaymentMethod.hasMany(Order, { foreignKey: 'metodo_pago_id', as: 'orders' });

Order.hasMany(OrderItem, { foreignKey: 'orden_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orden_id', as: 'order' });

OrderItem.belongsTo(Product, { foreignKey: 'producto_id', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'producto_id', as: 'order_items' });

// Session Associations
Session.belongsTo(User, { foreignKey: 'usuario_id', as: 'user' });
User.hasMany(Session, { foreignKey: 'usuario_id', as: 'sessions' });

// Access Log Associations
AccessLog.belongsTo(User, { foreignKey: 'usuario_id', as: 'user' });
User.hasMany(AccessLog, { foreignKey: 'usuario_id', as: 'access_logs' });

// Favorite Associations (Many-to-Many User <-> Product)
User.belongsToMany(Product, { 
  through: Favorite, 
  foreignKey: 'usuario_id', 
  otherKey: 'producto_id',
  as: 'favorites'
});

Product.belongsToMany(User, { 
  through: Favorite, 
  foreignKey: 'producto_id', 
  otherKey: 'usuario_id',
  as: 'favoritedBy'
});

module.exports = { 
  User, 
  Role, 
  Permission,
  Product,
  Category,
  Brand,
  ProductImage,
  Order,
  OrderItem,
  Setting,
  Session,
  AccessLog,
  Favorite,
  PaymentMethod,
  EmailLog,
  Testimonial
};
