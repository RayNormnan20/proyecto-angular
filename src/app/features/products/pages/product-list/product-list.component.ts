import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { CategoriesService } from '../../services/categories.service';
import { BrandsService } from '../../services/brands.service';
import { Product, Category, Brand, ProductImage } from '../../models/product.model';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 class="text-2xl font-bold text-gray-800">Gestión de Productos</h1>
        <button (click)="openModal()" class="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center">
          + Nuevo Producto
        </button>
      </div>

      <!-- Filtros -->
      <div class="bg-white p-4 rounded shadow mb-6 flex flex-col md:flex-row gap-4">
        <input 
          type="text" 
          placeholder="Buscar producto..." 
          class="border p-2 rounded flex-grow"
          [(ngModel)]="searchTerm"
          (keyup.enter)="loadProducts()"
        >
        <button (click)="loadProducts()" class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 w-full md:w-auto">Buscar</button>
      </div>

      <!-- Desktop View (Table) -->
      <div class="hidden md:block bg-white rounded shadow overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let product of products()">
              <td class="px-6 py-4 whitespace-nowrap">
                <img 
                  [src]="getProductImage(product)" 
                  class="h-10 w-10 rounded-full object-cover" 
                  alt="Product"
                  onerror="this.onerror=null;this.src='assets/img/placeholder.png'"
                >
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ product.nombre }}</div>
                <div class="text-sm text-gray-500">{{ product.codigo_sku }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                S/. {{ product.precio }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ product.stock }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="getStatusClass(product.estado)">
                  {{ product.estado }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button (click)="openModal(product)" class="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                <button (click)="deleteProduct(product.id_producto!)" class="text-red-600 hover:text-red-900">Eliminar</button>
              </td>
            </tr>
            <tr *ngIf="products().length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">No hay productos encontrados.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile View (Cards) -->
      <div class="md:hidden space-y-4">
        <div *ngFor="let product of products()" class="bg-white p-4 rounded-lg shadow border border-gray-100">
          <div class="flex gap-4 mb-4">
            <img 
              [src]="getProductImage(product)" 
              class="h-20 w-20 rounded-lg object-cover bg-gray-100" 
              alt="Product"
              onerror="this.onerror=null;this.src='assets/img/placeholder.png'"
            >
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start">
                <h3 class="text-sm font-bold text-gray-900 truncate pr-2">{{ product.nombre }}</h3>
                <span [class]="getStatusClass(product.estado) + ' text-xs px-2 py-0.5'">
                  {{ product.estado }}
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-1">SKU: {{ product.codigo_sku }}</p>
              <p class="text-lg font-bold text-gray-900 mt-2">S/. {{ product.precio }}</p>
            </div>
          </div>
          
          <div class="flex justify-between items-center border-t border-gray-100 pt-3">
             <div class="text-sm text-gray-600">
               Stock: <span class="font-medium text-gray-900">{{ product.stock }}</span>
             </div>
             <div class="flex space-x-3">
               <button (click)="openModal(product)" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Editar</button>
               <button (click)="deleteProduct(product.id_producto!)" class="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
             </div>
          </div>
        </div>
        
        <div *ngIf="products().length === 0" class="text-center py-8 text-gray-500 bg-white rounded-lg shadow">
          No hay productos encontrados.
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div *ngIf="isModalOpen" class="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 transition-opacity" style="background-color: rgba(0, 0, 0, 0.5);" aria-hidden="true" (click)="closeModal()"></div>

        <!-- Modal panel -->
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full sm:my-8 sm:w-full sm:max-w-2xl">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div class="flex justify-between items-center mb-5">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}
                  </h3>
                  <button (click)="closeModal()" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                    <span class="sr-only">Cerrar</span>
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div class="mt-4">
                  <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <!-- Nombre -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" formControlName="nombre" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border">
                        <div *ngIf="productForm.get('nombre')?.touched && productForm.get('nombre')?.invalid" class="text-red-500 text-xs mt-1">Requerido</div>
                      </div>
                      
                      <!-- SKU -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Código SKU</label>
                        <input type="text" formControlName="codigo_sku" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border">
                      </div>
                    </div>

                    <!-- Descripción -->
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700">Descripción</label>
                      <textarea formControlName="descripcion" rows="3" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"></textarea>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <!-- Precio -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Precio</label>
                        <input type="number" formControlName="precio" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border">
                        <div *ngIf="productForm.get('precio')?.touched && productForm.get('precio')?.invalid" class="text-red-500 text-xs mt-1">Requerido</div>
                      </div>
                      
                      <!-- Stock -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Stock</label>
                        <input type="number" formControlName="stock" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border">
                        <div *ngIf="productForm.get('stock')?.touched && productForm.get('stock')?.invalid" class="text-red-500 text-xs mt-1">Requerido</div>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <!-- Categoría -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Categoría</label>
                        <select formControlName="categoria_id" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                          <option value="">Seleccione una categoría</option>
                          <option *ngFor="let cat of categories()" [value]="cat.id_categoria">{{ cat.nombre }}</option>
                        </select>
                        <div *ngIf="productForm.get('categoria_id')?.touched && productForm.get('categoria_id')?.invalid" class="text-red-500 text-xs mt-1">Requerido</div>
                      </div>
                      
                      <!-- Marca -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Marca</label>
                        <select formControlName="marca_id" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                          <option value="">Seleccione una marca</option>
                          <option *ngFor="let brand of brands()" [value]="brand.id_marca">{{ brand.nombre }}</option>
                        </select>
                        <div *ngIf="productForm.get('marca_id')?.touched && productForm.get('marca_id')?.invalid" class="text-red-500 text-xs mt-1">Requerido</div>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <!-- Estado -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Estado</label>
                        <select formControlName="estado" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                          <option value="activo">Activo</option>
                          <option value="inactivo">Inactivo</option>
                          <option value="agotado">Agotado</option>
                        </select>
                      </div>
                      
                      <!-- Visible Web -->
                      <div class="flex items-center mt-6">
                        <input type="checkbox" formControlName="visible_web" id="visible_web" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                        <label for="visible_web" class="ml-2 block text-sm text-gray-900">Visible en Web Pública</label>
                      </div>
                    </div>

                    <!-- Imágenes -->
                    <div class="mb-6">
                      <label class="block text-sm font-medium text-gray-700 mb-2">Imágenes del Producto (Máx 5)</label>
                      <input type="file" multiple (change)="onFileSelect($event)" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
                      
                      <!-- Preview Imágenes Existentes -->
                      <div class="flex gap-4 mt-4 overflow-x-auto" *ngIf="existingImages.length > 0">
                         <div *ngFor="let img of existingImages" class="relative">
                           <img [src]="getImageUrl(img.url)" class="h-20 w-20 object-cover rounded border">
                           <button type="button" (click)="deleteImage(img.id_imagen!)" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">x</button>
                         </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" (click)="onSubmit()" [disabled]="productForm.invalid || isSubmitting" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
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
export class ProductListComponent implements OnInit {
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);
  private brandsService = inject(BrandsService);
  private fb = inject(FormBuilder);
  
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);
  
  searchTerm = '';
  apiUrl = environment.apiUrl;
  imageBaseUrl = environment.imageBaseUrl;

  // Modal & Form State
  isModalOpen = false;
  isEditing = false;
  currentId?: number;
  isSubmitting = false;
  selectedFiles: File[] = [];
  existingImages: ProductImage[] = [];

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

  ngOnInit() {
    this.loadProducts();
    this.loadDependencies();
  }

  loadProducts() {
    this.productsService.getAll({ search: this.searchTerm }).subscribe({
      next: (res) => {
        this.products.set(res.products);
      },
      error: (err) => console.error(err)
    });
  }

  loadDependencies() {
    this.categoriesService.getAll().subscribe(res => this.categories.set(res));
    this.brandsService.getAll().subscribe(res => this.brands.set(res));
  }

  getProductImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      return this.getImageUrl(product.images[0].url);
    }
    return 'assets/img/placeholder.png'; // Asegurarse de tener un placeholder
  }

  getImageUrl(url: string): string {
    if (!url) return 'assets/img/placeholder.png';
    if (url.startsWith('http')) return url;
    return `${this.imageBaseUrl}${url}`;
  }

  getStatusClass(status: string): string {
    const base = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full ";
    switch (status) {
      case 'activo': return base + "bg-green-100 text-green-800";
      case 'inactivo': return base + "bg-gray-100 text-gray-800";
      case 'agotado': return base + "bg-red-100 text-red-800";
      default: return base + "bg-gray-100 text-gray-800";
    }
  }

  openModal(product?: Product) {
    this.isModalOpen = true;
    this.selectedFiles = [];
    this.existingImages = [];

    if (product) {
      this.isEditing = true;
      this.currentId = product.id_producto;
      
      // Load full product details to get images if they aren't fully populated in list
      // But since we have them in the list, we can use them. 
      // However, if we need fresh data, we should fetch. 
      // For now, let's use what we have or fetch if needed.
      // Actually, list might not have all details if paginated/simplified.
      // Let's fetch to be safe, or just use what passed if sufficient.
      // The previous implementation fetched by ID.
      this.productsService.getById(product.id_producto!).subscribe(fullProduct => {
        this.productForm.patchValue({
          nombre: fullProduct.nombre,
          descripcion: fullProduct.descripcion,
          precio: fullProduct.precio,
          stock: fullProduct.stock,
          codigo_sku: fullProduct.codigo_sku,
          categoria_id: fullProduct.categoria_id as any,
          marca_id: fullProduct.marca_id as any,
          estado: fullProduct.estado,
          visible_web: fullProduct.visible_web
        });
        if (fullProduct.images) {
          this.existingImages = fullProduct.images;
        }
      });
      
    } else {
      this.isEditing = false;
      this.currentId = undefined;
      this.productForm.reset({
        nombre: '',
        descripcion: '',
        precio: 0,
        stock: 0,
        codigo_sku: '',
        categoria_id: '',
        marca_id: '',
        estado: 'activo',
        visible_web: true
      });
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.productForm.reset();
    this.selectedFiles = [];
    this.existingImages = [];
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
        // Also update the list view if needed
        this.loadProducts(); 
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

    if (this.isEditing && this.currentId) {
      this.productsService.update(this.currentId, formData).subscribe({
        next: () => {
          this.loadProducts();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          alert('Error al actualizar producto');
        }
      });
    } else {
      this.productsService.create(formData).subscribe({
        next: () => {
          this.loadProducts();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          alert('Error al crear producto');
        }
      });
    }
  }

  deleteProduct(id: number) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productsService.delete(id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (err) => alert('Error al eliminar producto')
      });
    }
  }
}
