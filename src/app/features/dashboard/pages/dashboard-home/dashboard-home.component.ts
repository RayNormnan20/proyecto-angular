import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Card 1 -->
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-700">Usuarios Activos</h3>
          <span class="text-blue-500 bg-blue-100 p-2 rounded-full">👤</span>
        </div>
        <p class="text-3xl font-bold text-gray-900">1,245</p>
        <p class="text-sm text-green-500 mt-2">↑ 12% vs mes anterior</p>
      </div>

      <!-- Card 2 -->
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-700">Ingresos Totales</h3>
          <span class="text-green-500 bg-green-100 p-2 rounded-full">💰</span>
        </div>
        <p class="text-3xl font-bold text-gray-900">$45,230</p>
        <p class="text-sm text-green-500 mt-2">↑ 5% vs mes anterior</p>
      </div>

      <!-- Card 3 -->
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-700">Tickets Pendientes</h3>
          <span class="text-yellow-500 bg-yellow-100 p-2 rounded-full">🎫</span>
        </div>
        <p class="text-3xl font-bold text-gray-900">23</p>
        <p class="text-sm text-red-500 mt-2">↓ 2% vs mes anterior</p>
      </div>
    </div>

    <div class="mt-8 bg-white rounded-lg shadow-md p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">Actividad Reciente</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full leading-normal">
          <thead>
            <tr>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Usuario
              </th>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Rol
              </th>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Fecha
              </th>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <div class="flex items-center">
                  <div class="ml-3">
                    <p class="text-gray-900 whitespace-no-wrap">Juan Pérez</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap">Admin</p>
              </td>
              <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap">Hace 2 horas</p>
              </td>
              <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <span class="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                  <span aria-hidden class="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                  <span class="relative">Activo</span>
                </span>
              </td>
            </tr>
            <!-- Más filas -->
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class DashboardHomeComponent {}
