import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { CategoriesService } from '../../services/categories.service';
import { BrandsService } from '../../services/brands.service';
import { ToastService } from '../../../../core/services/toast.service';
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
      <div class="bg-white p-4 rounded shadow mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div class="flex-grow w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Buscar producto..." 
            class="w-full border p-2 rounded"
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)"
            (keyup.enter)="onSearch()"
          >
        </div>
        
        <div class="w-full md:w-64">
          <select 
            [ngModel]="selectedCategoryId()" 
            (ngModelChange)="onCategoryChange($event)"
            class="w-full border p-2 rounded bg-white"
          >
            <option [ngValue]="null">Todas las Categorías</option>
            <option *ngFor="let cat of categories()" [ngValue]="cat.id_categoria">
              {{ cat.nombre }}
            </option>
          </select>
        </div>

        <button (click)="onSearch()" class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 w-full md:w-auto">Buscar</button>
      </div>

      <!-- Desktop View (Table) -->
      <div class="hidden md:block bg-white rounded shadow overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
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
                {{ product.category?.nombre || 'Sin categoría' }}
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
                <div class="flex space-x-2">
                  <button (click)="openModal(product)" class="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-2 rounded-full transition-colors" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button (click)="deleteProduct(product.id_producto!)" class="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-full transition-colors" title="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="products().length === 0">
              <td colspan="7" class="px-6 py-4 text-center text-gray-500">No hay productos encontrados.</td>
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
              <p class="text-xs text-gray-500">{{ product.category?.nombre }}</p>
              <p class="text-lg font-bold text-gray-900 mt-2">S/. {{ product.precio }}</p>
            </div>
          </div>
          
          <div class="flex justify-between items-center border-t border-gray-100 pt-3">
             <div class="text-sm text-gray-600">
               Stock: <span class="font-medium text-gray-900">{{ product.stock }}</span>
             </div>
             <div class="flex space-x-3">
               <button (click)="openModal(product)" class="flex items-center space-x-1 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                 </svg>
                 <span>Editar</span>
               </button>
               <button (click)="deleteProduct(product.id_producto!)" class="flex items-center space-x-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-100 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                 </svg>
                 <span>Eliminar</span>
               </button>
             </div>
          </div>
        </div>
        
        <div *ngIf="products().length === 0" class="text-center py-8 text-gray-500 bg-white rounded-lg shadow">
          No hay productos encontrados.
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded shadow" *ngIf="totalItems() > 0">
        <div class="flex flex-1 justify-between sm:hidden">
          <button 
            [disabled]="currentPage() === 1"
            (click)="changePage(currentPage() - 1)"
            class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <button 
            [disabled]="currentPage() === totalPages()"
            (click)="changePage(currentPage() + 1)"
            class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Mostrando <span class="font-medium">{{ (currentPage() - 1) * itemsPerPage() + 1 }}</span> a <span class="font-medium">{{ Math.min(currentPage() * itemsPerPage(), totalItems()) }}</span> de <span class="font-medium">{{ totalItems() }}</span> resultados
            </p>
          </div>
          <div>
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button 
                [disabled]="currentPage() === 1"
                (click)="changePage(currentPage() - 1)"
                class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span class="sr-only">Anterior</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <!-- Simple pagination: just show current page for now to keep it simple -->
              <span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                Página {{ currentPage() }} de {{ totalPages() }}
              </span>

              <button 
                [disabled]="currentPage() === totalPages()"
                (click)="changePage(currentPage() + 1)"
                class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span class="sr-only">Siguiente</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
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

                    <!-- Precios por Volumen -->
                    <div class="mb-6 border border-gray-200 rounded-lg p-4">
                      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div>
                          <div class="text-sm font-bold text-gray-900">Descuentos por cantidades</div>
                          <div class="text-xs text-gray-500">Define precios por docena, mayor, millar, etc. Se aplica el mejor precio según la cantidad.</div>
                        </div>
                        <div class="flex flex-wrap gap-2">
                          <button type="button" (click)="addVolumeTier()" class="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700">
                            + Agregar
                          </button>
                          <button type="button" (click)="addVolumeTier(12)" class="px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100">
                            Docena (12)
                          </button>
                          <button type="button" (click)="addVolumeTier(100)" class="px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100">
                            Centena (100)
                          </button>
                          <button type="button" (click)="addVolumeTier(1000)" class="px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100">
                            Millar (1000)
                          </button>
                        </div>
                      </div>

                      <div *ngIf="volumePrices.length === 0" class="text-sm text-gray-500 bg-gray-50 rounded-md p-3">
                        Sin reglas de precio por volumen. Se usará el precio normal.
                      </div>

                      <div *ngIf="volumePrices.length > 0" class="space-y-3">
                        <div class="hidden sm:flex gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          <div class="w-[40%]">Desde (cantidad)</div>
                          <div class="w-[40%]">Precio unitario</div>
                          <div class="flex-1"></div>
                        </div>

                        <div *ngFor="let tier of volumePrices; let i = index; trackBy: trackByIndex" class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                          <div class="sm:w-[40%]">
                            <label class="sm:hidden block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Desde (cantidad)</label>
                            <input
                              type="text"
                              inputmode="numeric"
                              pattern="[0-9]*"
                              [name]="'tier_min_' + i"
                              [(ngModel)]="volumePrices[i].min"
                              [ngModelOptions]="{ standalone: true }"
                              class="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div class="sm:w-[40%]">
                            <label class="sm:hidden block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Precio unitario</label>
                            <input
                              type="text"
                              inputmode="decimal"
                              pattern="^[0-9]*([.,][0-9]{0,2})?$"
                              [name]="'tier_price_' + i"
                              [(ngModel)]="volumePrices[i].precio"
                              [ngModelOptions]="{ standalone: true }"
                              class="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div class="sm:w-auto flex justify-start sm:justify-start">
                            <button type="button" (click)="removeVolumeTier(i)" class="px-3 py-2 rounded-md bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100">
                              Quitar
                            </button>
                          </div>
                        </div>
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
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);
  
  // Filter Signals
  searchTerm = signal('');
  selectedCategoryId = signal<number | null>(null);
  
  // Pagination Signals
  currentPage = signal(1);
  itemsPerPage = signal(10);
  totalItems = signal(0);
  totalPages = signal(0);
  Math = Math; // Make Math available in template

  apiUrl = environment.apiUrl;
  imageBaseUrl = environment.imageBaseUrl;

  // Modal & Form State
  isModalOpen = false;
  isEditing = false;
  currentId?: number;
  isSubmitting = false;
  selectedFiles: File[] = [];
  existingImages: ProductImage[] = [];
  volumePrices: Array<{ min: number | string; precio: number | string }> = [];

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
    const params: any = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
    };

    if (this.searchTerm()) {
      params.search = this.searchTerm();
    }

    if (this.selectedCategoryId()) {
      params.category = this.selectedCategoryId();
    }

    this.productsService.getAll(params).subscribe({
      next: (res: any) => {
        // Handle response from backend (can be array or object with pagination)
        if (res.products && Array.isArray(res.products)) {
           this.products.set(res.products);
           this.totalItems.set(res.total || res.products.length);
           this.totalPages.set(res.totalPages || 1);
        } else if (Array.isArray(res)) {
           // Fallback for old API response
           this.products.set(res);
           this.totalItems.set(res.length);
           this.totalPages.set(1);
        }
      },
      error: (err) => console.error(err)
    });
  }

  onSearch() {
    this.currentPage.set(1);
    this.loadProducts();
  }

  onCategoryChange(categoryId: number | null) {
    this.selectedCategoryId.set(categoryId);
    this.currentPage.set(1);
    this.loadProducts();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadProducts();
    }
  }

  loadDependencies() {
    this.categoriesService.getAll().subscribe(res => this.categories.set(res));
    this.brandsService.getAll().subscribe(res => this.brands.set(res));
  }

  getProductImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      return this.getImageUrl(product.images[0].url);
    }
    return 'assets/img/placeholder.png';
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
        const rawVolume = (fullProduct as any).precios_volumen;
        if (Array.isArray(rawVolume)) {
          this.volumePrices = [...rawVolume];
        } else if (typeof rawVolume === 'string' && rawVolume.trim()) {
          try {
            const parsed = JSON.parse(rawVolume);
            this.volumePrices = Array.isArray(parsed) ? parsed : [];
          } catch {
            this.volumePrices = [];
          }
        } else {
          this.volumePrices = [];
        }
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
      this.volumePrices = [];
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.productForm.reset();
    this.selectedFiles = [];
    this.existingImages = [];
    this.volumePrices = [];
  }

  addVolumeTier(min?: number) {
    const nextMin = typeof min === 'number' ? min : 1;
    this.volumePrices = [...this.volumePrices, { min: nextMin, precio: 0 }];
  }

  removeVolumeTier(index: number) {
    this.volumePrices = this.volumePrices.filter((_, i) => i !== index);
  }

  trackByIndex(index: number) {
    return index;
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
        this.loadProducts(); 
      });
    }
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    this.isSubmitting = true;
    const formData = new FormData();
    
    Object.keys(this.productForm.controls).forEach(key => {
      const value = this.productForm.get(key)?.value;
      formData.append(key, value);
    });

    const cleanedVolumePrices = this.volumePrices
      .map(t => ({ min: Number(String(t.min).replace(/[^0-9]/g, '')), precio: Number(String(t.precio).replace(',', '.').replace(/[^0-9.]/g, '')) }))
      .filter(t => Number.isFinite(t.min) && t.min > 0 && Number.isFinite(t.precio) && t.precio >= 0)
      .sort((a, b) => a.min - b.min);
    if (cleanedVolumePrices.length > 0) {
      formData.append('precios_volumen', JSON.stringify(cleanedVolumePrices));
    }

    this.selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    if (this.isEditing && this.currentId) {
      this.productsService.update(this.currentId, formData).subscribe({
        next: () => {
          this.toastService.show('Producto actualizado correctamente', 'success');
          this.closeModal();
          this.loadProducts();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          this.toastService.show('Error al actualizar el producto', 'error');
          this.isSubmitting = false;
        }
      });
    } else {
      this.productsService.create(formData).subscribe({
        next: () => {
          this.toastService.show('Producto creado correctamente', 'success');
          this.closeModal();
          this.loadProducts();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          this.toastService.show('Error al crear el producto', 'error');
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteProduct(id: number) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productsService.delete(id).subscribe({
        next: () => {
          this.toastService.show('Producto eliminado correctamente', 'success');
          this.loadProducts();
        },
        error: (err) => {
          console.error(err);
          this.toastService.show('Error al eliminar el producto', 'error');
        }
      });
    }
  }
}
