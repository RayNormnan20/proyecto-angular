import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { OrderService, Order } from '../../../../core/services/order.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-gray-50 min-h-screen pb-12">
      <!-- Header / Banner -->
      <div class="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 w-full relative overflow-hidden">
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
                   <div class="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600 border-4 border-white">
                     {{ (currentUser()?.nombre || 'U').charAt(0).toUpperCase() }}
                   </div>
                </div>
                
                <h2 class="text-xl font-bold text-gray-800">{{ currentUser()?.nombre }}</h2>
                <p class="text-sm text-gray-500 mb-2">{{ currentUser()?.email }}</p>
                <span class="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                  {{ currentUser()?.role || 'Usuario' }}
                </span>
              </div>
              
              <div class="p-4">
                <nav class="space-y-1">
                  <a class="flex items-center px-4 py-2 text-gray-700 bg-gray-50 rounded-md font-medium border-l-4 border-blue-600 cursor-pointer">
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
            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
               <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
                  <div class="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                     </svg>
                  </div>
                  <div>
                     <div class="text-2xl font-bold text-gray-800">{{ activeOrdersCount() }}</div>
                     <div class="text-xs text-gray-500 uppercase font-medium">Pedidos Activos</div>
                  </div>
               </div>
               
               <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
                  <div class="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                     </svg>
                  </div>
                  <div>
                     <div class="text-2xl font-bold text-gray-800">0</div>
                     <div class="text-xs text-gray-500 uppercase font-medium">Favoritos</div>
                  </div>
               </div>

               <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
                  <div class="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                     </svg>
                  </div>
                  <div>
                     <div class="text-2xl font-bold text-gray-800">0</div>
                     <div class="text-xs text-gray-500 uppercase font-medium">Puntos</div>
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
                  <a routerLink="/products" class="text-blue-600 hover:underline">Ir a comprar</a>
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
                        'bg-blue-100 text-blue-800': order.estado === 'enviado',
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
  
  currentUser = this.authService.currentUser;
  today = new Date();
  orders = signal<Order[]>([]);
  
  activeOrdersCount = signal(0);

  constructor() {
    this.loadOrders();
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