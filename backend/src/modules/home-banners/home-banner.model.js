const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const HomeBanner = sequelize.define('HomeBanner', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  placement: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  button_text: {
    type: DataTypes.STRING,
    allowNull: true
  },
  button_link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'home_banners',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = HomeBanner;
