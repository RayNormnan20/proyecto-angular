import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccessLogItem, AccessLogService } from '../../../../core/services/access-log.service';

@Component({
  selector: 'app-access-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800">Logs de Acceso</h2>
          <p class="text-sm text-gray-600 mt-1">Monitorea inicios de sesión, fallos y cambios sensibles de autenticación.</p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select [(ngModel)]="selectedAction" (change)="loadLogs(1)" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700">
            <option value="">Todas las acciones</option>
            <option *ngFor="let action of actions" [value]="action">{{ action }}</option>
          </select>
          <button (click)="loadLogs(currentPage)" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            Actualizar
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Fecha</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Acción</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Usuario</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">IP</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Detalle</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of logs" class="border-t border-gray-100 align-top">
                <td class="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{{ log.created_at | date:'short' }}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                    [ngClass]="{
                      'bg-green-100 text-green-800': log.accion === 'LOGIN' || log.accion === 'PASSWORD_RESET_SUCCESS',
                      'bg-red-100 text-red-800': log.accion === 'FAILED_LOGIN' || log.accion === 'PASSWORD_RESET_FAILED',
                      'bg-yellow-100 text-yellow-800': log.accion === 'PASSWORD_RESET_REQUEST',
                      'bg-gray-100 text-gray-800': log.accion === 'LOGOUT'
                    }">
                    {{ log.accion }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">
                  <div *ngIf="log.user; else unknownUser">
                    <div class="font-medium">{{ getUserName(log) }}</div>
                    <div class="text-xs text-gray-500">{{ log.user.email }}</div>
                  </div>
                  <ng-template #unknownUser>
                    <span class="text-gray-500">No identificado</span>
                  </ng-template>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{{ log.ip_address || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 min-w-[280px]">{{ log.detalles || '-' }}</td>
              </tr>
              <tr *ngIf="!isLoading && logs.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-500">No hay registros para mostrar.</td>
              </tr>
              <tr *ngIf="isLoading">
                <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-500">Cargando logs...</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 border-t border-gray-100 bg-white">
          <span class="text-sm text-gray-600">Página {{ currentPage }} de {{ totalPages }}</span>
          <div class="flex gap-2">
            <button (click)="previousPage()" [disabled]="currentPage <= 1" class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:opacity-50">
              Anterior
            </button>
            <button (click)="nextPage()" [disabled]="currentPage >= totalPages" class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:opacity-50">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AccessLogsComponent {
  private accessLogService = inject(AccessLogService);

  logs: AccessLogItem[] = [];
  selectedAction = '';
  currentPage = 1;
  totalPages = 1;
  isLoading = false;
  actions = [
    'LOGIN',
    'FAILED_LOGIN',
    'LOGOUT',
    'PASSWORD_RESET_REQUEST',
    'PASSWORD_RESET_SUCCESS',
    'PASSWORD_RESET_FAILED'
  ];

  constructor() {
    this.loadLogs();
  }

  loadLogs(page = 1) {
    this.isLoading = true;

    this.accessLogService.getLogs(page, 20, this.selectedAction).subscribe({
      next: (response) => {
        this.logs = response.logs || [];
        this.currentPage = response.currentPage || 1;
        this.totalPages = response.totalPages || 1;
        this.isLoading = false;
      },
      error: () => {
        this.logs = [];
        this.isLoading = false;
      }
    });
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.loadLogs(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.loadLogs(this.currentPage + 1);
    }
  }

  getUserName(log: AccessLogItem): string {
    const nombre = log.user?.nombre || '';
    const apellidos = log.user?.apellidos || '';
    return `${nombre} ${apellidos}`.trim();
  }
}
