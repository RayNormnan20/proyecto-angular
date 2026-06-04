import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProductReviewUser {
  id_usuario: number;
  nombre: string;
}

export interface ProductReview {
  id_resena: number;
  producto_id: number;
  usuario_id: number;
  orden_id?: number | null;
  puntuacion: number;
  comentario: string;
  visible?: boolean;
  created_at?: string;
  updated_at?: string;
  user?: ProductReviewUser | null;
  product?: {
    id_producto: number;
    nombre: string;
    codigo_sku?: string;
  } | null;
}

export interface ProductReviewSummary {
  average: number;
  total: number;
  distribution: Array<{
    estrellas: number;
    total: number;
  }>;
}

export interface ProductReviewsResponse {
  summary: ProductReviewSummary;
  reviews: ProductReview[];
}

export interface MyProductReviewStatus {
  canReview: boolean;
  hasPurchased: boolean;
  purchaseOrderId: number | null;
  review: ProductReview | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProductReviewService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/product-reviews`;

  getProductReviews(productId: number): Observable<ProductReviewsResponse> {
    return this.http.get<ProductReviewsResponse>(`${this.apiUrl}/product/${productId}`);
  }

  getMyReviewStatus(productId: number): Observable<MyProductReviewStatus> {
    return this.http.get<MyProductReviewStatus>(`${this.apiUrl}/product/${productId}/me`);
  }

  createReview(payload: {
    producto_id: number;
    puntuacion: number;
    comentario: string;
  }): Observable<ProductReview> {
    return this.http.post<ProductReview>(this.apiUrl, payload);
  }

  updateReview(id: number, payload: {
    puntuacion: number;
    comentario: string;
  }): Observable<ProductReview> {
    return this.http.put<ProductReview>(`${this.apiUrl}/${id}`, payload);
  }

  deleteReview(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  getAdminReviews(): Observable<ProductReview[]> {
    return this.http.get<ProductReview[]>(this.apiUrl);
  }

  updateVisibility(id: number, visible: boolean): Observable<ProductReview> {
    return this.http.patch<ProductReview>(`${this.apiUrl}/${id}/visibility`, { visible });
  }

  deleteAdminReview(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}/admin`);
  }
}
