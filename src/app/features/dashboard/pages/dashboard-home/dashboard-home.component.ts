import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

type DashboardStats = {
  users: { active: number; total: number };
  products: { total: number };
  orders: { total: number; pending: number };
  revenue: { total: number };
  recentOrders: Array<{
    id_orden: number;
    fecha: string;
    estado: string;
    total: number;
    user: null | { id_usuario: number; nombre: string; apellidos: string; email: string };
  }>;
  recentUsers: Array<{
    id_usuario: number;
    nombre: string;
    apellidos: string;
    email: string;
    estado: string;
    created_at: string;
    role: null | { id_rol: number; nombre: string };
  }>;
};

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p class="text-sm text-gray-500">Resumen del sistema</p>
        </div>
        <button (click)="loadStats()" [disabled]="isLoading()" class="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {{ isLoading() ? 'Actualizando...' : 'Actualizar' }}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div class="flex items-center justify-between">
            <div class="text-sm font-medium text-gray-600">Usuarios activos</div>
            <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">👤</div>
          </div>
          <div class="mt-3 text-3xl font-bold text-gray-900">{{ stats()?.users?.active ?? '—' }}</div>
          <div class="mt-1 text-xs text-gray-500">Total: {{ stats()?.users?.total ?? '—' }}</div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div class="flex items-center justify-between">
            <div class="text-sm font-medium text-gray-600">Ingresos (pagados)</div>
            <div class="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">💰</div>
          </div>
          <div class="mt-3 text-3xl font-bold text-gray-900">S/ {{ (stats()?.revenue?.total ?? 0) | number:'1.2-2' }}</div>
          <div class="mt-1 text-xs text-gray-500">Pedidos: {{ stats()?.orders?.total ?? '—' }}</div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div class="flex items-center justify-between">
            <div class="text-sm font-medium text-gray-600">Pedidos pendientes</div>
            <div class="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">🧾</div>
          </div>
          <div class="mt-3 text-3xl font-bold text-gray-900">{{ stats()?.orders?.pending ?? '—' }}</div>
          <div class="mt-1 text-xs text-gray-500">Estado: pendiente</div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div class="flex items-center justify-between">
            <div class="text-sm font-medium text-gray-600">Productos</div>
            <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">📦</div>
          </div>
          <div class="mt-3 text-3xl font-bold text-gray-900">{{ stats()?.products?.total ?? '—' }}</div>
          <div class="mt-1 text-xs text-gray-500">Total de productos</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div class="text-lg font-semibold text-gray-900">Pedidos recientes</div>
          <div class="text-xs text-gray-500" *ngIf="stats()">Últimos {{ stats()?.recentOrders?.length || 0 }}</div>
        </div>

        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let order of stats()?.recentOrders || []" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{{ order.id_orden }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ order.user?.nombre }} {{ order.user?.apellidos }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ order.fecha | date:'medium' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">S/ {{ order.total | number:'1.2-2' }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                    {{ order.estado }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="(stats()?.recentOrders?.length || 0) === 0 && !isLoading()">
                <td colspan="5" class="px-6 py-10 text-center text-gray-500">No hay pedidos recientes.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="md:hidden p-4 space-y-3">
          <div *ngFor="let order of stats()?.recentOrders || []" class="border border-gray-100 rounded-lg p-4">
            <div class="flex items-start justify-between gap-2">
              <div class="text-sm font-semibold text-gray-900">Pedido #{{ order.id_orden }}</div>
              <span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">{{ order.estado }}</span>
            </div>
            <div class="mt-2 text-sm text-gray-700">{{ order.user?.nombre }} {{ order.user?.apellidos }}</div>
            <div class="mt-1 text-xs text-gray-500">{{ order.fecha | date:'medium' }}</div>
            <div class="mt-2 text-sm font-bold text-gray-900">S/ {{ order.total | number:'1.2-2' }}</div>
          </div>
          <div *ngIf="(stats()?.recentOrders?.length || 0) === 0 && !isLoading()" class="text-center text-gray-500 py-6">
            No hay pedidos recientes.
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardHomeComponent implements OnInit {
  private http = inject(HttpClient);

  stats = signal<DashboardStats | null>(null);
  isLoading = signal(false);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading.set(true);
    this.http.get<DashboardStats>(`${environment.apiUrl}/stats`).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
