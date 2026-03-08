import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '../../../../core/services/settings.service';
import { EmailLogService, EmailLog } from '../../../../core/services/email-log.service';

@Component({
  selector: 'app-email-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="p-4 md:p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Gestión de Correos</h1>
        
        <!-- Toast Message -->
        <div *ngIf="message()" 
          [class.bg-green-100]="message()?.type === 'success'" 
          [class.text-green-800]="message()?.type === 'success'" 
          [class.bg-red-100]="message()?.type === 'error'" 
          [class.text-red-800]="message()?.type === 'error'" 
          class="px-4 py-2 rounded-md text-sm font-medium animate-fade-in shadow-sm">
          {{ message()?.text }}
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button (click)="activeTab.set('config')"
            [class.border-blue-500]="activeTab() === 'config'"
            [class.text-blue-600]="activeTab() === 'config'"
            [class.border-transparent]="activeTab() !== 'config'"
            [class.text-gray-500]="activeTab() !== 'config'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors hover:text-gray-700 hover:border-gray-300">
            Configuración SMTP
          </button>
          <button (click)="loadLogs(); activeTab.set('logs')"
            [class.border-blue-500]="activeTab() === 'logs'"
            [class.text-blue-600]="activeTab() === 'logs'"
            [class.border-transparent]="activeTab() !== 'logs'"
            [class.text-gray-500]="activeTab() !== 'logs'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors hover:text-gray-700 hover:border-gray-300">
            Historial de Envíos
          </button>
        </nav>
      </div>

      <!-- Configuration Tab -->
      <div *ngIf="activeTab() === 'config'" class="bg-white rounded-lg shadow border border-gray-100 p-6 max-w-2xl">
        <p class="text-gray-600 mb-6">
          Configura las credenciales SMTP para el envío de correos electrónicos transaccionales (confirmación de pedidos, etc.).
        </p>

        <form [formGroup]="emailForm" (ngSubmit)="saveSettings()" class="space-y-6">
          
          <!-- Host -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Servidor SMTP (Host)</label>
            <input type="text" formControlName="email_host" 
                   class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                   placeholder="smtp.gmail.com">
          </div>

          <!-- Port -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Puerto SMTP</label>
            <input type="number" formControlName="email_port" 
                   class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                   placeholder="587">
          </div>

          <!-- User -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Usuario / Correo</label>
            <input type="email" formControlName="email_user" 
                   class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                   placeholder="tu-email@gmail.com">
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña de Aplicación</label>
            <div class="relative">
              <input [type]="showPassword() ? 'text' : 'password'" formControlName="email_pass" 
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border pr-10"
                     placeholder="••••••••">
              <button type="button" (click)="togglePassword()" class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700">
                <svg *ngIf="!showPassword()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg *ngIf="showPassword()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">Para Gmail, usa una "Contraseña de Aplicación" si tienes 2FA activado.</p>
          </div>

          <!-- Actions -->
          <div class="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
             <button type="button" (click)="testEmail()" 
                    [disabled]="isTesting()"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm font-medium">
              <span *ngIf="isTesting()" class="inline-block animate-spin mr-1">⟳</span>
              Probar Conexión
            </button>
            
            <button type="submit" 
                    [disabled]="isProcessing() || emailForm.invalid"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium shadow-sm">
              <span *ngIf="isProcessing()" class="inline-block animate-spin mr-1">⟳</span>
              Guardar Configuración
            </button>
          </div>

        </form>
      </div>

      <!-- Logs Tab -->
      <div *ngIf="activeTab() === 'logs'" class="bg-white rounded-lg shadow overflow-hidden">
        <div class="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-gray-200 bg-gray-50 gap-4">
          <div class="flex items-center gap-4">
            <h3 class="text-lg font-medium text-gray-900">Historial de Envíos</h3>
            <button (click)="loadLogs()" 
                    [disabled]="isLoadingLogs()"
                    class="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center shadow-sm">
              <span [class.animate-spin]="isLoadingLogs()" class="mr-2 text-gray-400">⟳</span> 
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
              class="block w-full md:w-64 pl-3 pr-3 py-1.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out">
              
            <select 
              [ngModel]="filterStatus()" 
              (ngModelChange)="filterStatus.set($event)"
              class="block w-full md:w-40 pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option value="all">Todos los estados</option>
              <option value="enviado">Enviados</option>
              <option value="fallido">Fallidos</option>
            </select>
          </div>
        </div>
        
        <div class="overflow-x-auto">
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
                          class="text-blue-600 hover:text-blue-900 font-medium text-xs flex items-center px-3 py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <span *ngIf="isResending() === log.id" class="inline-block animate-spin mr-1">⟳</span>
                    {{ isResending() === log.id ? 'Enviando...' : 'Reenviar' }}
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
      </div>
    </div>
  `
})
export class EmailSettingsComponent {
  private settingsService = inject(SettingsService);
  private emailLogService = inject(EmailLogService);
  private fb = inject(FormBuilder);

  emailForm: FormGroup = this.fb.group({
    email_host: ['smtp.gmail.com', Validators.required],
    email_port: [587, Validators.required],
    email_user: ['', [Validators.required, Validators.email]],
    email_pass: ['', Validators.required]
  });

  isProcessing = signal(false);
  isTesting = signal(false);
  isLoadingLogs = signal(false);
  isResending = signal<number | null>(null); // Store the ID of the log being resent
  message = signal<{text: string, type: 'success' | 'error'} | null>(null);
  showPassword = signal(false);
  activeTab = signal<'config' | 'logs'>('config');
  
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
    this.loadSettings();
  }

  loadSettings() {
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        this.emailForm.patchValue({
          email_host: settings['email_host'] || 'smtp.gmail.com',
          email_port: settings['email_port'] || 587,
          email_user: settings['email_user'] || '',
          email_pass: settings['email_pass'] || ''
        });
      },
      error: (err) => console.error('Error loading settings', err)
    });
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


  saveSettings() {
    if (this.emailForm.invalid) return;

    this.isProcessing.set(true);
    this.settingsService.updateSettings(this.emailForm.value).subscribe({
      next: () => {
        this.showMessage('Configuración guardada correctamente', 'success');
        this.isProcessing.set(false);
      },
      error: (err) => {
        console.error('Error saving settings', err);
        this.showMessage('Error al guardar la configuración', 'error');
        this.isProcessing.set(false);
      }
    });
  }

  testEmail() {
    if (this.emailForm.invalid) {
      this.showMessage('Completa todos los campos para probar', 'error');
      return;
    }

    this.isTesting.set(true);
    this.settingsService.testEmailSettings(this.emailForm.value).subscribe({
      next: (res: any) => {
        this.showMessage(res.message, 'success');
        this.isTesting.set(false);
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Error al probar conexión', 'error');
        this.isTesting.set(false);
      }
    });
  }

  resendEmail(log: EmailLog) {
    if (!log.id) return;
    
    // Optional: Add confirmation dialog here if needed
    if (!confirm('¿Estás seguro de que deseas reenviar este correo?')) {
      return;
    }

    this.isResending.set(log.id);
    
    this.emailLogService.resendEmail(log.id).subscribe({
      next: (res) => {
        this.showMessage('Correo reenviado correctamente', 'success');
        this.isResending.set(null);
        this.loadLogs(); // Refresh logs to show the new entry (if any) or update status
      },
      error: (err) => {
        console.error('Error resending email', err);
        this.showMessage(err.error?.message || 'Error al reenviar el correo', 'error');
        this.isResending.set(null);
      }
    });
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  showMessage(text: string, type: 'success' | 'error') {
    this.message.set({ text, type });
    setTimeout(() => this.message.set(null), 3000);
  }
}
