import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface PaymentMethod {
  id_metodo_pago: number;
  nombre: string;
  descripcion: string;
  instrucciones: string;
  imagen_url?: string;
  activo: boolean;
  requiere_comprobante: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payment-methods`;

  getAll(includeInactive = false): Observable<PaymentMethod[]> {
    let params = new HttpParams();
    if (includeInactive) {
      params = params.set('includeInactive', 'true');
    }
    return this.http.get<PaymentMethod[]>(this.apiUrl, { params });
  }

  update(id: number, data: Partial<PaymentMethod>): Observable<PaymentMethod> {
    return this.http.put<PaymentMethod>(`${this.apiUrl}/${id}`, data);
  }

  create(data: Partial<PaymentMethod>): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(this.apiUrl, data);
  }

  uploadImage(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${this.apiUrl}/${id}/image`, formData);
  }
}
