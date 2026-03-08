import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentMethodService, PaymentMethod } from '../../../../core/services/payment-method.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-payment-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-settings.component.html'
})
export class PaymentSettingsComponent {
  private paymentMethodService = inject(PaymentMethodService);
  
  paymentMethods = signal<PaymentMethod[]>([]);
  isProcessing = signal<number | null>(null); // Stores ID of method being processed
  message = signal<{text: string, type: 'success' | 'error'} | null>(null);

  constructor() {
    this.loadPaymentMethods();
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
        this.showMessage('Actualizado correctamente', 'success');
        this.isProcessing.set(null);
      },
      error: (err) => {
        console.error('Error updating method', err);
        this.showMessage('Error al actualizar', 'error');
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
        this.showMessage('Imagen actualizada', 'success');
        this.isProcessing.set(null);
      },
      error: (err) => {
        console.error('Error uploading image', err);
        this.showMessage('Error al subir imagen', 'error');
        this.isProcessing.set(null);
      }
    });
  }

  showMessage(text: string, type: 'success' | 'error') {
    this.message.set({ text, type });
    setTimeout(() => this.message.set(null), 3000);
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
