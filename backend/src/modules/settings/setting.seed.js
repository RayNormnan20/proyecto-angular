const Setting = require('./setting.model');

const getDefaultFrontendUrl = () => {
  const candidates = [
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    const value = String(candidate).trim();
    if (!value || value === '*') continue;

    const firstValue = value.split(',').map(item => item.trim()).find(Boolean);
    if (!firstValue || firstValue === '*') continue;

    if (/^https?:\/\//i.test(firstValue)) {
      return firstValue.replace(/\/$/, '');
    }
  }

  return 'http://localhost:4200';
};

const seedSettings = async () => {
  try {
    const defaults = {
      'frontend_url': getDefaultFrontendUrl(),
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
