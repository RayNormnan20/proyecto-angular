import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../../../core/services/settings.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-payment-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-settings.component.html'
})
export class PaymentSettingsComponent {
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  
  settingsForm = this.fb.group({
    yape_nombre: [''],
    yape_numero: [''],
    transfer_banco: [''],
    transfer_numero: [''],
    transfer_cci: [''],
    transfer_titular: ['']
  });

  qrUrl = signal<string | null>(null);
  isSaving = signal(false);
  message = signal('');
  
  constructor() {
    this.loadSettings();
  }

  loadSettings() {
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        this.settingsForm.patchValue(settings);
        if (settings['yape_qr']) {
          this.qrUrl.set(this.getImageUrl(settings['yape_qr']));
        }
      },
      error: (err) => console.error('Error loading settings', err)
    });
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.uploadQr(file);
    }
  }

  uploadQr(file: File) {
    this.isSaving.set(true);
    this.settingsService.uploadQr(file).subscribe({
      next: (res) => {
        this.qrUrl.set(this.getImageUrl(res.url));
        this.message.set('QR actualizado correctamente');
        this.isSaving.set(false);
        setTimeout(() => this.message.set(''), 3000);
      },
      error: (err) => {
        console.error('Error uploading QR', err);
        this.message.set('Error al subir QR');
        this.isSaving.set(false);
      }
    });
  }

  saveSettings() {
    this.isSaving.set(true);
    const formData: any = { ...this.settingsForm.value };
    
    this.settingsService.updateSettings(formData).subscribe({
      next: () => {
        this.message.set('Configuración guardada correctamente');
        this.isSaving.set(false);
        setTimeout(() => this.message.set(''), 3000);
      },
      error: (err) => {
        console.error('Error saving settings', err);
        this.message.set('Error al guardar configuración');
        this.isSaving.set(false);
      }
    });
  }
}
