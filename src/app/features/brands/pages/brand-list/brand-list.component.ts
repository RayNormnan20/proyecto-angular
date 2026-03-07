import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrandsService } from '../../../products/services/brands.service';
import { Brand } from '../../../products/models/product.model';

@Component({
  selector: 'app-brand-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header Responsivo -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Gestión de Marcas</h1>
        <button (click)="openModal()" class="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Marca
        </button>
      </div>

      <!-- Desktop View (Table) -->
      <div class="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let brand of brands()">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{{ brand.id_marca }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ brand.nombre }}</td>
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{{ brand.descripcion || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="brand.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ brand.estado | titlecase }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button (click)="openModal(brand)" class="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                  <button (click)="deleteBrand(brand)" class="text-red-600 hover:text-red-900">Eliminar</button>
                </td>
              </tr>
              <tr *ngIf="brands().length === 0">
                <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">No hay marcas registradas.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile View (Cards) -->
      <div class="md:hidden space-y-4">
        <div *ngFor="let brand of brands()" class="bg-white p-4 rounded-lg shadow border border-gray-100">
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="text-lg font-bold text-gray-900">{{ brand.nombre }}</h3>
              <p class="text-xs text-gray-500">ID: #{{ brand.id_marca }}</p>
            </div>
            <span [class]="brand.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 text-xs font-semibold rounded-full">
              {{ brand.estado | titlecase }}
            </span>
          </div>
          
          <div class="mb-4">
            <p class="text-sm text-gray-600 line-clamp-2">{{ brand.descripcion || 'Sin descripción' }}</p>
          </div>

          <div class="flex justify-end space-x-3 pt-3 border-t border-gray-100">
            <button (click)="openModal(brand)" class="flex-1 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors">
              Editar
            </button>
            <button (click)="deleteBrand(brand)" class="flex-1 bg-red-50 text-red-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 transition-colors">
              Eliminar
            </button>
          </div>
        </div>

        <!-- Empty State Mobile -->
        <div *ngIf="brands().length === 0" class="bg-white p-8 rounded-lg shadow text-center">
          <p class="text-gray-500">No hay marcas registradas.</p>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div *ngIf="isModalOpen" class="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 transition-opacity" style="background-color: rgba(0, 0, 0, 0.5);" aria-hidden="true" (click)="closeModal()"></div>

        <!-- Modal panel -->
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full sm:my-8 sm:w-full sm:max-w-lg">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div class="flex justify-between items-center mb-5">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {{ isEditing ? 'Editar' : 'Nueva' }} Marca
                  </h3>
                  <button (click)="closeModal()" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                    <span class="sr-only">Cerrar</span>
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div class="mt-4">
                  <form [formGroup]="brandForm" (ngSubmit)="onSubmit()">
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input type="text" formControlName="nombre" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border">
                      <div *ngIf="brandForm.get('nombre')?.touched && brandForm.get('nombre')?.invalid" class="text-red-500 text-xs mt-1">
                        El nombre es requerido
                      </div>
                    </div>

                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea formControlName="descripcion" rows="3" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"></textarea>
                    </div>

                    <div class="mb-6">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <select formControlName="estado" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                      </select>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" (click)="onSubmit()" [disabled]="brandForm.invalid || isSubmitting" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
              {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
            </button>
            <button type="button" (click)="closeModal()" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BrandListComponent implements OnInit {
  private brandsService = inject(BrandsService);
  private fb = inject(FormBuilder);

  brands = signal<Brand[]>([]);
  isModalOpen = false;
  isEditing = false;
  currentId?: number;
  isSubmitting = false;

  brandForm = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    estado: ['activo', Validators.required]
  });

  ngOnInit() {
    this.loadBrands();
  }

  loadBrands() {
    this.brandsService.getAll().subscribe({
      next: (data: Brand[]) => this.brands.set(data),
      error: (err: any) => console.error('Error loading brands', err)
    });
  }

  openModal(brand?: Brand) {
    this.isModalOpen = true;
    if (brand) {
      this.isEditing = true;
      this.currentId = brand.id_marca;
      this.brandForm.patchValue({
        nombre: brand.nombre,
        descripcion: brand.descripcion,
        estado: brand.estado
      });
    } else {
      this.isEditing = false;
      this.currentId = undefined;
      this.brandForm.reset({
        nombre: '',
        descripcion: '',
        estado: 'activo'
      });
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.brandForm.reset();
  }

  onSubmit() {
    if (this.brandForm.invalid) return;

    this.isSubmitting = true;
    const brandData = this.brandForm.value as any;

    if (this.isEditing && this.currentId) {
      this.brandsService.update(this.currentId, brandData).subscribe({
        next: () => {
          this.loadBrands();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          alert('Error al actualizar marca');
        }
      });
    } else {
      this.brandsService.create(brandData).subscribe({
        next: () => {
          this.loadBrands();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          alert('Error al crear marca');
        }
      });
    }
  }

  deleteBrand(brand: Brand) {
    if (confirm(`¿Estás seguro de eliminar la marca "${brand.nombre}"?`)) {
      this.brandsService.delete(brand.id_marca!).subscribe({
        next: () => {
          this.loadBrands(); // Reload list
        },
        error: (err: any) => {
          console.error('Error deleting brand', err);
          alert('Error al eliminar la marca. Puede que esté en uso.');
        }
      });
    }
  }
}
