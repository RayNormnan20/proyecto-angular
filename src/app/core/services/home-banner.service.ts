import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export type HomeBannerPlacement = 'carousel' | 'offer_small' | 'offer_large' | 'vendor';

export interface HomeBanner {
  id: number;
  placement: string;
  title?: string | null;
  description?: string | null;
  button_text?: string | null;
  button_link?: string | null;
  image_url: string;
  activo: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HomeBannerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/home-banners`;

  getAll(options?: { activeOnly?: boolean; placement?: HomeBannerPlacement | string }): Observable<HomeBanner[]> {
    let params = new HttpParams();
    if (options?.activeOnly) params = params.set('activeOnly', 'true');
    if (options?.placement) params = params.set('placement', options.placement);
    return this.http.get<HomeBanner[]>(this.apiUrl, { params });
  }

  create(data: Partial<HomeBanner>, file: File): Observable<HomeBanner> {
    const formData = new FormData();
    if (data.placement) formData.append('placement', String(data.placement));
    if (data.title !== undefined) formData.append('title', String(data.title ?? ''));
    if (data.description !== undefined) formData.append('description', String(data.description ?? ''));
    if (data.button_text !== undefined) formData.append('button_text', String(data.button_text ?? ''));
    if (data.button_link !== undefined) formData.append('button_link', String(data.button_link ?? ''));
    formData.append('activo', String(data.activo ?? true));
    formData.append('sort_order', String(data.sort_order ?? 0));
    formData.append('image', file);

    return this.http.post<HomeBanner>(this.apiUrl, formData);
  }

  update(id: number, data: Partial<HomeBanner>, file?: File): Observable<HomeBanner> {
    const formData = new FormData();
    if (data.placement !== undefined) formData.append('placement', String(data.placement ?? ''));
    if (data.title !== undefined) formData.append('title', String(data.title ?? ''));
    if (data.description !== undefined) formData.append('description', String(data.description ?? ''));
    if (data.button_text !== undefined) formData.append('button_text', String(data.button_text ?? ''));
    if (data.button_link !== undefined) formData.append('button_link', String(data.button_link ?? ''));
    if (data.activo !== undefined) formData.append('activo', String(data.activo));
    if (data.sort_order !== undefined) formData.append('sort_order', String(data.sort_order));
    if (file) formData.append('image', file);

    return this.http.put<HomeBanner>(`${this.apiUrl}/${id}`, formData);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
