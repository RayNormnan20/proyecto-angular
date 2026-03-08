import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriesService } from '../../../products/services/categories.service';
import { Category } from '../../../products/models/product.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header Responsivo -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Gestión de Categorías</h1>
        <button (click)="openModal()" class="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Categoría
        </button>
      </div>

      <!-- Desktop View (Table) -->
      <div class="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let category of categories()">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{{ category.id_categoria }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                    <img [src]="getImageUrl(category.imagen)" alt="" class="h-full w-full object-cover" onerror="this.onerror=null;this.src='assets/img/cat-placeholder.jpg'">
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ category.nombre }}</td>
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{{ category.descripcion || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="category.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ category.estado | titlecase }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button (click)="openModal(category)" class="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                  <button (click)="deleteCategory(category)" class="text-red-600 hover:text-red-900">Eliminar</button>
                </td>
              </tr>
              <tr *ngIf="categories().length === 0">
                <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">No hay categorías registradas.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile View (Cards) -->
      <div class="md:hidden space-y-4">
        <div *ngFor="let category of categories()" class="bg-white p-4 rounded-lg shadow border border-gray-100">
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="text-lg font-bold text-gray-900">{{ category.nombre }}</h3>
              <p class="text-xs text-gray-500">ID: #{{ category.id_categoria }}</p>
            </div>
            <span [class]="category.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 text-xs font-semibold rounded-full">
              {{ category.estado | titlecase }}
            </span>
          </div>
          
          <div class="mb-4">
            <p class="text-sm text-gray-600 line-clamp-2">{{ category.descripcion || 'Sin descripción' }}</p>
          </div>

          <div class="flex justify-end space-x-3 pt-3 border-t border-gray-100">
            <button (click)="openModal(category)" class="flex-1 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors">
              Editar
            </button>
            <button (click)="deleteCategory(category)" class="flex-1 bg-red-50 text-red-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 transition-colors">
              Eliminar
            </button>
          </div>
        </div>

        <!-- Empty State Mobile -->
        <div *ngIf="categories().length === 0" class="bg-white p-8 rounded-lg shadow text-center">
          <p class="text-gray-500">No hay categorías registradas.</p>
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
                    {{ isEditing ? 'Editar' : 'Nueva' }} Categoría
                  </h3>
                  <button (click)="closeModal()" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                    <span class="sr-only">Cerrar</span>
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div class="mt-4">
                  <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input type="text" formControlName="nombre" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border">
                      <div *ngIf="categoryForm.get('nombre')?.touched && categoryForm.get('nombre')?.invalid" class="text-red-500 text-xs mt-1">
                        El nombre es requerido
                      </div>
                    </div>

                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea formControlName="descripcion" rows="3" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"></textarea>
                    </div>

                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                      <div class="mt-1 flex items-center gap-4">
                        <div *ngIf="imagePreview" class="w-20 h-20 border rounded overflow-hidden">
                          <img [src]="imagePreview" alt="Preview" class="w-full h-full object-cover">
                        </div>
                        <input type="file" (change)="onFileSelected($event)" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                      </div>
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
            <button type="button" (click)="onSubmit()" [disabled]="categoryForm.invalid || isSubmitting" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
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
export class CategoryListComponent implements OnInit {
  private categoriesService = inject(CategoriesService);
  private fb = inject(FormBuilder);
  apiUrl = environment.apiUrl;
  imageBaseUrl = environment.imageBaseUrl;
  
  categories = signal<Category[]>([]);
  isModalOpen = false;
  isEditing = false;
  currentId?: number;
  isSubmitting = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  categoryForm = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    estado: ['activo', Validators.required]
  });

  getImageUrl(url: string | undefined): string {
    if (!url) return 'assets/img/cat-placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `${this.imageBaseUrl}${url}`;
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoriesService.getAll().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Error loading categories', err)
    });
  }

  openModal(category?: Category) {
    this.isModalOpen = true;
    this.selectedFile = null;
    this.imagePreview = null;

    if (category) {
      this.isEditing = true;
      this.currentId = category.id_categoria;
      if (category.imagen) {
        this.imagePreview = this.getImageUrl(category.imagen);
      }
      this.categoryForm.patchValue({
        nombre: category.nombre,
        descripcion: category.descripcion,
        estado: category.estado
      });
    } else {
      this.isEditing = false;
      this.currentId = undefined;
      this.categoryForm.reset({
        nombre: '',
        descripcion: '',
        estado: 'activo'
      });
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.categoryForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.categoryForm.invalid) return;

    this.isSubmitting = true;
    
    const formData = new FormData();
    formData.append('nombre', this.categoryForm.get('nombre')?.value || '');
    formData.append('descripcion', this.categoryForm.get('descripcion')?.value || '');
    formData.append('estado', this.categoryForm.get('estado')?.value || 'activo');
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.isEditing && this.currentId) {
      this.categoriesService.update(this.currentId, formData).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          alert('Error al actualizar categoría');
        }
      });
    } else {
      this.categoriesService.create(formData).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          alert('Error al crear categoría');
        }
      });
    }
  }

  deleteCategory(category: Category) {
    if (confirm(`¿Estás seguro de eliminar la categoría "${category.nombre}"?`)) {
      this.categoriesService.delete(category.id_categoria!).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: (err) => {
          console.error('Error deleting category', err);
          alert('Error al eliminar la categoría. Puede que esté en uso.');
        }
      });
    }
  }
}
