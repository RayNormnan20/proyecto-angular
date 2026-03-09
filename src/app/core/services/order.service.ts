import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Order {
  id_orden: number;
  usuario_id: number;
  fecha: string;
  total: string;
  estado: 'pendiente' | 'pagado' | 'enviado' | 'entregado' | 'cancelado';
  metodo_pago_id: number;
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

  updateOrderStatus(id: number, estado: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/status`, { estado });
  }

  downloadPDF(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
