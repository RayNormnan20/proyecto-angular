const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const Setting = require('../modules/settings/setting.model');
const EmailLog = require('../modules/email-logs/email-log.model');

const getTransporter = async () => {
  try {
    const settings = await Setting.findAll();
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.clave] = curr.valor;
      return acc;
    }, {});

    const host = settingsMap['email_host'] || process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(settingsMap['email_port']) || parseInt(process.env.EMAIL_PORT) || 587;
    const user = settingsMap['email_user'] || process.env.EMAIL_USER;
    const pass = settingsMap['email_pass'] || process.env.EMAIL_PASS;

    if (!user || !pass) {
      console.warn('Email credentials not found in settings or env vars.');
      return null;
    }

    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
          user,
          pass
        }
      }),
      from: user,
      settingsMap // Return settingsMap for use in other functions
    };
  } catch (error) {
    console.error('Error fetching email settings:', error);
    return null;
  }
};

const sendOrderConfirmation = async (order, user, items, pdfBuffer = null) => {
  const emailConfig = await getTransporter();

  if (!emailConfig) {
    console.warn('Skipping email send due to missing configuration.');
    return;
  }

  const { transporter, from, settingsMap } = emailConfig;

  // Datos de la empresa (configurables o por defecto)
  const empresaNombre = settingsMap['app_name'] || 'Nova Vam 3D';
  const empresaLogo = settingsMap['app_logo'] || ''; // URL del logo si existe

  // Obtener datos del método de pago directamente de la orden
  const paymentMethodName = order.paymentMethod?.nombre || 'Método de Pago';
  const paymentInstructionsText = order.paymentMethod?.instrucciones || 'Sigue las instrucciones proporcionadas en el checkout.';
  const paymentImage = order.paymentMethod?.imagen_url || '';

  // Construcción de instrucciones de pago dinámicas
  let paymentInstructions = '';
  const attachments = [];

  // Agregar PDF si existe
  if (pdfBuffer) {
    attachments.push({
      filename: `Orden-${order.id_orden}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    });
  }

  // Helper para adjuntar imágenes
  const addImageAttachment = (relativePath, cid) => {
    try {
        if (!relativePath) return null;
        // Eliminar slash inicial si existe para evitar problemas con path.join
        const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
        const fullPath = path.join(__dirname, '../../public', cleanPath);
        
        if (fs.existsSync(fullPath)) {
            attachments.push({
                filename: path.basename(fullPath),
                path: fullPath,
                cid: cid
            });
            return `cid:${cid}`;
        }
    } catch (e) {
        console.error('Error attaching image:', e);
    }
    return `${process.env.CORS_ORIGIN || 'http://localhost:3000'}${relativePath}`;
  };
  
  if (order.paymentMethod?.requiere_comprobante) {
     const paymentImageSrc = addImageAttachment(paymentImage, 'payment-qr');

     paymentInstructions = `
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #2c3e50; margin-top: 0;">Instrucciones de Pago (${paymentMethodName})</h3>
        
        <div style="margin-top: 15px;">
          <p style="white-space: pre-line;">${paymentInstructionsText}</p>
          
          ${paymentImage ? `
            <div style="margin-top: 15px; text-align: center;">
              <img src="${paymentImageSrc}" alt="QR / Imagen de Pago" style="max-width: 200px; border: 1px solid #ddd; padding: 5px; border-radius: 5px;">
            </div>
          ` : ''}
        </div>
      </div>
     `;
  }

  // Comprobante de Pago (si existe)
  let comprobanteHtml = '';
  if (order.comprobante_pago) {
    const comprobanteSrc = addImageAttachment(order.comprobante_pago, 'payment-proof');
    
    comprobanteHtml = `
    <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
      <h3>Comprobante de Pago Adjunto</h3>
      <div style="text-align: center; margin-top: 15px;">
        <img src="${comprobanteSrc}" alt="Comprobante de Pago" style="max-width: 100%; max-height: 400px; border: 1px solid #ddd; padding: 5px;">
      </div>
    </div>
    `;
  }

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.nombre || 'Producto no disponible'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.cantidad}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">S/ ${item.precio_unitario}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">S/ ${item.subtotal}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #3498db; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Gracias por tu pedido</h1>
        <p style="margin: 5px 0 0;">${empresaNombre}</p>
      </div>
      
      <div style="padding: 20px;">
        <p>Hola ${user.nombre},</p>
        <p>Gracias por tu pedido #${order.id_orden}. ${order.paymentMethod?.requiere_comprobante ? 'Está en espera hasta que confirmemos que se ha recibido el pago.' : 'Hemos recibido tu pedido correctamente.'}</p>
        
        ${paymentInstructions}
        
        ${comprobanteHtml}

        <h3>Detalles del Pedido</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 10px; text-align: left;">Producto</th>
              <th style="padding: 10px; text-align: left;">Cant.</th>
              <th style="padding: 10px; text-align: left;">Precio</th>
              <th style="padding: 10px; text-align: left;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 10px; font-weight: bold;">S/ ${order.total}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          <h3>Dirección de Facturación/Envío</h3>
          <p>${order.direccion_envio || 'No especificada'}</p>
        </div>
        
        <p style="margin-top: 30px; font-size: 12px; color: #7f8c8d; text-align: center;">
          ${empresaNombre} — Todos los derechos reservados
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Nova Vam 3D" <${from}>`,
      to: user.email,
      subject: `Hemos recibido tu pedido #${order.id_orden}`,
      html: html,
      attachments: attachments
    });
    console.log(`Correo de confirmación de pedido enviado a ${user.email}`);
    
    // Log success
    await EmailLog.create({
      destinatario: user.email,
      asunto: `Hemos recibido tu pedido #${order.id_orden}`,
      contenido: `Pedido ID: ${order.id_orden}, Total: ${order.total}`,
      tipo: 'orden',
      referencia_id: order.id_orden,
      estado: 'enviado'
    });
  } catch (error) {
    console.error('Error al enviar correo de confirmación de pedido:', error);
    
    // Log failure
    await EmailLog.create({
      destinatario: user.email,
      asunto: `Hemos recibido tu pedido #${order.id_orden}`,
      contenido: `Error al enviar: ${error.message}`,
      tipo: 'orden',
      referencia_id: order.id_orden,
      estado: 'fallido',
      error_mensaje: error.message
    });
  }
};

