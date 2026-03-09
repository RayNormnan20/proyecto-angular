import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoriteService } from '../../../favorites/services/favorite.service';
import { Product } from '../../../products/models/product.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Mis Favoritos</h1>

      <div *ngIf="loading()" class="text-center py-12">
        <p class="text-gray-500">Cargando favoritos...</p>
      </div>

      <div *ngIf="!loading() && favorites().length === 0" class="text-center py-12 bg-white rounded-lg shadow">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <p class="text-xl text-gray-600 mb-4">No tienes productos en favoritos</p>
        <a routerLink="/" class="text-indigo-600 hover:text-indigo-800 font-medium">
          Explorar productos
        </a>
      </div>

      <div *ngIf="!loading() && favorites().length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div *ngFor="let product of favorites()" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <!-- Product Image -->
          <div class="relative h-48 bg-gray-200">
            <img 
              [src]="getProductImage(product)" 
              class="w-full h-full object-cover" 
              alt="{{ product.nombre }}"
            >
            <button 
              (click)="removeFavorite(product.id_producto!)"
              class="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 hover:bg-white shadow-sm transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Eliminar de favoritos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Product Info -->
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-1 truncate">
              <a [routerLink]="['/product', product.id_producto]" class="hover:text-indigo-600">
                {{ product.nombre }}
              </a>
            </h3>
            <p class="text-sm text-gray-500 mb-2">{{ product.brand?.nombre }}</p>
            
            <div class="flex justify-between items-center mt-4">
              <span class="text-xl font-bold text-gray-900">S/. {{ product.precio }}</span>
              <a 
                [routerLink]="['/product', product.id_producto]" 
                class="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
              >
                Ver Detalle
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FavoritesComponent implements OnInit {
  private favoriteService = inject(FavoriteService);
  
  favorites = signal<Product[]>([]);
  loading = signal<boolean>(true);
  imageBaseUrl = environment.imageBaseUrl;

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.loading.set(true);
    this.favoriteService.getFavorites().subscribe({
      next: (data) => {
        this.favorites.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading favorites', err);
        this.loading.set(false);
      }
    });
  }

  removeFavorite(productId: number) {
    this.favoriteService.removeFavorite(productId).subscribe({
      next: () => {
        this.favorites.update(current => current.filter(p => p.id_producto !== productId));
      },
      error: (err) => console.error('Error removing favorite', err)
    });
  }

  getProductImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      const mainImage = product.images.find(img => img.es_principal);
      const image = mainImage || product.images[0];
      return `${this.imageBaseUrl}${image.url}`;
    }
    return 'assets/images/no-image.png';
  }
}
