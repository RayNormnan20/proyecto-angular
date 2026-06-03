const { Op } = require('sequelize');
const Coupon = require('./coupon.model');

const normalizeCouponCode = (code) => String(code || '').trim().toUpperCase();

const calculateCouponDiscount = (coupon, subtotal) => {
  const amount = Number(subtotal || 0);
  const rawValue = Number(coupon?.valor || 0);

  if (!coupon || amount <= 0 || rawValue <= 0) {
    return 0;
  }

  let discount = 0;
  if (coupon.tipo_descuento === 'porcentaje') {
    discount = (amount * rawValue) / 100;
  } else {
    discount = rawValue;
  }

  return Number(Math.min(Math.max(discount, 0), amount).toFixed(2));
};

const parseCouponDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    const dateOnlyMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateOnlyMatch) {
      const year = Number(dateOnlyMatch[1]);
      const month = Number(dateOnlyMatch[2]);
      const day = Number(dateOnlyMatch[3]);
      const date = new Date(year, month - 1, day);

      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
      ) {
        return null;
      }

      return date;
    }
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const normalizeDateBoundary = (value, boundary) => {
  const date = parseCouponDate(value);
  if (!date) {
    return null;
  }

  if (boundary === 'end') {
    date.setHours(23, 59, 59, 999);
  }

  return date;
};

const normalizeInputDateBoundary = (value, boundary) => {
  const date = parseCouponDate(value);
  if (!date) {
    return null;
  }

  if (boundary === 'start') {
    const now = new Date();
    date.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  } else {
    date.setHours(23, 59, 59, 999);
  }

  return date;
};

const resolveValidCoupon = async ({ codigo, subtotal, transaction = undefined }) => {
  const normalizedCode = normalizeCouponCode(codigo);
  if (!normalizedCode) {
    return { error: 'Debes ingresar un código de cupón válido.' };
  }

  const subtotalAmount = Number(subtotal || 0);
  if (Number.isNaN(subtotalAmount) || subtotalAmount <= 0) {
    return { error: 'El subtotal para validar el cupón es inválido.' };
  }

  const coupon = await Coupon.findOne({
    where: {
      codigo: normalizedCode,
      activo: true
    },
    transaction
  });

  if (!coupon) {
    return { error: 'El cupón no existe, no está activo o ya venció.' };
  }

  const now = new Date();
  const startDate = normalizeDateBoundary(coupon.fecha_inicio, 'start');
  const endDate = normalizeDateBoundary(coupon.fecha_fin, 'end');

  if ((startDate && now < startDate) || (endDate && now > endDate)) {
    return { error: 'El cupón no existe, no está activo o ya venció.' };
  }

  if (coupon.max_usos !== null && coupon.max_usos !== undefined && coupon.usos_actuales >= coupon.max_usos) {
    return { error: 'Este cupón ya alcanzó su límite de usos.' };
  }

  const minimumAmount = Number(coupon.monto_minimo || 0);
  if (subtotalAmount < minimumAmount) {
    return {
      error: `Este cupón requiere una compra mínima de S/ ${minimumAmount.toFixed(2)}.`
    };
  }

  const discount = calculateCouponDiscount(coupon, subtotalAmount);
  if (discount <= 0) {
    return { error: 'No se pudo aplicar el cupón al subtotal actual.' };
  }

  return {
    coupon,
    codigo: normalizedCode,
    discount
  };
};

module.exports = {
  normalizeCouponCode,
  calculateCouponDiscount,
  resolveValidCoupon,
  normalizeDateBoundary,
  normalizeInputDateBoundary
};