const sendWelcomeEmail = async (user) => {
  const emailConfig = await getTransporter();

  if (!emailConfig) {
    console.warn('Omitiendo envío de correo de bienvenida por falta de configuración.');
    return;
  }

  const { transporter, from, settingsMap } = emailConfig;

  // Datos de la empresa (configurables o por defecto)
  const empresaNombre = settingsMap['app_name'] || 'Nova Vam 3D';
  // const empresaLogo = settingsMap['app_logo'] || '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
        <h1 style="margin: 0;">¡Bienvenido/a a ${empresaNombre}!</h1>
      </div>
      
      <div style="padding: 20px;">
        <p>Hola ${user.nombre},</p>
        <p>Gracias por registrarte en nuestra tienda. Estamos encantados de tenerte con nosotros.</p>
        <p>Ahora puedes acceder a tu cuenta para realizar pedidos, ver tu historial y gestionar tus direcciones.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.CORS_ORIGIN || 'http://localhost:4200'}/login" style="background-color: #e74c3c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Iniciar Sesión</a>
        </div>
        
        <p style="margin-top: 30px; font-size: 12px; color: #7f8c8d; text-align: center;">
          ${empresaNombre} — Todos los derechos reservados
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Nova Vam 3D" <${from}>`,
      to: user.email,
      subject: `¡Bienvenido/a a ${empresaNombre}!`,
      html: html
    });
    console.log(`Correo de bienvenida enviado a ${user.email}`);

    // Log success
    await EmailLog.create({
      destinatario: user.email,
      asunto: `¡Bienvenido/a a ${empresaNombre}!`,
      contenido: `Bienvenida enviada a ${user.email}`,
      tipo: 'bienvenida',
      referencia_id: user.id_usuario,
      estado: 'enviado'
    });
  } catch (error) {
    console.error('Error al enviar correo de bienvenida:', error);

    // Log failure
    await EmailLog.create({
      destinatario: user.email,
      asunto: `¡Bienvenido/a a ${empresaNombre}!`,
      contenido: `Error al enviar bienvenida: ${error.message}`,
      tipo: 'bienvenida',
      referencia_id: user.id_usuario,
      estado: 'fallido',
      error_mensaje: error.message
    });
  }
};

