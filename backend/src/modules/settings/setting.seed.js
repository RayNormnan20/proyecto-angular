const Setting = require('./setting.model');

const seedSettings = async () => {
  try {
    const defaults = {
      'yape_qr': '',
      'yape_nombre': 'Mi Tienda S.A.C.',
      'transfer_banco': 'BCP',
      'transfer_numero': '191-12345678-0-01',
      'transfer_cci': '002-191-12345678-0-01',
      'transfer_titular': 'Mi Tienda S.A.C.'
    };

    for (const [key, value] of Object.entries(defaults)) {
      await Setting.findOrCreate({
        where: { clave: key },
        defaults: { valor: value, descripcion: 'Configuración por defecto' }
      });
    }
    console.log('✅ Configuraciones iniciales verificadas/creadas.');
  } catch (error) {
    console.error('❌ Error al sembrar configuraciones:', error);
  }
};

module.exports = seedSettings;
