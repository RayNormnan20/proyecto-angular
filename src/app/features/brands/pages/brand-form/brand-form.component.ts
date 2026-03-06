import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BrandsService } from '../../../products/services/brands.service';
import { Brand } from '../../../products/models/product.model';

@Component({
  selector: 'app-brand-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">{{ isEditing() ? 'Editar' : 'Nueva' }} Marca</h1>
        
        <div class="bg-white rounded-lg shadow p-6">
          <form [formGroup]="brandForm" (ngSubmit)="onSubmit()">
            
            <div class="mb-4">
              <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input 
                type="text" 
                id="nombre" 
                formControlName="nombre"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="brandForm.get('nombre')?.invalid && brandForm.get('nombre')?.touched"
              >
              <div *ngIf="brandForm.get('nombre')?.invalid && brandForm.get('nombre')?.touched" class="text-red-500 text-xs mt-1">
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
              <a routerLink="/dashboard/brands" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancelar</a>
              <button 
                type="submit" 
                [disabled]="brandForm.invalid || isSubmitting()"
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
export class BrandFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private brandsService = inject(BrandsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditing = signal(false);
  isSubmitting = signal(false);
  brandId: number | null = null;

  brandForm = this.fb.group({
    nombre: ['', [Validators.required]],
    descripcion: [''],
    estado: ['activo', [Validators.required]]
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditing.set(true);
        this.brandId = +id;
        this.loadBrand(this.brandId);
      }
    });
  }

  loadBrand(id: number) {
    this.brandsService.getById(id).subscribe({
      next: (brand) => {
        this.brandForm.patchValue({
          nombre: brand.nombre,
          descripcion: brand.descripcion,
          estado: brand.estado
        });
      },
      error: (err: any) => {
        console.error('Error loading brand', err);
        this.router.navigate(['/dashboard/brands']);
      }
    });
  }

  onSubmit() {
    if (this.brandForm.invalid) return;

    this.isSubmitting.set(true);
    const brandData = this.brandForm.value as Brand;

    if (this.isEditing() && this.brandId) {
      this.brandsService.update(this.brandId, brandData).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/brands']);
        },
        error: (err) => {
          console.error('Error updating brand', err);
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.brandsService.create(brandData).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/brands']);
        },
        error: (err) => {
          console.error('Error creating brand', err);
          this.isSubmitting.set(false);
        }
      });
    }
  }
}
