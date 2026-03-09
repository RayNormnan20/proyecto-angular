import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestimonialService, Testimonial } from '../../../../core/services/testimonial.service';
import { ToastService } from '../../../../core/services/toast.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-testimonial-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Gestión de Clientes Satisfechos</h1>
        <button (click)="openModal()" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-md">
          <span class="text-xl">+</span> Agregar Testimonio
        </button>
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
            <tr *ngFor="let testimonial of testimonials()" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <img [src]="getImageUrl(testimonial.imagen_url)" alt="Testimonio" class="h-16 w-16 object-cover rounded-md shadow-sm">
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-500 max-w-xs truncate">{{ testimonial.mensaje || 'Sin mensaje' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button 
                  (click)="toggleActive(testimonial)"
                  [class]="'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors ' + (testimonial.activo ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200')">
                  {{ testimonial.activo ? 'Activo' : 'Inactivo' }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button (click)="openModal(testimonial)" class="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-2 rounded-full transition-colors" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button (click)="deleteTestimonial(testimonial.id)" class="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-full transition-colors" title="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="testimonials().length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                No hay testimonios registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Formulario -->
      <div *ngIf="showModal" class="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
          <!-- Background overlay -->
          <div class="fixed inset-0 transition-opacity" style="background-color: rgba(0, 0, 0, 0.5);" aria-hidden="true" (click)="closeModal()"></div>

          <!-- Modal panel -->
          <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full sm:my-8 sm:w-full sm:max-w-lg">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="flex justify-between items-center mb-5">
                <h3 class="text-xl font-semibold text-gray-900">
                  {{ editingId ? 'Editar Testimonio' : 'Nuevo Testimonio' }}
                </h3>
                <button (click)="closeModal()" class="text-gray-400 hover:text-gray-500">
                  <span class="text-2xl">&times;</span>
                </button>
              </div>
              
              <div class="mt-2">
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
      </div>
    </div>
  `
})
export class TestimonialSettingsComponent {
  private testimonialService = inject(TestimonialService);
  private toastService = inject(ToastService);
  
  testimonials = signal<Testimonial[]>([]);
  
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
      this.toastService.show('La imagen es obligatoria para nuevos registros', 'error');
      return;
    }

    this.isProcessing = true;

    if (this.editingId) {
      this.testimonialService.update(this.editingId, this.formData, this.selectedFile || undefined).subscribe({
        next: (updated) => {
          this.testimonials.update(list => list.map(t => t.id === updated.id ? updated : t));
          this.toastService.show('Actualizado correctamente', 'success');
          this.closeModal();
          this.isProcessing = false;
        },
        error: (err) => {
          console.error(err);
          this.toastService.show('Error al actualizar', 'error');
          this.isProcessing = false;
        }
      });
    } else {
      if (!this.selectedFile) return; // Should be caught above
      this.testimonialService.create(this.formData, this.selectedFile).subscribe({
        next: (created) => {
          this.testimonials.update(list => [created, ...list]);
          this.toastService.show('Creado correctamente', 'success');
          this.closeModal();
          this.isProcessing = false;
        },
        error: (err) => {
          console.error(err);
          this.toastService.show('Error al crear', 'error');
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
        this.toastService.show('Eliminado correctamente', 'success');
      },
      error: (err) => {
        console.error(err);
        this.toastService.show('Error al eliminar', 'error');
      }
    });
  }

  toggleActive(testimonial: Testimonial) {
    this.testimonialService.update(testimonial.id, { ...testimonial, activo: !testimonial.activo }).subscribe({
      next: (updated) => {
        this.testimonials.update(list => list.map(t => t.id === updated.id ? updated : t));
        this.toastService.show(`Testimonio ${updated.activo ? 'activado' : 'desactivado'} correctamente`, 'success');
      },
      error: (err) => {
        console.error(err);
        this.toastService.show('Error al actualizar estado', 'error');
      }
    });
  }
}
