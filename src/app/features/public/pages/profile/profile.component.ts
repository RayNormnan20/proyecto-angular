import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { OrderService, Order } from '../../../../core/services/order.service';
import { FavoriteService } from '../../../favorites/services/favorite.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-gray-50 min-h-screen pb-12">
      <!-- Header / Banner -->
      <div class="h-48 bg-gradient-to-r from-indigo-600 to-indigo-800 w-full relative overflow-hidden">
         <div class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <!-- Main Content -->
      <div class="container mx-auto px-4 -mt-20 relative z-10">
        <div class="flex flex-col md:flex-row gap-6">
          
          <!-- Sidebar: User Card -->
          <div class="w-full md:w-1/3 lg:w-1/4">
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
              <div class="p-6 text-center border-b border-gray-100">
                <div class="w-32 h-32 mx-auto bg-white p-1 rounded-full shadow-lg -mt-16 mb-4 relative">
                   <div class="w-full h-full rounded-full bg-indigo-100 flex items-center justify-center text-4xl font-bold text-indigo-600 border-4 border-white">
                     {{ (currentUser()?.nombre || 'U').charAt(0).toUpperCase() }}
                   </div>
                </div>
                
                <h2 class="text-xl font-bold text-gray-800">{{ currentUser()?.nombre }}</h2>
                <p class="text-sm text-gray-500 mb-2">{{ currentUser()?.email }}</p>
                <span class="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                  {{ currentUser()?.role || 'Usuario' }}
                </span>
              </div>
              
              <div class="p-4">
                <nav class="space-y-1">
                  <a class="flex items-center px-4 py-2 text-gray-700 bg-gray-50 rounded-md font-medium border-l-4 border-indigo-600 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Información Personal
                  </a>
                </nav>
              </div>
            </div>
          </div>

          <!-- Main Area: Details -->
          <div class="w-full md:w-2/3 lg:w-3/4">
          <!-- Stats Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center">
              <div class="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500 font-medium">Pedidos Totales</p>
                <p class="text-2xl font-bold text-gray-800">{{ stats().totalOrders }}</p>
              </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center">
              <div class="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500 font-medium">Favoritos</p>
                <p class="text-2xl font-bold text-gray-800">{{ stats().wishlistCount }}</p>
              </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center">
              <div class="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500 font-medium">Puntos Nova</p>
                <p class="text-2xl font-bold text-gray-800">{{ stats().points }}</p>
              </div>
            </div>
          </div>

            <!-- Profile Info -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
              <div class="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <h3 class="text-xl font-bold text-gray-800">Información de Perfil</h3>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label class="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Nombre Completo</label>
                  <div class="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2">{{ currentUser()?.nombre }}</div>
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Correo Electrónico</label>
                  <div class="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2">{{ currentUser()?.email }}</div>
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Rol de Usuario</label>
                  <div class="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2 capitalize">{{ currentUser()?.role }}</div>
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Fecha de Registro</label>
                  <div class="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2">
                    {{ (currentUser()?.createdAt || today) | date:'longDate' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Orders History -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">Historial de Pedidos</h3>
              
              <div *ngIf="orders().length === 0" class="text-center py-8 text-gray-500">
                No tienes pedidos registrados.
                <div class="mt-4">
                  <a routerLink="/products" class="text-indigo-600 hover:underline">Ir a comprar</a>
                </div>
              </div>

              <div *ngIf="orders().length > 0" class="space-y-6">
                <div *ngFor="let order of orders()" class="border border-gray-200 rounded-lg overflow-hidden">
                  <div class="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-200">
                    <div>
                      <span class="font-medium text-gray-900">Pedido #{{ order.id_orden }}</span>
                      <span class="text-gray-500 text-sm ml-2">{{ order.fecha | date:'short' }}</span>
                    </div>
                    <div>
                       <span [ngClass]="{
                        'bg-yellow-100 text-yellow-800': order.estado === 'pendiente',
                        'bg-green-100 text-green-800': order.estado === 'pagado' || order.estado === 'entregado',
                        'bg-indigo-100 text-indigo-800': order.estado === 'enviado',
                        'bg-red-100 text-red-800': order.estado === 'cancelado'
                      }" class="px-3 py-1 text-xs font-semibold rounded-full capitalize">
                        {{ order.estado }}
                      </span>
                    </div>
                  </div>
                  <div class="p-4">
                    <div class="flex justify-between items-center mb-2">
                      <div class="text-sm text-gray-600">
                        <span class="font-medium">Método de Pago:</span> <span class="capitalize">{{ order.paymentMethod?.nombre || 'Desconocido' }}</span>
                      </div>
                      <div class="text-lg font-bold text-gray-900">
                        Total: S/ {{ order.total }}
                      </div>
                    </div>
                    <!-- Order Items Preview -->
                    <div class="space-y-2 mt-3">
                      <div *ngFor="let item of order.items" class="flex justify-between text-sm">
                        <span class="text-gray-600">{{ item.cantidad }}x {{ item.product?.nombre || 'Producto' }}</span>
                        <span class="text-gray-900">S/ {{ item.subtotal }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private favoriteService = inject(FavoriteService);
  
  currentUser = this.authService.currentUser;
  today = new Date();
  orders = signal<Order[]>([]);
  
  activeOrdersCount = signal(0);

  stats = computed(() => ({
    totalOrders: this.orders().length,
    wishlistCount: this.favoriteService.favoritesCount(),
    points: Math.floor(this.orders().reduce((acc, order) => acc + Number(order.total || 0), 0) * 0.1) // 1 point per 10 currency units
  }));

  constructor() {
    this.loadOrders();
    this.favoriteService.loadFavoritesCount();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.activeOrdersCount.set(
          data.filter(o => ['pendiente', 'pagado', 'enviado'].includes(o.estado)).length
        );
      },
      error: (err) => console.error('Error loading orders', err)
    });
  }
}