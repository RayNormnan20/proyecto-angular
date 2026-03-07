import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoriesService } from '../../../products/services/categories.service';
import { Category } from '../../../products/models/product.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">{{ isEditing() ? 'Editar' : 'Nueva' }} Categoría</h1>
        
        <div class="bg-white rounded-lg shadow p-6">
          <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
            
            <div class="mb-4">
              <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input 
                type="text" 
                id="nombre" 
                formControlName="nombre"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="categoryForm.get('nombre')?.invalid && categoryForm.get('nombre')?.touched"
              >
              <div *ngIf="categoryForm.get('nombre')?.invalid && categoryForm.get('nombre')?.touched" class="text-red-500 text-xs mt-1">
                El nombre es requerido.
              </div>
            </div>

            <div class="mb-4">
              <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea 
                id="descripcion" 
                formControlName="descripcion"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
              <div class="flex items-center space-x-4">
                <div class="shrink-0" *ngIf="imagePreview">
                  <img [src]="imagePreview" class="h-16 w-16 object-cover rounded-md border border-gray-300">
                </div>
                <label class="block">
                  <span class="sr-only">Elegir imagen</span>
                  <input type="file" (change)="onFileSelected($event)" accept="image/*"
                    class="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                    "/>
                </label>
              </div>
            </div>

            <div class="mb-6">
              <label for="estado" class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select 
                id="estado" 
                formControlName="estado"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div class="flex justify-end gap-4">
              <a routerLink="/dashboard/categories" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancelar</a>
              <button 
                type="submit" 
                [disabled]="categoryForm.invalid || isSubmitting()"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSubmitting() ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  `
})
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoriesService = inject(CategoriesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditing = signal(false);
  isSubmitting = signal(false);
  categoryId: number | null = null;

  categoryForm = this.fb.group({
    nombre: ['', [Validators.required]],
    descripcion: [''],
    estado: ['activo', [Validators.required]]
  });

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditing.set(true);
        this.categoryId = +id;
        this.loadCategory(this.categoryId);
      }
    });
  }

  loadCategory(id: number) {
    this.categoriesService.getById(id).subscribe({
      next: (category) => {
        this.categoryForm.patchValue({
          nombre: category.nombre,
          descripcion: category.descripcion,
          estado: category.estado
        });
        if (category.imagen) {
          const baseUrl = environment.imageBaseUrl || 'http://localhost:3000';
          this.imagePreview = `${baseUrl}${category.imagen}`;
        }
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(['/dashboard/categories']);
      }
    });
  }

  onSubmit() {
    if (this.categoryForm.invalid) return;

    this.isSubmitting.set(true);
    
    const formData = new FormData();
    Object.keys(this.categoryForm.controls).forEach(key => {
      const control = this.categoryForm.get(key);
      if (control?.value) {
        formData.append(key, control.value);
      }
    });

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const request = this.isEditing() && this.categoryId
      ? this.categoriesService.update(this.categoryId, formData)
      : this.categoriesService.create(formData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/dashboard/categories']);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting.set(false);
      }
    });
  }
}
