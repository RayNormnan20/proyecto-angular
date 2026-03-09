const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Testimonial = sequelize.define('Testimonial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Comentario o testimonio (opcional)'
  },
  imagen_url: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'URL de la imagen del cliente o producto entregado'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'testimonios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Testimonial;
