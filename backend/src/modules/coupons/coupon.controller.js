const Coupon = require('./coupon.model');
const { resolveValidCoupon, normalizeCouponCode, normalizeInputDateBoundary } = require('./coupon.utils');

const serializeCoupon = (coupon) => ({
  id_cupon: coupon.id_cupon,
  codigo: coupon.codigo,
  descripcion: coupon.descripcion,
  tipo_descuento: coupon.tipo_descuento,
  valor: Number(coupon.valor || 0),
  monto_minimo: Number(coupon.monto_minimo || 0),
  fecha_inicio: coupon.fecha_inicio,
  fecha_fin: coupon.fecha_fin,
  max_usos: coupon.max_usos,
  usos_actuales: coupon.usos_actuales,
  activo: Boolean(coupon.activo)
});

const normalizeNullableDate = (value, boundary = 'start') => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return normalizeInputDateBoundary(value, boundary);
};

const normalizePositiveNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

exports.getCoupons = async (_req, res) => {
  try {
    const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
    res.json(coupons.map(serializeCoupon));
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ message: 'Error al obtener los cupones' });
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    const { codigo, subtotal } = req.body;
    const result = await resolveValidCoupon({ codigo, subtotal });

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    res.json({
      coupon: serializeCoupon(result.coupon),
      discount: result.discount,
      message: 'Cupón aplicado correctamente'
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ message: 'Error al validar el cupón' });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const codigo = normalizeCouponCode(req.body.codigo);
    const valor = normalizePositiveNumber(req.body.valor);
    const montoMinimo = normalizePositiveNumber(req.body.monto_minimo ?? 0);
    const maxUsos = req.body.max_usos === '' || req.body.max_usos === null || req.body.max_usos === undefined
      ? null
      : normalizePositiveNumber(req.body.max_usos);
    const fechaInicio = normalizeNullableDate(req.body.fecha_inicio, 'start');
    const fechaFin = normalizeNullableDate(req.body.fecha_fin, 'end');

    if (!codigo) {
      return res.status(400).json({ message: 'El código es obligatorio' });
    }

    if (!['porcentaje', 'monto_fijo'].includes(req.body.tipo_descuento)) {
      return res.status(400).json({ message: 'Tipo de descuento inválido' });
    }

    if (valor === null || valor <= 0) {
      return res.status(400).json({ message: 'El valor del descuento debe ser mayor a 0' });
    }

    if (montoMinimo === null) {
      return res.status(400).json({ message: 'El monto mínimo es inválido' });
    }

    if (maxUsos === null && req.body.max_usos !== '' && req.body.max_usos !== null && req.body.max_usos !== undefined) {
      return res.status(400).json({ message: 'El límite de usos es inválido' });
    }

    if ((req.body.fecha_inicio && !fechaInicio) || (req.body.fecha_fin && !fechaFin)) {
      return res.status(400).json({ message: 'Una o más fechas del cupón son inválidas' });
    }

    if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
      return res.status(400).json({ message: 'La fecha de inicio no puede ser mayor que la fecha de fin' });
    }

    const exists = await Coupon.findOne({ where: { codigo } });
    if (exists) {
      return res.status(400).json({ message: 'Ya existe un cupón con ese código' });
    }

    const coupon = await Coupon.create({
      codigo,
      descripcion: String(req.body.descripcion || '').trim() || null,
      tipo_descuento: req.body.tipo_descuento,
      valor,
      monto_minimo: montoMinimo,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      max_usos: maxUsos,
      activo: req.body.activo !== false && req.body.activo !== 'false'
    });

    res.status(201).json(serializeCoupon(coupon));
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ message: 'Error al crear el cupón' });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Cupón no encontrado' });
    }

    const codigo = req.body.codigo !== undefined ? normalizeCouponCode(req.body.codigo) : coupon.codigo;
    const valor = req.body.valor !== undefined ? normalizePositiveNumber(req.body.valor) : Number(coupon.valor);
    const montoMinimo = req.body.monto_minimo !== undefined ? normalizePositiveNumber(req.body.monto_minimo) : Number(coupon.monto_minimo || 0);
    const maxUsos = req.body.max_usos === undefined
      ? coupon.max_usos
      : (req.body.max_usos === '' || req.body.max_usos === null ? null : normalizePositiveNumber(req.body.max_usos));
    const fechaInicio = normalizeNullableDate(req.body.fecha_inicio, 'start');
    const fechaFin = normalizeNullableDate(req.body.fecha_fin, 'end');

    if (!codigo) {
      return res.status(400).json({ message: 'El código es obligatorio' });
    }

    if (req.body.tipo_descuento !== undefined && !['porcentaje', 'monto_fijo'].includes(req.body.tipo_descuento)) {
      return res.status(400).json({ message: 'Tipo de descuento inválido' });
    }

    if (valor === null || valor <= 0) {
      return res.status(400).json({ message: 'El valor del descuento debe ser mayor a 0' });
    }

    if (montoMinimo === null) {
      return res.status(400).json({ message: 'El monto mínimo es inválido' });
    }

    if (maxUsos === null && req.body.max_usos !== '' && req.body.max_usos !== null && req.body.max_usos !== undefined) {
      return res.status(400).json({ message: 'El límite de usos es inválido' });
    }

    if ((req.body.fecha_inicio && !fechaInicio) || (req.body.fecha_fin && !fechaFin)) {
      return res.status(400).json({ message: 'Una o más fechas del cupón son inválidas' });
    }

    const nextFechaInicio = req.body.fecha_inicio !== undefined ? fechaInicio : coupon.fecha_inicio;
    const nextFechaFin = req.body.fecha_fin !== undefined ? fechaFin : coupon.fecha_fin;
    if (nextFechaInicio && nextFechaFin && nextFechaInicio > nextFechaFin) {
      return res.status(400).json({ message: 'La fecha de inicio no puede ser mayor que la fecha de fin' });
    }

    const existingCoupon = await Coupon.findOne({ where: { codigo } });
    if (existingCoupon && existingCoupon.id_cupon !== coupon.id_cupon) {
      return res.status(400).json({ message: 'Ya existe un cupón con ese código' });
    }

    coupon.codigo = codigo;
    if (req.body.descripcion !== undefined) coupon.descripcion = String(req.body.descripcion || '').trim() || null;
    if (req.body.tipo_descuento !== undefined) coupon.tipo_descuento = req.body.tipo_descuento;
    coupon.valor = valor;
    coupon.monto_minimo = montoMinimo;
    if (req.body.fecha_inicio !== undefined) coupon.fecha_inicio = fechaInicio;
    if (req.body.fecha_fin !== undefined) coupon.fecha_fin = fechaFin;
    if (req.body.max_usos !== undefined) coupon.max_usos = maxUsos;
    if (req.body.activo !== undefined) coupon.activo = req.body.activo !== false && req.body.activo !== 'false';

    await coupon.save();
    res.json(serializeCoupon(coupon));
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ message: 'Error al actualizar el cupón' });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Cupón no encontrado' });
    }

    await coupon.destroy();
    res.json({ message: 'Cupón eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ message: 'Error al eliminar el cupón' });
  }
};
