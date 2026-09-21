import { BulkImportProductRow, Product } from '../models/product.model';

const HEADER_ALIASES: Record<string, keyof BulkImportProductRow> = {
  id_producto: 'id_producto',
  producto_id: 'id_producto',
  nombre: 'nombre',
  producto: 'nombre',
  product_name: 'nombre',
  descripcion: 'descripcion',
  descripcion_corta: 'descripcion',
  detalle: 'descripcion',
  precio: 'precio',
  precio_venta: 'precio',
  price: 'precio',
  stock: 'stock',
  cantidad: 'stock',
  codigo_sku: 'codigo_sku',
  sku: 'codigo_sku',
  codigo: 'codigo_sku',
  categoria: 'categoria',
  categoria_id: 'categoria_id',
  id_categoria: 'categoria_id',
  marca: 'marca',
  marca_id: 'marca_id',
  id_marca: 'marca_id',
  estado: 'estado',
  visible_web: 'visible_web',
  visible: 'visible_web',
  publicado: 'visible_web',
  precios_volumen: 'precios_volumen',
  descuentos_volumen: 'precios_volumen',
  precios_por_volumen: 'precios_volumen'
};

export interface BulkImportParseResult {
  headers: string[];
  rows: BulkImportProductRow[];
  previewRows: BulkImportProductRow[];
  errors: string[];
}

const UTF16LE_BOM = new Uint8Array([0xff, 0xfe]);

const normalizeHeader = (value: string) =>
  value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '_');

const splitCsvLine = (line: string, delimiter: string): string[] => {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
};

const detectDelimiter = (headerLine: string): string => {
  const commaCount = splitCsvLine(headerLine, ',').length;
  const semicolonCount = splitCsvLine(headerLine, ';').length;
  return semicolonCount > commaCount ? ';' : ',';
};

export const parseBulkImportCsv = (content: string): BulkImportParseResult => {
  const sanitized = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim();

  if (!sanitized) {
    return {
      headers: [],
      rows: [],
      previewRows: [],
      errors: ['El archivo está vacío.']
    };
  }

  const rawLines = sanitized
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const lines = rawLines[0]?.toLowerCase().startsWith('sep=')
    ? rawLines.slice(1)
    : rawLines;

  if (lines.length < 2) {
    return {
      headers: [],
      rows: [],
      previewRows: [],
      errors: ['El archivo debe tener encabezados y al menos una fila de productos.']
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const rawHeaders = splitCsvLine(lines[0], delimiter).map(cell => cell.trim());
  const normalizedHeaders = rawHeaders.map(normalizeHeader);
  const mappedHeaders = normalizedHeaders.map(header => HEADER_ALIASES[header]);

  const errors: string[] = [];

  if (!mappedHeaders.includes('nombre')) {
    errors.push('Falta la columna "nombre".');
  }
  if (!mappedHeaders.includes('precio')) {
    errors.push('Falta la columna "precio".');
  }
  if (!mappedHeaders.includes('stock')) {
    errors.push('Falta la columna "stock".');
  }
  if (!mappedHeaders.includes('categoria') && !mappedHeaders.includes('categoria_id')) {
    errors.push('Debes incluir "categoria" o "categoria_id".');
  }
  if (!mappedHeaders.includes('marca') && !mappedHeaders.includes('marca_id')) {
    errors.push('Debes incluir "marca" o "marca_id".');
  }

  if (errors.length > 0) {
    return {
      headers: rawHeaders,
      rows: [],
      previewRows: [],
      errors
    };
  }

  const rows: BulkImportProductRow[] = lines.slice(1).map(line => {
    const values = splitCsvLine(line, delimiter);
    const row: BulkImportProductRow = {};

    mappedHeaders.forEach((header, index) => {
      if (!header) return;
      row[header] = (values[index] || '').trim();
    });

    return row;
  });

  return {
    headers: rawHeaders,
    rows,
    previewRows: rows.slice(0, 8),
    errors: []
  };
};

export const decodeCsvFileContent = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);

  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(bytes);
  }

  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(bytes);
  }

  const hasUtf16Pattern = bytes.some((byte, index) => index % 2 === 1 && byte === 0);
  if (hasUtf16Pattern) {
    return new TextDecoder('utf-16le').decode(bytes);
  }

  return new TextDecoder('utf-8').decode(bytes);
};

export const buildBulkImportTemplateCsv = (): string => [
  'sep=;',
  'id_producto;nombre;descripcion;precio;stock;codigo_sku;categoria;marca;estado;visible_web;precios_volumen',
  ';"Llaveros personalizados";"Llavero impreso en 3D";12.50;40;LLAV-001;"Accesorios";"Nova Vam";activo;true;"12:11.50|100:9.90"',
  ';"Maceta geométrica";"Modelo mediano para escritorio";28.90;15;MAC-010;"Decoración";"Nova Vam";activo;true;"6:26.50|24:24.00"'
].join('\r\n');

const escapeCsvValue = (value: string | number | boolean | null | undefined): string => {
  const normalized = String(value ?? '');
  const escaped = normalized.replace(/"/g, '""');
  return `"${escaped}"`;
};

const serializeVolumePrices = (tiers: Product['precios_volumen']): string => {
  if (!Array.isArray(tiers) || tiers.length === 0) return '';
  return tiers
    .map(tier => `${tier.min}:${Number(tier.precio).toFixed(2)}`)
    .join('|');
};

export const buildBulkExportCsv = (products: Product[]): string => [
  'sep=;',
  'id_producto;nombre;descripcion;precio;stock;codigo_sku;categoria;marca;estado;visible_web;precios_volumen',
  ...[...products]
    .sort((a, b) => Number(a.id_producto || 0) - Number(b.id_producto || 0))
    .map(product => [
    escapeCsvValue(product.id_producto ?? ''),
    escapeCsvValue(product.nombre ?? ''),
    escapeCsvValue(product.descripcion ?? ''),
    escapeCsvValue(product.precio ?? ''),
    escapeCsvValue(product.stock ?? ''),
    escapeCsvValue(product.codigo_sku ?? ''),
    escapeCsvValue(product.category?.nombre ?? ''),
    escapeCsvValue(product.brand?.nombre ?? ''),
    escapeCsvValue(product.estado ?? 'activo'),
    escapeCsvValue(product.visible_web ? 'true' : 'false'),
    escapeCsvValue(serializeVolumePrices(product.precios_volumen))
  ].join(';'))
].join('\r\n');

export const encodeCsvForExcel = (content: string): ArrayBuffer => {
  const normalized = content.replace(/\r?\n/g, '\r\n');
  const bytes = new Uint8Array(UTF16LE_BOM.length + normalized.length * 2);
  bytes.set(UTF16LE_BOM, 0);

  for (let index = 0; index < normalized.length; index += 1) {
    const code = normalized.charCodeAt(index);
    const offset = UTF16LE_BOM.length + (index * 2);
    bytes[offset] = code & 0xff;
    bytes[offset + 1] = code >> 8;
  }

  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
};
