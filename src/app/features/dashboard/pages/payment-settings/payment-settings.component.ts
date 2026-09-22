import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentMethodService, PaymentMethod } from '../../../../core/services/payment-method.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';
import { SettingsService } from '../../../../core/services/settings.service';
import { BrandingService } from '../../../../core/services/branding.service';

@Component({
  selector: 'app-payment-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-settings.component.html'
})
export class PaymentSettingsComponent {
  private paymentMethodService = inject(PaymentMethodService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private settingsService = inject(SettingsService);
  brandingService = inject(BrandingService);
  
  paymentMethods = signal<PaymentMethod[]>([]);
  isProcessing = signal<number | null>(null); // Stores ID of method being processed
  appName = signal('');
  isSavingAppName = signal(false);
  showCreateModal = false;
  isCreating = false;

  newMethod: Partial<PaymentMethod> = {
    nombre: '',
    descripcion: '',
    instrucciones: '',
    activo: true,
    requiere_comprobante: true
  };

  constructor() {
    this.loadAppName();
    this.loadPaymentMethods();
  }

  loadAppName() {
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        const currentName = String(settings?.['app_name'] || this.brandingService.appName()).trim();
        this.appName.set(currentName);
        this.brandingService.applyAppName(currentName);
      },
      error: (err) => {
        console.error('Error loading app name', err);
        this.appName.set(this.brandingService.appName());
      }
    });
  }

  loadPaymentMethods() {
    this.paymentMethodService.getAll(true).subscribe({
      next: (methods) => {
        // Sort by id or name
        this.paymentMethods.set(methods.sort((a, b) => a.id_metodo_pago - b.id_metodo_pago));
      },
      error: (err) => console.error('Error loading payment methods', err)
    });
  }

  canCreate(): boolean {
    return this.authService.hasPermission('GESTIONAR_METODOS_PAGO') || this.authService.hasRole('admin');
  }

  canManageBranding(): boolean {
    return this.authService.hasPermission('GESTIONAR_CONFIGURACION') || this.authService.hasRole('admin');
  }

  saveAppName() {
    const nextName = this.appName().trim();

    if (!nextName) {
      this.toastService.show('El nombre global es obligatorio', 'error');
      return;
    }

    this.isSavingAppName.set(true);

    this.settingsService.updateSettings({ app_name: nextName }).subscribe({
      next: () => {
        this.brandingService.applyAppName(nextName);
        this.brandingService.refresh();
        this.toastService.show('Nombre global actualizado correctamente', 'success');
        this.isSavingAppName.set(false);
      },
      error: (err) => {
        console.error('Error saving app name', err);
        this.toastService.show(err?.error?.message || 'No se pudo actualizar el nombre global', 'error');
        this.isSavingAppName.set(false);
      }
    });
  }

  openCreateModal() {
    this.newMethod = {
      nombre: '',
      descripcion: '',
      instrucciones: '',
      activo: true,
      requiere_comprobante: true
    };
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.isCreating = false;
  }

  createMethod() {
    const data = this.newMethod;
    if (!data.nombre || !String(data.nombre).trim()) {
      this.toastService.show('El nombre es obligatorio', 'error');
      return;
    }

    this.isCreating = true;
    this.paymentMethodService.create({
      nombre: String(data.nombre).trim(),
      descripcion: String(data.descripcion || '').trim(),
      instrucciones: String(data.instrucciones || '').trim(),
      activo: data.activo !== false,
      requiere_comprobante: data.requiere_comprobante !== false
    }).subscribe({
      next: (created) => {
        this.paymentMethods.update(list => [...list, created].sort((a, b) => a.id_metodo_pago - b.id_metodo_pago));
        this.toastService.show('Método creado correctamente', 'success');
        this.closeCreateModal();
      },
      error: (err) => {
        console.error('Error creating method', err);
        this.toastService.show(err.error?.message || 'Error al crear método de pago', 'error');
        this.isCreating = false;
      }
    });
  }

  getImageUrl(path: string | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = environment.imageBaseUrl;
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
  }

  toggleActive(method: PaymentMethod) {
    this.updateMethod(method.id_metodo_pago, { activo: !method.activo });
  }

  toggleRequireProof(method: PaymentMethod) {
    this.updateMethod(method.id_metodo_pago, { requiere_comprobante: !method.requiere_comprobante });
  }

  saveInstructions(method: PaymentMethod) {
    this.updateMethod(method.id_metodo_pago, { 
      instrucciones: method.instrucciones,
      descripcion: method.descripcion // Also save description if edited
    });
  }

  updateMethod(id: number, data: Partial<PaymentMethod>) {
    this.isProcessing.set(id);
    this.paymentMethodService.update(id, data).subscribe({
      next: (updatedMethod) => {
        this.paymentMethods.update(methods => 
          methods.map(m => m.id_metodo_pago === id ? { ...m, ...updatedMethod } : m)
        );
        this.toastService.show('Actualizado correctamente', 'success');
        this.isProcessing.set(null);
      },
      error: (err) => {
        console.error('Error updating method', err);
        this.toastService.show('Error al actualizar', 'error');
        this.isProcessing.set(null);
      }
    });
  }

  onFileSelected(event: Event, method: PaymentMethod) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.uploadImage(method.id_metodo_pago, file);
    }
  }

  uploadImage(id: number, file: File) {
    this.isProcessing.set(id);
    this.paymentMethodService.uploadImage(id, file).subscribe({
      next: (res) => {
        this.paymentMethods.update(methods => 
          methods.map(m => m.id_metodo_pago === id ? { ...m, imagen_url: res.url } : m)
        );
        this.toastService.show('Imagen actualizada', 'success');
        this.isProcessing.set(null);
      },
      error: (err) => {
        console.error('Error uploading image', err);
        this.toastService.show('Error al subir imagen', 'error');
        this.isProcessing.set(null);
      }
    });
  }

  // Helpers for UI logic
  isYape(method: PaymentMethod): boolean {
    return method.nombre.toLowerCase().includes('yape') || method.nombre.toLowerCase().includes('plin');
  }

  isTransfer(method: PaymentMethod): boolean {
    return method.nombre.toLowerCase().includes('transferencia');
  }

  isCash(method: PaymentMethod): boolean {
    return method.nombre.toLowerCase().includes('contra entrega') || method.nombre.toLowerCase().includes('efectivo');
  }
}
