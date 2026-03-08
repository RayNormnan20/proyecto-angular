const nodemailer = require('nodemailer');
const Setting = require('./setting.model');

const getSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    // Convert array to object for easier frontend consumption
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.clave] = curr.valor;
      return acc;
    }, {});
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener configuraciones', error });
  }
};

const updateSettings = async (req, res) => {
  try {
    const settings = req.body; // Expect { key: value, key2: value2 }
    const keys = Object.keys(settings);

    for (const key of keys) {
      // Find existing setting or create new one
      const [setting, created] = await Setting.findOrCreate({
        where: { clave: key },
        defaults: { valor: settings[key] }
      });

      if (!created) {
        setting.valor = settings[key];
        await setting.save();
      }
    }

    res.json({ message: 'Configuraciones actualizadas correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar configuraciones', error });
  }
};

const uploadQr = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
    }
    
    // Construct URL
    let imageUrl;
    if (req.file.path && req.file.path.startsWith('http')) {
      imageUrl = req.file.path;
    } else {
      imageUrl = `/uploads/settings/${req.file.filename}`;
    }
    
    // Update setting directly
    const [setting, created] = await Setting.findOrCreate({
      where: { clave: 'yape_qr' },
      defaults: { valor: imageUrl }
    });

    if (!created) {
      setting.valor = imageUrl;
      await setting.save();
    }

    res.json({ url: imageUrl, message: 'QR actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al subir imagen', error });
  }
};

const testEmail = async (req, res) => {
  try {
    const { email_host, email_port, email_user, email_pass } = req.body;

    if (!email_host || !email_port || !email_user || !email_pass) {
      return res.status(400).json({ message: 'Faltan credenciales de correo' });
    }

    const transporter = nodemailer.createTransport({
      host: email_host,
      port: parseInt(email_port),
      secure: parseInt(email_port) === 465,
      auth: {
        user: email_user,
        pass: email_pass
      }
    });

    await transporter.verify();

    // Send a test email
    await transporter.sendMail({
      from: `"Test Ecommerce" <${email_user}>`,
      to: email_user, // Send to self
      subject: 'Prueba de Configuración de Correo',
      text: 'Si estás leyendo esto, la configuración de correo es correcta.',
      html: '<b>Si estás leyendo esto, la configuración de correo es correcta.</b>'
    });

    res.json({ message: 'Correo de prueba enviado correctamente a ' + email_user });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ message: 'Error al enviar correo de prueba: ' + error.message });
  }
};

module.exports = { getSettings, updateSettings, uploadQr, testEmail };
