import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { CategoriesService } from '../../services/categories.service';
import { BrandsService } from '../../services/brands.service';
import { Category, Brand, ProductImage } from '../../models/product.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container mx-auto p-4">
      <div class="max-w-3xl mx-auto bg-white rounded shadow p-6">
        <h2 class="text-2xl font-bold mb-6">{{ isEditMode ? 'Editar' : 'Nuevo' }} Producto</h2>
        
        <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <!-- Nombre -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Nombre</label>
              <input type="text" formControlName="nombre" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>
            
            <!-- SKU -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Código SKU</label>
              <input type="text" formControlName="codigo_sku" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>
          </div>

          <!-- Descripción -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea formControlName="descripcion" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <!-- Precio -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Precio</label>
              <input type="number" formControlName="precio" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>
            
            <!-- Stock -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Stock</label>
              <input type="number" formControlName="stock" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <!-- Categoría -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Categoría</label>
              <select formControlName="categoria_id" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                <option value="">Seleccione una categoría</option>
                <option *ngFor="let cat of categories()" [value]="cat.id_categoria">{{ cat.nombre }}</option>
              </select>
            </div>
            
            <!-- Marca -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Marca</label>
              <select formControlName="marca_id" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                <option value="">Seleccione una marca</option>
                <option *ngFor="let brand of brands()" [value]="brand.id_marca">{{ brand.nombre }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <!-- Estado -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Estado</label>
              <select formControlName="estado" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="agotado">Agotado</option>
              </select>
            </div>
            
            <!-- Visible Web -->
            <div class="flex items-center mt-6">
              <input type="checkbox" formControlName="visible_web" id="visible_web" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <label for="visible_web" class="ml-2 block text-sm text-gray-900">Visible en Web Pública</label>
            </div>
          </div>

          <!-- Imágenes -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Imágenes del Producto (Máx 5)</label>
            <input type="file" multiple (change)="onFileSelect($event)" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
            
            <!-- Preview Imágenes Existentes -->
            <div class="flex gap-4 mt-4 overflow-x-auto" *ngIf="existingImages.length > 0">
               <div *ngFor="let img of existingImages" class="relative">
                 <img [src]="apiUrl + img.url" class="h-20 w-20 object-cover rounded border">
                 <button type="button" (click)="deleteImage(img.id_imagen!)" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">x</button>
               </div>
            </div>
          </div>

          <div class="flex justify-end gap-4">
            <a routerLink="/dashboard/products" class="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">Cancelar</a>
            <button type="submit" [disabled]="productForm.invalid || isSubmitting" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              {{ isSubmitting ? 'Guardando...' : 'Guardar Producto' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);
  private brandsService = inject(BrandsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  productForm = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    codigo_sku: [''],
    categoria_id: ['', Validators.required],
    marca_id: ['', Validators.required],
    estado: ['activo', Validators.required],
    visible_web: [true]
  });

  isEditMode = false;
  productId?: number;
  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);
  selectedFiles: File[] = [];
  existingImages: ProductImage[] = [];
  isSubmitting = false;
  apiUrl = environment.imageBaseUrl;

  ngOnInit() {
    this.loadDependencies();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = +id;
      this.loadProduct(this.productId);
    }
  }

  loadDependencies() {
    this.categoriesService.getAll().subscribe(res => this.categories.set(res));
    this.brandsService.getAll().subscribe(res => this.brands.set(res));
  }

  loadProduct(id: number) {
    this.productsService.getById(id).subscribe(product => {
      this.productForm.patchValue({
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: product.precio,
        stock: product.stock,
        codigo_sku: product.codigo_sku,
        categoria_id: product.categoria_id as any,
        marca_id: product.marca_id as any,
        estado: product.estado,
        visible_web: product.visible_web
      });
      if (product.images) {
        this.existingImages = product.images;
      }
    });
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  deleteImage(imageId: number) {
    if (confirm('¿Eliminar imagen?')) {
      this.productsService.deleteImage(imageId).subscribe(() => {
        this.existingImages = this.existingImages.filter(img => img.id_imagen !== imageId);
      });
    }
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    this.isSubmitting = true;
    const formData = new FormData();
    
    Object.keys(this.productForm.value).forEach(key => {
      formData.append(key, this.productForm.get(key)?.value);
    });

    this.selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    if (this.isEditMode && this.productId) {
      this.productsService.update(this.productId, formData).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/products']);
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
        }
      });
    } else {
      this.productsService.create(formData).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/products']);
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
        }
      });
    }
  }
}
