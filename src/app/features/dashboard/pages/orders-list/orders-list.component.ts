import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../../../core/services/order.service';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 md:p-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 class="text-2xl font-bold text-gray-800">Gestión de Pedidos</h1>
        <div class="flex gap-2 w-full md:w-auto">
           <button (click)="loadOrders()" class="flex-1 md:flex-none px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-center justify-center flex items-center">
             <span class="mr-2">🔄</span> Actualizar
           </button>
        </div>
      </div>

      <!-- Desktop View (Table) -->
      <div class="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método Pago</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <ng-container *ngFor="let order of orders()">
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{{ order.id_orden }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="text-sm font-medium text-gray-900">{{ order.user?.nombre }}</div>
                    <div class="text-sm text-gray-500">{{ order.user?.email }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ order.fecha | date:'short' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                    S/ {{ order.total }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {{ order.paymentMethod?.nombre || 'Desconocido' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [ngClass]="{
                      'bg-yellow-100 text-yellow-800': order.estado === 'pendiente',
                      'bg-green-100 text-green-800': order.estado === 'pagado' || order.estado === 'entregado',
                      'bg-blue-100 text-blue-800': order.estado === 'enviado',
                      'bg-red-100 text-red-800': order.estado === 'cancelado'
                    }" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize">
                      {{ order.estado }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select 
                      (change)="updateStatus(order.id_orden, $event)"
                      [value]="order.estado"
                      class="mt-1 block w-full py-1 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs">
                      <option value="pendiente">Pendiente</option>
                      <option value="pagado">Pagado</option>
                      <option value="enviado">Enviado</option>
                      <option value="entregado">Entregado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                    
                    <button (click)="toggleDetails(order.id_orden)" class="mt-2 text-blue-600 hover:text-blue-800 text-xs block">
                      {{ isExpanded(order.id_orden) ? 'Ocultar Detalles' : 'Ver Detalles' }}
                    </button>
                  </td>
                </tr>
                <!-- Details Row -->
                <tr *ngIf="isExpanded(order.id_orden)" class="bg-gray-50">
                  <td colspan="7" class="px-6 py-4">
                    <div class="text-sm text-gray-700">
                      <h4 class="font-bold mb-2">Detalles del Pedido:</h4>
                      <ul class="list-disc pl-5 space-y-1">
                        <li *ngFor="let item of order.items">
                          <span class="font-medium">{{ item.product?.nombre || 'Producto Desconocido' }}</span> 
                          - Cantidad: {{ item.cantidad }} 
                          - Subtotal: S/ {{ item.subtotal }}
                        </li>
                      </ul>
                      <div class="mt-3" *ngIf="order.direccion_envio">
                       <p><span class="font-bold">Dirección de Envío:</span> {{ order.direccion_envio }}</p>
                    </div>
                    <div class="mt-1" *ngIf="order.codigo_operacion">
                       <p><span class="font-bold">Código de Operación:</span> <span class="bg-gray-100 px-2 py-1 rounded text-gray-800 font-mono">{{ order.codigo_operacion }}</span></p>
                    </div>
                    <div class="mt-1" *ngIf="order.notas">
                       <p><span class="font-bold">Notas:</span> {{ order.notas }}</p>
                    </div>
                    </div>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile View (Cards) -->
      <div class="md:hidden space-y-4">
        <div *ngFor="let order of orders()" class="bg-white p-4 rounded-lg shadow border border-gray-100">
          <!-- Header Card -->
          <div class="flex justify-between items-start mb-3">
            <div>
              <span class="font-bold text-lg text-gray-800">#{{ order.id_orden }}</span>
              <p class="text-xs text-gray-500">{{ order.fecha | date:'short' }}</p>
            </div>
            <span [ngClass]="{
              'bg-yellow-100 text-yellow-800': order.estado === 'pendiente',
              'bg-green-100 text-green-800': order.estado === 'pagado' || order.estado === 'entregado',
              'bg-blue-100 text-blue-800': order.estado === 'enviado',
              'bg-red-100 text-red-800': order.estado === 'cancelado'
            }" class="px-2 py-1 text-xs font-semibold rounded-full capitalize">
              {{ order.estado }}
            </span>
          </div>

          <!-- Info Grid -->
          <div class="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mb-4 border-b border-gray-100 pb-3">
            <div class="col-span-2">
              <span class="text-gray-500 text-xs uppercase">Cliente</span>
              <p class="font-medium truncate">{{ order.user?.nombre }}</p>
            </div>
            <div>
              <span class="text-gray-500 text-xs uppercase">Total</span>
              <p class="font-bold text-gray-900">S/ {{ order.total }}</p>
            </div>
            <div>
              <span class="text-gray-500 text-xs uppercase">Pago</span>
              <p class="capitalize">{{ order.paymentMethod?.nombre || 'Desconocido' }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-3">
            <div>
              <label class="text-xs font-semibold text-gray-500 mb-1 block">Cambiar Estado</label>
              <select 
                (change)="updateStatus(order.id_orden, $event)"
                [value]="order.estado"
                class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm">
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            
            <button 
              (click)="toggleDetails(order.id_orden)" 
              class="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              {{ isExpanded(order.id_orden) ? 'Ocultar Detalles' : 'Ver Detalles' }}
              <svg 
                class="ml-2 -mr-1 h-4 w-4 transform transition-transform duration-200" 
                [class.rotate-180]="isExpanded(order.id_orden)"
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Expanded Details (Mobile) -->
          <div *ngIf="isExpanded(order.id_orden)" class="mt-3 bg-gray-50 p-3 rounded-md text-sm animate-fade-in">
            <h4 class="font-bold mb-2 text-gray-700 border-b border-gray-200 pb-1">Productos</h4>
            <ul class="space-y-2 mb-3">
              <li *ngFor="let item of order.items" class="flex justify-between items-start text-xs">
                <span class="font-medium flex-1 mr-2">{{ item.product?.nombre || 'Producto Desconocido' }} (x{{ item.cantidad }})</span> 
                <span class="font-bold text-gray-600">S/ {{ item.subtotal }}</span>
              </li>
            </ul>
            
            <div *ngIf="order.direccion_envio" class="mb-2">
               <span class="font-bold text-xs text-gray-500 uppercase block">Dirección de Envío</span>
               <p>{{ order.direccion_envio }}</p>
            </div>
            
            <div *ngIf="order.codigo_operacion" class="mb-2">
               <span class="font-bold text-xs text-gray-500 uppercase block">Código de Operación</span>
               <span class="bg-white border px-2 py-1 rounded text-gray-800 font-mono text-xs block mt-1 w-fit">{{ order.codigo_operacion }}</span>
            </div>
            
            <div *ngIf="order.notas">
               <span class="font-bold text-xs text-gray-500 uppercase block">Notas</span>
               <p class="italic text-gray-600">{{ order.notas }}</p>
            </div>
          </div>
        </div>

        <div *ngIf="orders().length === 0" class="text-center py-8 text-gray-500 bg-white rounded-lg shadow">
          No hay pedidos registrados.
        </div>
      </div>
    </div>
  `
})
export class OrdersListComponent {
  orderService = inject(OrderService);
  orders = signal<Order[]>([]);
  expandedOrders = signal<Set<number>>(new Set());

  constructor() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => this.orders.set(data),
      error: (err) => console.error('Error loading orders', err)
    });
  }

  toggleDetails(orderId: number) {
    this.expandedOrders.update(set => {
      const newSet = new Set(set);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  }

  isExpanded(orderId: number): boolean {
    return this.expandedOrders().has(orderId);
  }

  updateStatus(orderId: number, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;

    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (updatedOrder) => {
        this.orders.update(orders => 
          orders.map(o => o.id_orden === orderId ? { ...o, estado: updatedOrder.estado as any } : o)
        );
      },
      error: (err) => {
        console.error('Error updating status', err);
        // Revert change if needed or show alert
        alert('Error al actualizar el estado');
        this.loadOrders(); // Reload to revert UI
      }
    });
  }
}
