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
}

export interface Category {
  id_categoria?: number;
  nombre: string;
  descripcion?: string;
  estado: 'activo' | 'inactivo';
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
  created_at?: string;
}
