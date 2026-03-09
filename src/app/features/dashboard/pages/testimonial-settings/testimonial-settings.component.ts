import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestimonialService, Testimonial } from '../../../../core/services/testimonial.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-testimonial-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Gestión de Clientes Satisfechos</h1>
        <button (click)="openModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <span>+</span> Agregar Testimonio
        </button>
      </div>

      <!-- Mensaje de estado -->
      <div *ngIf="message()" [class]="'p-4 mb-4 rounded-md ' + (message()?.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')">
        {{ message()?.text }}
      </div>

      <!-- Lista de Testimonios -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensaje</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let testimonial of testimonials()">
              <td class="px-6 py-4 whitespace-nowrap">
                <img [src]="getImageUrl(testimonial.imagen_url)" alt="Testimonio" class="h-16 w-16 object-cover rounded-md">
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-500 max-w-xs truncate">{{ testimonial.mensaje || 'Sin mensaje' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button 
                  (click)="toggleActive(testimonial)"
                  [class]="'px-2 inline-flex text-xs leading-5 font-semibold rounded-full ' + (testimonial.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')">
                  {{ testimonial.activo ? 'Activo' : 'Inactivo' }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button (click)="openModal(testimonial)" class="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                <button (click)="deleteTestimonial(testimonial.id)" class="text-red-600 hover:text-red-900">Eliminar</button>
              </td>
            </tr>
            <tr *ngIf="testimonials().length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                No hay testimonios registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Formulario -->
      <div *ngIf="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full m-4">
          <div class="flex justify-between items-center p-5 border-b">
            <h3 class="text-xl font-semibold text-gray-900">
              {{ editingId ? 'Editar Testimonio' : 'Nuevo Testimonio' }}
            </h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-500">
              <span class="text-2xl">&times;</span>
            </button>
          </div>
          
          <div class="p-6">
            <form (ngSubmit)="saveTestimonial()" #form="ngForm">
              <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Mensaje / Testimonio (Opcional)</label>
                <textarea [(ngModel)]="formData.mensaje" name="mensaje" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
              </div>
              
              <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Imagen {{ !editingId ? '(Requerida)' : '(Opcional)' }}</label>
                <input type="file" (change)="onFileSelected($event)" accept="image/*" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                <p class="text-xs text-gray-500 mt-1">Se recomienda formato cuadrado (ej. 500x500)</p>
              </div>

              <div class="mb-4 flex items-center">
                <input type="checkbox" [(ngModel)]="formData.activo" name="activo" id="activo" class="mr-2">
                <label for="activo" class="text-gray-700 text-sm font-bold">Activo (Visible en web)</label>
              </div>
              
              <div class="flex justify-end pt-4">
                <button type="button" (click)="closeModal()" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg mr-2 hover:bg-gray-300">Cancelar</button>
                <button type="submit" [disabled]="isProcessing" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {{ isProcessing ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TestimonialSettingsComponent {
  private testimonialService = inject(TestimonialService);
  
  testimonials = signal<Testimonial[]>([]);
  message = signal<{text: string, type: 'success' | 'error'} | null>(null);
  
  showModal = false;
  editingId: number | null = null;
  isProcessing = false;
  
  formData = {
    mensaje: '',
    activo: true
  };
  
  selectedFile: File | null = null;

  constructor() {
    this.loadTestimonials();
  }

  loadTestimonials() {
    this.testimonialService.getAll().subscribe({
      next: (data) => this.testimonials.set(data),
      error: (err) => console.error('Error loading testimonials', err)
    });
  }

  getImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${environment.imageBaseUrl}${url.startsWith('/') ? url : '/' + url}`;
  }

  openModal(testimonial?: Testimonial) {
    if (testimonial) {
      this.editingId = testimonial.id;
      this.formData = {
        mensaje: testimonial.mensaje || '',
        activo: testimonial.activo
      };
    } else {
      this.editingId = null;
      this.formData = {
        mensaje: '',
        activo: true
      };
    }
    this.selectedFile = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.selectedFile = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  saveTestimonial() {
    if (!this.editingId && !this.selectedFile) {
      this.showMessage('La imagen es obligatoria para nuevos registros', 'error');
      return;
    }

    this.isProcessing = true;

    if (this.editingId) {
      this.testimonialService.update(this.editingId, this.formData, this.selectedFile || undefined).subscribe({
        next: (updated) => {
          this.testimonials.update(list => list.map(t => t.id === updated.id ? updated : t));
          this.showMessage('Actualizado correctamente', 'success');
          this.closeModal();
          this.isProcessing = false;
        },
        error: (err) => {
          console.error(err);
          this.showMessage('Error al actualizar', 'error');
          this.isProcessing = false;
        }
      });
    } else {
      if (!this.selectedFile) return; // Should be caught above
      this.testimonialService.create(this.formData, this.selectedFile).subscribe({
        next: (created) => {
          this.testimonials.update(list => [created, ...list]);
          this.showMessage('Creado correctamente', 'success');
          this.closeModal();
          this.isProcessing = false;
        },
        error: (err) => {
          console.error(err);
          this.showMessage('Error al crear', 'error');
          this.isProcessing = false;
        }
      });
    }
  }

  deleteTestimonial(id: number) {
    if (!confirm('¿Estás seguro de eliminar este testimonio?')) return;
    
    this.testimonialService.delete(id).subscribe({
      next: () => {
        this.testimonials.update(list => list.filter(t => t.id !== id));
        this.showMessage('Eliminado correctamente', 'success');
      },
      error: (err) => {
        console.error(err);
        this.showMessage('Error al eliminar', 'error');
      }
    });
  }

  toggleActive(testimonial: Testimonial) {
    this.testimonialService.update(testimonial.id, { ...testimonial, activo: !testimonial.activo }).subscribe({
      next: (updated) => {
        this.testimonials.update(list => list.map(t => t.id === updated.id ? updated : t));
      },
      error: (err) => console.error(err)
    });
  }

  showMessage(text: string, type: 'success' | 'error') {
    this.message.set({ text, type });
    setTimeout(() => this.message.set(null), 3000);
  }
}
