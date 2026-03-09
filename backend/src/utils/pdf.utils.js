const pdfmake = require('pdfmake');

const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

pdfmake.setFonts(fonts);

// Función simple para convertir número a texto (para el "SON: ...")
const numeroALetras = (num) => {
    const entero = Math.floor(num);
    const decimal = Math.round((num - entero) * 100);
    const decimalStr = decimal < 10 ? `0${decimal}` : `${decimal}`;
    
    // Esta es una implementación simplificada. Para producción robusta usar librería 'numero-a-letras'
    // Aquí devolvemos el formato requerido con el monto numérico si es complejo, 
    // o un texto básico si es simple.
    // Por ahora, usaremos el formato estándar de facturación peruana:
    return `${entero} CON ${decimalStr}/100 SOLES`; 
};

const generateOrderPDF = (order, items) => {
  return new Promise((resolve, reject) => {
    try {
      const primaryColor = '#000000'; // Negro para formato formal
      const secondaryColor = '#4b5563'; // Gris oscuro
      const borderColor = '#000000'; // Bordes negros tipo factura

      // Datos de la empresa (Valores por defecto, idealmente vendrían de configuración)
      const empresa = {
        nombre: 'NOVA VAM 3D',
        ruc: '20600000001', // RUC referencial
        direccion: 'Lima, Perú',
        telefono: '',
        email: 'contacto@novavam3d.com',
        web: 'www.novavam3d.com'
      };

      // Cálculos
      const isNotaVenta = true; // Configurado como Nota de Venta según requerimiento
      const total = Number(order.total);
      
      let subtotal = total / 1.18;
      let igv = total - subtotal;

      if (isNotaVenta) {
        subtotal = total;
        igv = 0;
      }

      // --- LOGICA DE LLENADO DE TABLA (FILAS VACIAS) ---
      const MIN_ROWS = 28; // Número mínimo de filas para llenar la hoja A4 aprox
      const itemRows = items.map((item, index) => [
        { text: index + 1, alignment: 'center' },
        { text: item.product?.nombre || 'Producto', alignment: 'left' },
        { text: 'UND', alignment: 'center' },
        { text: item.cantidad, alignment: 'center' },
        { text: Number(item.precio_unitario).toFixed(2), alignment: 'right' },
        { text: Number(item.subtotal).toFixed(2), alignment: 'right' }
      ]);

      // Agregar filas vacías si es necesario para completar la hoja
      if (itemRows.length < MIN_ROWS) {
        const emptyRowsCount = MIN_ROWS - itemRows.length;
        for (let i = 0; i < emptyRowsCount; i++) {
          itemRows.push([
            { text: ' ', alignment: 'center', minHeight: 12 }, // Espacio en blanco con altura mínima
            { text: ' ', alignment: 'left' },
            { text: ' ', alignment: 'center' },
            { text: ' ', alignment: 'center' },
            { text: ' ', alignment: 'right' },
            { text: ' ', alignment: 'right' }
          ]);
        }
      }

      const docDefinition = {
        defaultStyle: {
          font: 'Helvetica',
          fontSize: 8,
          color: '#000000',
          lineHeight: 1.2
        },
        pageMargins: [30, 30, 30, 30],
        content: [
          // --- HEADER SECTION (3 Columnas: Logo - Info Empresa - RUC) ---
          {
            columns: [
              // Columna 1: Logo (Texto simulado por ahora)
              {
                width: '25%',
                stack: [
                  { text: 'NOVA VAM 3D', style: 'logo', alignment: 'center' },
                  { text: 'IMPRESIÓN 3D Y DISEÑO', fontSize: 7, alignment: 'center', margin: [0, 2, 0, 0] }
                ]
              },
              // Columna 2: Datos de Empresa
              {
                width: '40%',
                stack: [
                  { text: empresa.nombre, style: 'companyName', alignment: 'center' },
                  { text: empresa.direccion, fontSize: 8, alignment: 'center' },
                  { text: `Telf: ${empresa.telefono} | Email: ${empresa.email}`, fontSize: 8, alignment: 'center' },
                  { text: empresa.web, fontSize: 8, alignment: 'center', color: '#666666' }
                ],
                margin: [10, 0, 10, 0]
              },
              // Columna 3: Recuadro RUC
              {
                width: '35%',
                table: {
                  widths: ['*'],
                  body: [
                    [
                      {
                        stack: [
                          { text: `R.U.C. ${empresa.ruc}`, style: 'rucTitle', margin: [0, 5, 0, 2] },
                          { text: 'NOTA DE VENTA', style: 'docTitle', margin: [0, 2, 0, 2] }, // O FACTURA ELECTRÓNICA
                          { text: `N° ${String(order.id_orden).padStart(8, '0')}`, style: 'docNumber', margin: [0, 2, 0, 5] }
                        ],
                        alignment: 'center',
                        border: [true, true, true, true],
                        borderColor: borderColor
                      }
                    ]
                  ]
                },
                layout: {
                  defaultBorder: true
                }
              }
            ]
          },
          '\n',

          // --- CLIENT INFO SECTION ---
          {
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 1 }]
          },
          {
            margin: [0, 5, 0, 5],
            columns: [
              {
                width: '60%',
                stack: [
                  { 
                    text: [
                      { text: 'Señor(es): ', bold: true }, 
                      order.user?.nombre || 'Cliente General'
                    ]
                  },
                  { 
                    text: [
                      { text: 'Dirección: ', bold: true }, 
                      order.direccion_envio || 'Dirección no especificada'
                    ],
                    margin: [0, 2, 0, 0]
                  },
                  {
                    text: [
                      { text: 'Tipo Moneda: ', bold: true },
                      'SOLES'
                    ],
                    margin: [0, 2, 0, 0]
                  }
                ]
              },
              {
                width: '40%',
                stack: [
                  { 
                    text: [
                      { text: 'Fecha Emisión: ', bold: true }, 
                      new Date(order.createdAt).toLocaleDateString()
                    ]
                  },
                  { 
                    text: [
                      { text: 'Método de Pago: ', bold: true }, 
                      order.paymentMethod?.nombre || 'No especificado'
                    ],
                    margin: [0, 2, 0, 0]
                  },
                  {
                    text: [
                      { text: 'Estado: ', bold: true },
                      order.estado.toUpperCase()
                    ],
                    margin: [0, 2, 0, 0]
                  }
                ]
              }
            ]
          },
          {
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 1 }]
          },
          '\n',

          // --- ITEMS TABLE ---
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
              body: [
                // Header
                [
                  { text: 'ITEM', style: 'tableHeader', alignment: 'center' },
                  { text: 'DESCRIPCIÓN', style: 'tableHeader', alignment: 'left' },
                  { text: 'UNID', style: 'tableHeader', alignment: 'center' },
                  { text: 'CANT.', style: 'tableHeader', alignment: 'center' },
                  { text: 'P.UNIT', style: 'tableHeader', alignment: 'right' },
                  { text: 'IMPORTE', style: 'tableHeader', alignment: 'right' }
                ],
                // Items
                ...itemRows
              ]
            },
            layout: {
              hLineWidth: function (i, node) {
                // Solo dibujar línea superior (header), inferior del header, y final de tabla
                // i === 0: borde superior tabla
                // i === 1: borde inferior header
                // i === node.table.body.length: borde inferior tabla
                return (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0;
              },
              vLineWidth: function (i, node) {
                // Dibujar todas las líneas verticales
                return 1;
              },
              hLineColor: function (i, node) {
                return borderColor;
              },
              vLineColor: function (i, node) {
                return borderColor;
              },
              paddingLeft: function(i) { return 4; },
              paddingRight: function(i) { return 4; },
              paddingTop: function(i) { return 4; },
              paddingBottom: function(i) { return 4; }
            }
          },
          
          // --- TOTALS & FOOTER SECTION ---
          {
            margin: [0, 5, 0, 0],
            table: {
              widths: ['*', 180],
              body: [
                [
                  {
                    border: [true, true, true, true],
                    stack: [
                      { text: `SON: ${numeroALetras(total)}`, bold: true, fontSize: 9, margin: [5, 5, 0, 5] },
                      { 
                        text: 'INFORMACIÓN DE PAGO:', 
                        bold: true, 
                        fontSize: 8, 
                        margin: [5, 5, 0, 2],
                        decoration: 'underline'
                      },
                      {
                        text: order.paymentMethod?.instrucciones || 'Consulte los detalles de pago en su cuenta.',
                        fontSize: 7,
                        margin: [15, 0, 0, 5]
                      }
                    ]
                  },
                  {
                    border: [false, false, false, false],
                    table: {
                      widths: ['*', 'auto'],
                      body: [
                        [
                          { text: 'OP. GRAVADA', bold: true, alignment: 'right', border: [true, true, true, true] },
                          { text: `S/. ${subtotal.toFixed(2)}`, alignment: 'right', border: [true, true, true, true] }
                        ],
                        [
                          { text: 'I.G.V. (18%)', bold: true, alignment: 'right', border: [true, true, true, true] },
                          { text: `S/. ${igv.toFixed(2)}`, alignment: 'right', border: [true, true, true, true] }
                        ],
                        [
                          { text: 'TOTAL A PAGAR', bold: true, alignment: 'right', border: [true, true, true, true], fillColor: '#e5e7eb' },
                          { text: `S/. ${total.toFixed(2)}`, bold: true, alignment: 'right', border: [true, true, true, true], fillColor: '#e5e7eb' }
                        ]
                      ]
                    },
                    layout: {
                        defaultBorder: true
                    }
                  }
                ]
              ]
            },
            layout: {
                defaultBorder: false
            }
          },

          '\n\n',
          // --- FOOTER ---
          {
            columns: [
                { width: '*', text: '' },
                {
                    width: 'auto',
                    stack: [
                        { text: 'CANCELADO', bold: true, fontSize: 14, alignment: 'center', color: '#059669', opacity: 0.5, margin: [0, 0, 0, 5] },
                        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 100, y2: 0, lineWidth: 1 }] },
                        { text: 'Firma Autorizada', fontSize: 7, alignment: 'center', margin: [0, 2, 0, 0] }
                    ],
                    alignment: 'center'
                },
                { width: '*', text: '' }
            ]
          },
          {
            text: 'Representación impresa de la Venta Electrónica. Consulte su documento en www.novavam3d.com',
            alignment: 'center',
            fontSize: 7,
            margin: [0, 20, 0, 0],
            color: '#666666'
          }
        ],
        styles: {
          logo: {
            fontSize: 18,
            bold: true,
            color: '#4f46e5' // Indigo corporativo
          },
          companyName: {
            fontSize: 14,
            bold: true,
            color: '#000000'
          },
          rucTitle: {
            fontSize: 11,
            bold: true
          },
          docTitle: {
            fontSize: 10,
            bold: true,
            color: '#ffffff',
            background: '#4f46e5', // Fondo Indigo para el título tipo factura
            alignment: 'center',
            padding: 5
          },
          docNumber: {
            fontSize: 12,
            bold: true,
            color: '#4f46e5' // Indigo para el número
          },
          tableHeader: {
            bold: true,
            fontSize: 8,
            color: '#ffffff',
            fillColor: '#4f46e5' // Indigo fondo cabecera
          }
        }
      };

      // Ajuste específico para el título del documento en el recuadro RUC
      // pdfmake no soporta 'background' directo en texto dentro de stack tan fácil como CSS,
      // así que usamos fillColor en la celda de la tabla si fuera necesario, 
      // o simplificamos el estilo del título.
      // En la referencia es texto negro dentro del cuadro. Lo dejaremos simple y limpio.
      
      const pdf = pdfmake.createPdf(docDefinition);
      pdf.getBuffer().then(resolve).catch(reject);

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateOrderPDF };
