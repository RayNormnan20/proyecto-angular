import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsService } from '../../../../core/services/settings.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-shipping-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './shipping-settings.component.html'
})
export class ShippingSettingsComponent {
  private settingsService = inject(SettingsService);
  public authService = inject(AuthService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  
  isSaving = signal(false);
  
  // Shipping Costs
  shippingCosts = signal<{district: string, cost: number}[]>([]);
  
  // Modal State
  isModalOpen = signal(false);
  currentEditIndex = signal<number | null>(null);
  shippingForm: FormGroup;

  constructor() {
    this.shippingForm = this.fb.group({
      district: ['', [Validators.required]],
      cost: [0, [Validators.required, Validators.min(0)]]
    });
    this.loadSettings();
  }

  loadSettings() {
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        if (settings['shipping_costs']) {
          try {
            const costs = JSON.parse(settings['shipping_costs']);
            if (Array.isArray(costs)) {
              this.shippingCosts.set(costs);
            }
          } catch (e) {
            console.error('Error parsing shipping costs', e);
          }
        }
      },
      error: (err) => console.error('Error loading settings', err)
    });
  }

  openModal(cost?: {district: string, cost: number}, index?: number) {
    if (cost && index !== undefined) {
      this.currentEditIndex.set(index);
      this.shippingForm.patchValue({
        district: cost.district,
        cost: cost.cost
      });
    } else {
      this.currentEditIndex.set(null);
      this.shippingForm.reset({ cost: 0 });
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.shippingForm.reset();
    this.currentEditIndex.set(null);
  }

  saveCost() {
    if (this.shippingForm.invalid) return;

    const { district, cost } = this.shippingForm.value;
    const newCost = { district, cost: Number(cost) };
    const isEditing = this.currentEditIndex() !== null;

    this.shippingCosts.update(costs => {
      const updatedCosts = [...costs];
      if (isEditing) {
        // Edit existing
        updatedCosts[this.currentEditIndex()!] = newCost;
      } else {
        // Add new
        updatedCosts.push(newCost);
      }
      return updatedCosts;
    });

    this.saveSettings(isEditing ? 'Costo actualizado correctamente' : 'Costo agregado correctamente');
    this.closeModal();
  }

  deleteCost(index: number) {
    if (confirm('¿Estás seguro de eliminar este costo de envío?')) {
      this.shippingCosts.update(costs => costs.filter((_, i) => i !== index));
      this.saveSettings('Costo eliminado correctamente');
    }
  }

  saveSettings(successMessage: string = 'Configuración actualizada') {
    this.isSaving.set(true);
    
    const dataToUpdate = {
      shipping_costs: JSON.stringify(this.shippingCosts())
    };

    this.settingsService.updateSettings(dataToUpdate).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toastService.show(successMessage, 'success');
      },
      error: (err) => {
        console.error('Error saving settings', err);
        this.toastService.show('Error al guardar configuración', 'error');
        this.isSaving.set(false);
      }
    });
  }

  // Permission helpers
  canEdit() {
    return this.authService.hasPermission('EDITAR_ENVIO') || this.authService.hasRole('admin');
  }

  canDelete() {
    return this.authService.hasPermission('ELIMINAR_ENVIO') || this.authService.hasRole('admin');
  }

  canCreate() {
    return this.authService.hasPermission('CREAR_ENVIO') || this.authService.hasRole('admin');
  }
}
