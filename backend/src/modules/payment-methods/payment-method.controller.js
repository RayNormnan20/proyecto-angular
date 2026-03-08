const PaymentMethod = require('./payment-method.model');

exports.getAll = async (req, res) => {
  try {
    const whereClause = {};
    // Only filter by active if not requested otherwise
    if (req.query.includeInactive !== 'true') {
      whereClause.activo = true;
    }

    const methods = await PaymentMethod.findAll({
      where: whereClause
    });
    res.json(methods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const method = await PaymentMethod.findByPk(req.params.id);
    if (!method) return res.status(404).json({ message: 'Método de pago no encontrado' });
    res.json(method);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const method = await PaymentMethod.create(req.body);
    res.status(201).json(method);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const method = await PaymentMethod.findByPk(req.params.id);
    if (!method) return res.status(404).json({ message: 'Método de pago no encontrado' });
    await method.update(req.body);
    res.json(method);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    const method = await PaymentMethod.findByPk(req.params.id);
    if (!method) return res.status(404).json({ message: 'Método de pago no encontrado' });

    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
    }

    let imagePath;
    
    // Check if file was uploaded to Cloudinary
    if (req.file.path && req.file.path.startsWith('http')) {
      imagePath = req.file.path;
    } else {
      // Normalize path to use forward slashes and ensure it starts with /uploads
      imagePath = req.file.path.replace(/\\/g, '/');
      // Ensure the path is relative to the server root for public access
      // Assuming 'uploads' is served statically
      if (imagePath.includes('uploads/')) {
          imagePath = '/uploads/' + imagePath.split('uploads/')[1];
      }
    }

    await method.update({ imagen_url: imagePath });
    res.json({ message: 'Imagen actualizada', url: imagePath, method });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const method = await PaymentMethod.findByPk(req.params.id);
    if (!method) return res.status(404).json({ message: 'Método de pago no encontrado' });
    await method.update({ activo: false }); // Soft delete
    res.json({ message: 'Método de pago desactivado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
