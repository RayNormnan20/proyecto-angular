const { ProductReview, Product, User, Order, OrderItem } = require('../associations');

const REVIEW_INCLUDE = [
  {
    model: User,
    as: 'user',
    attributes: ['id_usuario', 'nombre']
  },
  {
    model: Product,
    as: 'product',
    attributes: ['id_producto', 'nombre', 'codigo_sku']
  }
];

const serializeReview = (review) => ({
  id_resena: review.id_resena,
  producto_id: review.producto_id,
  usuario_id: review.usuario_id,
  orden_id: review.orden_id,
  puntuacion: Number(review.puntuacion || 0),
  comentario: review.comentario,
  visible: Boolean(review.visible),
  created_at: review.createdAt,
  updated_at: review.updatedAt,
  user: review.user ? {
    id_usuario: review.user.id_usuario,
    nombre: review.user.nombre
  } : null,
  product: review.product ? {
    id_producto: review.product.id_producto,
    nombre: review.product.nombre,
    codigo_sku: review.product.codigo_sku
  } : null
});

const normalizeReviewPayload = (body) => {
  const puntuacion = Number.parseInt(body?.puntuacion, 10);
  const comentario = String(body?.comentario || '').trim();

  if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
    return { error: 'La puntuación debe estar entre 1 y 5 estrellas.' };
  }

  if (comentario.length < 3) {
    return { error: 'El comentario debe tener al menos 3 caracteres.' };
  }

  return { puntuacion, comentario };
};

const findDeliveredPurchase = async ({ usuario_id, producto_id }) => {
  return OrderItem.findOne({
    where: { producto_id },
    include: [
      {
        model: Order,
        as: 'order',
        where: {
          usuario_id,
          estado: 'entregado'
        },
        attributes: ['id_orden', 'estado', 'fecha']
      }
    ],
    order: [[{ model: Order, as: 'order' }, 'fecha', 'DESC']]
  });
};

exports.getAdminReviews = async (req, res) => {
  try {
    const reviews = await ProductReview.findAll({
      include: REVIEW_INCLUDE,
      order: [['createdAt', 'DESC']]
    });

    res.json(reviews.map(serializeReview));
  } catch (error) {
    console.error('Error al obtener reseñas admin:', error);
    res.status(500).json({ message: 'Error al obtener las reseñas' });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const producto_id = Number.parseInt(req.params.productId, 10);
    if (!Number.isInteger(producto_id) || producto_id <= 0) {
      return res.status(400).json({ message: 'Producto inválido' });
    }

    const product = await Product.findByPk(producto_id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const reviews = await ProductReview.findAll({
      where: {
        producto_id,
        visible: true
      },
      include: REVIEW_INCLUDE,
      order: [['createdAt', 'DESC']]
    });

    const total = reviews.length;
    const average = total
      ? Number((reviews.reduce((acc, review) => acc + Number(review.puntuacion || 0), 0) / total).toFixed(1))
      : 0;

    res.json({
      summary: {
        average,
        total,
        distribution: [1, 2, 3, 4, 5].map(star => ({
          estrellas: star,
          total: reviews.filter(review => Number(review.puntuacion) === star).length
        }))
      },
      reviews: reviews.map(serializeReview)
    });
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ message: 'Error al obtener las reseñas del producto' });
  }
};

exports.getMyReviewStatus = async (req, res) => {
  try {
    const producto_id = Number.parseInt(req.params.productId, 10);
    const usuario_id = req.user.id;

    if (!Number.isInteger(producto_id) || producto_id <= 0) {
      return res.status(400).json({ message: 'Producto inválido' });
    }

    const [product, review, purchase] = await Promise.all([
      Product.findByPk(producto_id),
      ProductReview.findOne({
        where: { producto_id, usuario_id },
        include: REVIEW_INCLUDE
      }),
      findDeliveredPurchase({ usuario_id, producto_id })
    ]);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({
      canReview: Boolean(purchase),
      hasPurchased: Boolean(purchase),
      purchaseOrderId: purchase?.order?.id_orden || null,
      review: review ? serializeReview(review) : null
    });
  } catch (error) {
    console.error('Error al obtener estado de reseña:', error);
    res.status(500).json({ message: 'Error al verificar si puedes reseñar este producto' });
  }
};

exports.createReview = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const producto_id = Number.parseInt(req.body.producto_id, 10);

    if (!Number.isInteger(producto_id) || producto_id <= 0) {
      return res.status(400).json({ message: 'Producto inválido' });
    }

    const normalizedPayload = normalizeReviewPayload(req.body);
    if (normalizedPayload.error) {
      return res.status(400).json({ message: normalizedPayload.error });
    }

    const [product, existingReview, purchase] = await Promise.all([
      Product.findByPk(producto_id),
      ProductReview.findOne({ where: { producto_id, usuario_id } }),
      findDeliveredPurchase({ usuario_id, producto_id })
    ]);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (!purchase) {
      return res.status(403).json({ message: 'Solo puedes reseñar productos que ya compraste y recibiste.' });
    }

    if (existingReview) {
      return res.status(400).json({ message: 'Ya registraste una reseña para este producto.' });
    }

    const review = await ProductReview.create({
      producto_id,
      usuario_id,
      orden_id: purchase.order?.id_orden || null,
      puntuacion: normalizedPayload.puntuacion,
      comentario: normalizedPayload.comentario
    });

    const createdReview = await ProductReview.findByPk(review.id_resena, { include: REVIEW_INCLUDE });
    res.status(201).json(serializeReview(createdReview));
  } catch (error) {
    console.error('Error al crear reseña:', error);
    res.status(500).json({ message: 'Error al crear la reseña' });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const review = await ProductReview.findByPk(req.params.id, { include: REVIEW_INCLUDE });

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    if (review.usuario_id !== usuario_id) {
      return res.status(403).json({ message: 'No puedes editar esta reseña' });
    }

    const normalizedPayload = normalizeReviewPayload(req.body);
    if (normalizedPayload.error) {
      return res.status(400).json({ message: normalizedPayload.error });
    }

    review.puntuacion = normalizedPayload.puntuacion;
    review.comentario = normalizedPayload.comentario;
    await review.save();

    const updatedReview = await ProductReview.findByPk(review.id_resena, { include: REVIEW_INCLUDE });
    res.json(serializeReview(updatedReview));
  } catch (error) {
    console.error('Error al actualizar reseña:', error);
    res.status(500).json({ message: 'Error al actualizar la reseña' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const review = await ProductReview.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    if (review.usuario_id !== usuario_id) {
      return res.status(403).json({ message: 'No puedes eliminar esta reseña' });
    }

    await review.destroy();
    res.json({ message: 'Reseña eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar reseña:', error);
    res.status(500).json({ message: 'Error al eliminar la reseña' });
  }
};

exports.updateReviewVisibility = async (req, res) => {
  try {
    const review = await ProductReview.findByPk(req.params.id, { include: REVIEW_INCLUDE });

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    review.visible = Boolean(req.body?.visible);
    await review.save();

    const updatedReview = await ProductReview.findByPk(review.id_resena, { include: REVIEW_INCLUDE });
    res.json(serializeReview(updatedReview));
  } catch (error) {
    console.error('Error al actualizar visibilidad de reseña:', error);
    res.status(500).json({ message: 'Error al actualizar la visibilidad de la reseña' });
  }
};

exports.deleteAdminReview = async (req, res) => {
  try {
    const review = await ProductReview.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    await review.destroy();
    res.json({ message: 'Reseña eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar reseña admin:', error);
    res.status(500).json({ message: 'Error al eliminar la reseña' });
  }
};
