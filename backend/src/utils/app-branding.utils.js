const Setting = require('../modules/settings/setting.model');

const DEFAULT_APP_NAME = 'TEST NOMBRE';
const DEFAULT_FRONTEND_URL = 'http://localhost:4200';

const buildSettingsMap = (settings = []) => settings.reduce((accumulator, setting) => {
  accumulator[setting.clave] = setting.valor;
  return accumulator;
}, {});

const normalizeValue = (value) => String(value || '').trim();

const resolveAppName = (settingsMap = {}) => normalizeValue(settingsMap.app_name) || DEFAULT_APP_NAME;

const resolveFrontendUrl = (...candidates) => {
  for (const candidate of candidates) {
    const value = normalizeValue(candidate);
    if (!value || value === '*') continue;

    const firstValue = value.split(',').map(item => item.trim()).find(Boolean);
    if (!firstValue || firstValue === '*') continue;

    if (/^https?:\/\//i.test(firstValue)) {
      return firstValue.replace(/\/$/, '');
    }
  }

  return DEFAULT_FRONTEND_URL;
};

const resolveWebsiteHost = (frontendUrl) => {
  try {
    return new URL(frontendUrl).host;
  } catch (error) {
    return frontendUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') || 'localhost:4200';
  }
};

const replaceAppNameTokens = (value, appName) => {
  if (value === null || value === undefined) return value;

  return String(value)
    .replace(/\{\{\s*app_name\s*\}\}/gi, appName)
    .replace(/Nova\s*Vam\s*3D\s*SAC/gi, appName)
    .replace(/Nova\s*Vam\s*3D/gi, appName)
    .replace(/Nova\s*Vam/gi, appName);
};

const loadAppBranding = async () => {
  const settings = await Setting.findAll();
  const settingsMap = buildSettingsMap(settings);
  const appName = resolveAppName(settingsMap);
  const frontendUrl = resolveFrontendUrl(
    settingsMap.frontend_url,
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN
  );

  return {
    settingsMap,
    appName,
    frontendUrl,
    websiteHost: resolveWebsiteHost(frontendUrl)
  };
};

module.exports = {
  DEFAULT_APP_NAME,
  buildSettingsMap,
  resolveAppName,
  resolveFrontendUrl,
  resolveWebsiteHost,
  replaceAppNameTokens,
  loadAppBranding
};
