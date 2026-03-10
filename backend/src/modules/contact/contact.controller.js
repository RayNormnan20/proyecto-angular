const { sendContactEmail } = require('../../utils/email.utils');

const sendMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validación básica
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Enviar correo
    await sendContactEmail({ name, email, subject, message });

    res.json({ message: 'Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.' });
  } catch (error) {
    console.error('Error en controlador de contacto:', error);
    res.status(500).json({ message: 'Error al enviar el mensaje. Por favor intenta más tarde.' });
  }
};

module.exports = { sendMessage };