const sendContactEmail = async (contactData) => {
  const emailConfig = await getTransporter();

  if (!emailConfig) {
    console.warn('Omitiendo envío de correo de contacto por falta de configuración.');
    return;
  }

  const { transporter, from, settingsMap } = emailConfig;
  const empresaNombre = settingsMap['app_name'] || 'Nova Vam 3D';
  // El correo de contacto de la empresa (a donde llegan los mensajes)
  const contactEmail = settingsMap['contact_email'] || process.env.CONTACT_EMAIL || from;

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background-color: #4f46e5; color: white; padding: 30px 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">Nuevo Mensaje de Contacto</h1>
        <p style="margin: 10px 0 0; opacity: 0.9; font-size: 14px;">${empresaNombre}</p>
      </div>

      <!-- Content -->
      <div style="padding: 30px;">
        <div style="margin-bottom: 25px; border-bottom: 1px solid #f0f0f0; padding-bottom: 15px;">
          <h2 style="margin: 0 0 15px; color: #1f2937; font-size: 18px;">Detalles del Remitente</h2>
          <p style="margin: 5px 0; color: #4b5563;"><strong>Nombre:</strong> ${contactData.name}</p>
          <p style="margin: 5px 0; color: #4b5563;"><strong>Email:</strong> <a href="mailto:${contactData.email}" style="color: #4f46e5; text-decoration: none;">${contactData.email}</a></p>
          <p style="margin: 5px 0; color: #4b5563;"><strong>Asunto:</strong> ${contactData.subject}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="margin: 0 0 15px; color: #1f2937; font-size: 18px;">Mensaje</h2>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #4f46e5; color: #374151; line-height: 1.6;">
            <p style="white-space: pre-wrap; margin: 0;">${contactData.message}</p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:${contactData.email}?subject=Re: ${contactData.subject}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Responder al Cliente</a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 12px; color: #6b7280;">
          Este mensaje fue enviado desde el formulario de contacto de <strong>${empresaNombre}</strong>.
        </p>
        <p style="margin: 5px 0 0; font-size: 12px; color: #9ca3af;">
          &copy; ${new Date().getFullYear()} ${empresaNombre}. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;

  try {
    // Enviar correo a la empresa
    await transporter.sendMail({
      from: `"Formulario de Contacto" <${from}>`,
      to: contactEmail,
      replyTo: contactData.email,
      subject: `[Contacto] ${contactData.subject}`,
      html: html
    });
    console.log(`Correo de contacto enviado a ${contactEmail}`);

    // Log success
    await EmailLog.create({
      destinatario: contactEmail,
      asunto: `[Contacto] ${contactData.subject}`,
      contenido: `De: ${contactData.name} (${contactData.email})\nMensaje: ${contactData.message}`,
      tipo: 'otro', // Podríamos agregar 'contacto' al ENUM si fuera necesario
      estado: 'enviado'
    });

  } catch (error) {
    console.error('Error al enviar correo de contacto:', error);

    // Log failure
    await EmailLog.create({
      destinatario: contactEmail,
      asunto: `[Contacto] ${contactData.subject}`,
      contenido: `Error al enviar contacto: ${error.message}`,
      tipo: 'otro',
      estado: 'fallido',
      error_mensaje: error.message
    });
    throw error; // Re-throw to handle in controller
  }
};

module.exports = { sendOrderConfirmation, sendWelcomeEmail, sendContactEmail };
