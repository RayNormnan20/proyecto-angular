import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Coupon {
  id_cupon: number;
  codigo: string;
  descripcion?: string | null;
  tipo_descuento: 'porcentaje' | 'monto_fijo';
  valor: number;
  monto_minimo: number;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  max_usos?: number | null;
  usos_actuales: number;
  activo: boolean;
}

export interface CouponValidationResponse {
  coupon: Coupon;
  discount: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/coupons`;

  getAll(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(this.apiUrl);
  }

  create(payload: Partial<Coupon>): Observable<Coupon> {
    return this.http.post<Coupon>(this.apiUrl, payload);
  }

  update(id: number, payload: Partial<Coupon>): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  validate(codigo: string, subtotal: number): Observable<CouponValidationResponse> {
    return this.http.post<CouponValidationResponse>(`${this.apiUrl}/validate`, { codigo, subtotal });
  }
}
