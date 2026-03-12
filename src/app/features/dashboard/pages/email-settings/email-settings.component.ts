import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailLogService, EmailLog } from '../../../../core/services/email-log.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-email-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 md:p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Historial de Correos</h1>
      </div>

      <!-- Logs Section -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-gray-200 bg-gray-50 gap-4">
          <div class="flex items-center gap-4">
            <h3 class="text-lg font-medium text-gray-900">Envíos Recientes</h3>
            <button (click)="loadLogs()" 
                    [disabled]="isLoadingLogs()"
                    class="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center shadow-sm transition-colors">
              <span [class.animate-spin]="isLoadingLogs()" class="mr-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </span> 
              {{ isLoadingLogs() ? 'Actualizando...' : 'Actualizar' }}
            </button>
          </div>

          <!-- Filters -->
          <div class="flex flex-col md:flex-row gap-3">
            <input 
              type="text" 
              [ngModel]="searchTerm()" 
              (ngModelChange)="searchTerm.set($event)"
              placeholder="Buscar por asunto o destinatario..." 
              class="block w-full md:w-64 pl-3 pr-3 py-1.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out">
              
            <select 
              [ngModel]="filterStatus()" 
              (ngModelChange)="filterStatus.set($event)"
              class="block w-full md:w-40 pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option value="all">Todos los estados</option>
              <option value="enviado">Enviados</option>
              <option value="fallido">Fallidos</option>
            </select>
          </div>
        </div>
        
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinatario</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asunto</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let log of filteredLogs()" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ log.fecha_envio | date:'medium' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {{ log.tipo || 'General' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ log.destinatario }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" [title]="log.asunto">
                  {{ log.asunto }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [ngClass]="{
                    'bg-green-100 text-green-800': log.estado === 'enviado',
                    'bg-red-100 text-red-800': log.estado === 'fallido'
                  }" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize">
                    {{ log.estado }}
                  </span>
                  <div *ngIf="log.estado === 'fallido'" class="text-xs text-red-500 mt-1 max-w-[200px] truncate" [title]="log.error_mensaje">
                    {{ log.error_mensaje }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button (click)="resendEmail(log)" 
                          [disabled]="isResending() === log.id || !canResend(log)"
                          [title]="canResend(log) ? 'Reenviar este correo' : 'No se puede reenviar este tipo de correo'"
                          class="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400">
                    <span *ngIf="isResending() === log.id" class="inline-block animate-spin">
                      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                    <svg *ngIf="isResending() !== log.id" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </button>
                </td>
              </tr>
              <tr *ngIf="filteredLogs().length === 0 && !isLoadingLogs()">
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                  <div class="flex flex-col items-center justify-center">
                    <svg class="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p class="text-lg font-medium text-gray-900">No hay registros</p>
                    <p class="text-sm text-gray-500">No se encontraron correos con los filtros actuales.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="md:hidden p-4 space-y-4">
          <div *ngFor="let log of filteredLogs()" class="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
            <div class="p-4 space-y-2">
              <div class="flex items-start justify-between gap-2">
                <div class="text-sm text-gray-500">{{ log.fecha_envio | date:'medium' }}</div>
                <span [ngClass]="{
                  'bg-green-100 text-green-800': log.estado === 'enviado',
                  'bg-red-100 text-red-800': log.estado === 'fallido'
                }" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize">
                  {{ log.estado }}
                </span>
              </div>

              <div class="flex items-center gap-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                  {{ log.tipo || 'General' }}
                </span>
                <div class="text-sm font-medium text-gray-900 truncate">{{ log.destinatario }}</div>
              </div>

              <div class="text-sm text-gray-700 font-medium line-clamp-2">{{ log.asunto }}</div>
              <div *ngIf="log.estado === 'fallido' && log.error_mensaje" class="text-xs text-red-600 line-clamp-2">{{ log.error_mensaje }}</div>
            </div>
            <div class="px-4 pb-4 flex justify-end">
              <button (click)="resendEmail(log)" 
                      [disabled]="isResending() === log.id || !canResend(log)"
                      [title]="canResend(log) ? 'Reenviar este correo' : 'No se puede reenviar este tipo de correo'"
                      class="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 text-sm">
                {{ isResending() === log.id ? 'Reenviando...' : 'Reenviar' }}
              </button>
            </div>
          </div>

          <div *ngIf="filteredLogs().length === 0 && !isLoadingLogs()" class="bg-white border border-gray-100 rounded-lg shadow-sm p-6 text-center text-gray-500">
            No hay registros con los filtros actuales.
          </div>
        </div>
      </div>
    </div>
  `
})
export class EmailSettingsComponent {
  private emailLogService = inject(EmailLogService);
  private toastService = inject(ToastService);

  isLoadingLogs = signal(false);
  isResending = signal<number | null>(null);
  
  // Filter signals
  searchTerm = signal('');
  filterStatus = signal('all');
  logs = signal<EmailLog[]>([]);

  // Computed signal for filtered logs
  filteredLogs = computed(() => {
    const allLogs = this.logs();
    const term = this.searchTerm().toLowerCase();
    const status = this.filterStatus();

    return allLogs.filter(log => {
      const matchesTerm = !term || 
        (log.asunto?.toLowerCase().includes(term) || 
         log.destinatario?.toLowerCase().includes(term));
      
      const matchesStatus = status === 'all' || log.estado === status;
      
      return matchesTerm && matchesStatus;
    });
  });

  constructor() {
    this.loadLogs();
  }

  loadLogs() {
    this.isLoadingLogs.set(true);
    this.emailLogService.getLogs().subscribe({
      next: (data) => {
        this.logs.set(data);
        this.isLoadingLogs.set(false);
      },
      error: (err) => {
        console.error('Error loading logs', err);
        this.isLoadingLogs.set(false);
      }
    });
  }

  canResend(log: EmailLog): boolean {
    // Cannot resend test emails as they don't have stored context/data to regenerate
    if (log.tipo === 'test') return false;
    
    // For order emails, we need the reference ID to regenerate the email
    if (log.tipo === 'orden' && !log.referencia_id) return false;
    
    return true;
  }

  resendEmail(log: EmailLog) {
    if (!log.id) return;
    
    if (!confirm('¿Estás seguro de que deseas reenviar este correo?')) {
      return;
    }

    this.isResending.set(log.id);
    
    this.emailLogService.resendEmail(log.id).subscribe({
      next: (res) => {
        this.toastService.show('Correo reenviado correctamente', 'success');
        this.isResending.set(null);
        this.loadLogs(); // Refresh logs to show the new entry (if any) or update status
      },
      error: (err) => {
        console.error('Error resending email', err);
        this.toastService.show(err.error?.message || 'Error al reenviar el correo', 'error');
        this.isResending.set(null);
      }
    });
  }
}
