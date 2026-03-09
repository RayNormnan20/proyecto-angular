import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Testimonial {
  id: number;
  mensaje?: string;
  imagen_url: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/testimonials`;

  getAll(activeOnly = false): Observable<Testimonial[]> {
    let params = new HttpParams();
    if (activeOnly) {
      params = params.set('activeOnly', 'true');
    }
    return this.http.get<Testimonial[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Testimonial> {
    return this.http.get<Testimonial>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Testimonial>, file: File): Observable<Testimonial> {
    const formData = new FormData();
    if (data.mensaje) formData.append('mensaje', data.mensaje);
    formData.append('activo', String(data.activo ?? true));
    formData.append('image', file);
    
    return this.http.post<Testimonial>(this.apiUrl, formData);
  }

  update(id: number, data: Partial<Testimonial>, file?: File): Observable<Testimonial> {
    const formData = new FormData();
    if (data.mensaje !== undefined) formData.append('mensaje', data.mensaje);
    if (data.activo !== undefined) formData.append('activo', String(data.activo));
    if (file) formData.append('image', file);
    
    return this.http.put<Testimonial>(`${this.apiUrl}/${id}`, formData);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
