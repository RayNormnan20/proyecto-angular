import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { FavoriteService } from '../../features/favorites/services/favorite.service';
import { environment } from '../../../environments/environment';
import { Product } from '../../features/products/models/product.model';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col">
      <!-- Navbar Público -->
      <nav class="bg-white shadow-sm sticky top-0 z-50">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <a routerLink="/" class="text-xl font-bold text-blue-600">Mi Tienda</a>
              <div class="hidden md:block ml-10 space-x-8">
                <a routerLink="/" class="text-gray-700 hover:text-blue-600">Inicio</a>
                <a routerLink="/products" class="text-gray-700 hover:text-blue-600">Catálogo</a>
              </div>
            </div>
            
            <div class="flex items-center space-x-6">
              <!-- Carrito de Compras -->
              <a routerLink="/cart" class="text-gray-700 hover:text-blue-600 relative p-2 flex items-center group" title="Ver Carrito y Pagar">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span *ngIf="cartService.cartCount() > 0" class="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
                  {{ cartService.cartCount() }}
                </span>
              </a>

              <!-- Favoritos -->
              <a *ngIf="authService.currentUser()" routerLink="/favorites" class="text-gray-700 hover:text-blue-600 relative p-2 flex items-center group" title="Mis Favoritos">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span *ngIf="favoriteService.favoritesCount() > 0" class="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
                  {{ favoriteService.favoritesCount() }}
                </span>
              </a>

              <ng-container *ngIf="authService.currentUser() as user; else loginButtons">
                <div class="flex items-center gap-3 relative group cursor-pointer">
                  <span class="text-gray-700 text-sm font-medium">Hola, {{ user.nombre }}</span>
                  
                    <button class="flex items-center gap-2 focus:outline-none">
                      <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200">
                        {{ user.nombre.charAt(0).toUpperCase() }}
                      </div>
                    </button>
                    <!-- Dropdown Menu -->
                    <div class="absolute right-0 top-full -mt-2 pt-4 w-48 hidden group-hover:block hover:block z-50">
                      <div class="bg-white rounded-md shadow-lg py-1 border border-gray-100">
                        
                        <a routerLink="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                          Mi Perfil
                        </a>

                        <a *ngIf="['admin', 'trabajador', 'supervisor'].includes(user.role || '')" 
                           routerLink="/dashboard" 
                           class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                           Ir al Dashboard
                        </a>
                        <button (click)="logout()" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  
                </div>
              </ng-container>
              
              <ng-template #loginButtons>
                <a routerLink="/auth/login" class="text-gray-700 hover:text-blue-600 font-medium">Iniciar Sesión</a>
                <a routerLink="/auth/register" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium text-sm">Registrarse</a>
              </ng-template>
            </div>
          </div>
        </div>
      </nav>

      <!-- Contenido Principal -->
      <main class="flex-grow bg-gray-50">
        <router-outlet></router-outlet>
      </main>

    </div>
  `
})
export class PublicLayoutComponent implements OnInit {
  authService = inject(AuthService);
  cartService = inject(CartService);
  favoriteService = inject(FavoriteService);

  ngOnInit() {
    if (this.authService.currentUser()) {
      this.favoriteService.loadFavoritesCount();
    }
  }

  logout() {
    this.authService.logout();
  }
}
