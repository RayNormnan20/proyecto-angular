import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { Product } from '../../products/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/favorites`;
  
  favoritesCount = signal<number>(0);

  constructor() {}

  getFavorites(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      tap(favorites => this.favoritesCount.set(favorites.length))
    );
  }

  addFavorite(productId: number): Observable<any> {
    return this.http.post(this.apiUrl, { producto_id: productId }).pipe(
      tap(() => this.favoritesCount.update(c => c + 1))
    );
  }

  removeFavorite(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${productId}`).pipe(
      tap(() => this.favoritesCount.update(c => Math.max(0, c - 1)))
    );
  }

  checkFavorite(productId: number): Observable<{ isFavorite: boolean }> {
    return this.http.get<{ isFavorite: boolean }>(`${this.apiUrl}/${productId}/check`);
  }
  
  loadFavoritesCount() {
    this.getFavorites().subscribe({
      error: () => this.favoritesCount.set(0)
    });
  }
}
