const EmailLog = require('./email-log.model');
const { sendOrderConfirmation, sendWelcomeEmail } = require('../../utils/email.utils');
const Order = require('../orders/order.model');
const User = require('../users/user.model');
const OrderItem = require('../orders/order-item.model');
const Product = require('../products/product.model');
const PaymentMethod = require('../payment-methods/payment-method.model');

const getEmailLogs = async (req, res) => {
  try {
    const logs = await EmailLog.findAll({
      order: [['fecha_envio', 'DESC']],
      limit: 100 // Limit to last 100 logs
    });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener historial de correos', error });
  }
};

const resendEmail = async (req, res) => {
  const { id } = req.params;
  
  try {
    const log = await EmailLog.findByPk(id);
    if (!log) {
      return res.status(404).json({ message: 'Registro de correo no encontrado' });
    }

    // Intentar deducir tipo y referencia si faltan (para logs antiguos)
    if ((!log.tipo || log.tipo === 'otro') && !log.referencia_id) {
      if (log.asunto.includes('pedido #')) {
        const match = log.asunto.match(/#(\d+)/);
        if (match) {
          log.tipo = 'orden';
          log.referencia_id = parseInt(match[1]);
          // Actualizar log para el futuro
          await log.save();
        }
      } else if (log.asunto.toLowerCase().includes('bienvenid')) {
        const user = await User.findOne({ where: { email: log.destinatario } });
        if (user) {
          log.tipo = 'bienvenida';
          log.referencia_id = user.id_usuario;
          // Actualizar log para el futuro
          await log.save();
        }
      }
    }

    if (log.tipo === 'orden' && log.referencia_id) {
      // Reenviar correo de orden
      const order = await Order.findByPk(log.referencia_id, {
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [{ model: Product, as: 'product' }]
          },
          {
            model: User,
            as: 'user'
          },
          {
            model: PaymentMethod,
            as: 'paymentMethod'
          }
        ]
      });

      if (!order) {
        return res.status(404).json({ message: 'Orden original no encontrada' });
      }

      await sendOrderConfirmation(order, order.user, order.items);
      return res.json({ message: 'Correo de orden reenviado correctamente' });

    } else if (log.tipo === 'bienvenida' && log.referencia_id) {
      // Reenviar correo de bienvenida
      const user = await User.findByPk(log.referencia_id);
      
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      await sendWelcomeEmail(user);
      return res.json({ message: 'Correo de bienvenida reenviado correctamente' });
      
    } else {
      return res.status(400).json({ message: 'No se puede reenviado este tipo de correo (falta referencia o tipo no soportado)' });
    }

  } catch (error) {
    console.error('Error al reenviar correo:', error);
    res.status(500).json({ message: 'Error al reenviar el correo', error: error.message });
  }
};

module.exports = { getEmailLogs, resendEmail };
