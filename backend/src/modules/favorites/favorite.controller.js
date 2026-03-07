const { Favorite, Product, ProductImage, Brand, Category, User } = require('../associations');

exports.addFavorite = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { producto_id } = req.body;

    if (!producto_id) {
      return res.status(400).json({ message: 'El ID del producto es requerido' });
    }

    const product = await Product.findByPk(producto_id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Check if already exists
    const existing = await Favorite.findOne({
      where: { usuario_id, producto_id }
    });

    if (existing) {
      return res.status(400).json({ message: 'El producto ya está en favoritos' });
    }

    await Favorite.create({ usuario_id, producto_id });

    res.status(201).json({ message: 'Producto agregado a favoritos' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al agregar a favoritos' });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { producto_id } = req.params;

    const deleted = await Favorite.destroy({
      where: { usuario_id, producto_id }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'El producto no estaba en favoritos' });
    }

    res.json({ message: 'Producto eliminado de favoritos' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar de favoritos' });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    // We want to find products that have a favorite entry for this user
    const favorites = await Product.findAll({
      include: [
        {
          model: User,
          as: 'favoritedBy',
          where: { id_usuario: usuario_id },
          attributes: [], // We don't need user details in the output
          through: { attributes: [] } // Hide the join table attributes
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id_imagen', 'url']
        },
        {
          model: Brand,
          as: 'brand',
          attributes: ['nombre']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['nombre']
        }
      ]
    });

    res.json(favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener favoritos' });
  }
};

exports.checkFavorite = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { producto_id } = req.params;

    const favorite = await Favorite.findOne({
      where: { usuario_id, producto_id }
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al verificar favorito' });
  }
};
