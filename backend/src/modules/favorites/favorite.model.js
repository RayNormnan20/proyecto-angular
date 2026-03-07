const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Favorite = sequelize.define('Favorite', {
  id_favorito: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_agregado: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'favoritos',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['usuario_id', 'producto_id']
    }
  ]
});

module.exports = Favorite;
