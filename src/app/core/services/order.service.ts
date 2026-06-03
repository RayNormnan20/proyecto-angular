import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Order {
  id_orden: number;
  usuario_id: number;
  fecha: string;
  total: string;
  estado: 'pendiente' | 'pagado' | 'en_preparacion' | 'listo_envio' | 'enviado' | 'entregado' | 'cancelado' | 'devuelto';
  metodo_pago_id: number;
  empresa_envio?: string;
  numero_seguimiento?: string;
  url_seguimiento?: string;
  fecha_preparacion?: string;
  fecha_envio?: string;
  fecha_entrega_estimada?: string;
  fecha_entrega?: string;
  nota_estado?: string;
  paymentMethod?: {
    id_metodo_pago: number;
    nombre: string;
    imagen_url?: string;
  };
  direccion_envio: string;
  notas?: string;
  codigo_operacion?: string;
  comprobante_pago?: string;
  items?: OrderItem[];
  user?: {
    id_usuario: number;
    nombre: string;
    email: string;
  };
}

export interface OrderItem {
  id_detalle: number;
  orden_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
  product?: any;
}

export interface CreateOrderDto {
  items: { id_producto: number; cantidad: number }[];
  metodo_pago_id: number;
  direccion_envio: string;
  notas?: string;
  codigo_operacion?: string;
}

export interface UpdateOrderTrackingDto {
  estado: Order['estado'];
  empresa_envio?: string | null;
  numero_seguimiento?: string | null;
  url_seguimiento?: string | null;
  fecha_preparacion?: string | null;
  fecha_envio?: string | null;
  fecha_entrega_estimada?: string | null;
  fecha_entrega?: string | null;
  nota_estado?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  createOrder(orderData: CreateOrderDto | FormData): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData);
  }

  getOrders(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key]) {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  updateOrderStatus(id: number, payload: UpdateOrderTrackingDto): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/status`, payload);
  }

  downloadPDF(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
