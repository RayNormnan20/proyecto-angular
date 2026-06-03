export interface Product {
  id_producto?: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  codigo_sku?: string;
  estado: 'activo' | 'inactivo' | 'agotado';
  visible_web: boolean;
  categoria_id?: number;
  marca_id?: number;
  created_at?: string;
  updated_at?: string;
  category?: Category;
  brand?: Brand;
  images?: ProductImage[];
  precios_volumen?: { min: number; precio: number }[];
}

export interface StockMovement {
  id_movimiento?: number;
  producto_id: number;
  tipo: 'entrada' | 'salida' | 'ajuste';
  motivo: string;
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  referencia_tipo?: string;
  referencia_id?: number;
  nota?: string;
  created_at?: string;
  user?: {
    id_usuario: number;
    nombre: string;
    apellidos?: string;
    email: string;
  } | null;
}

export interface Category {
  id_categoria?: number;
  nombre: string;
  descripcion?: string;
  estado: 'activo' | 'inactivo';
  imagen?: string;
  productos_count?: number;
}

export interface Brand {
  id_marca?: number;
  nombre: string;
  descripcion?: string;
  estado: 'activo' | 'inactivo';
}

export interface ProductImage {
  id_imagen?: number;
  producto_id: number;
  url: string;
  es_principal?: boolean;
  created_at?: string;
}
