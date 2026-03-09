import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../core/services/cart.service';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { Product } from '../../../products/models/product.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 sm:py-12 font-sans">
      <div class="container mx-auto px-3 sm:px-4 max-w-6xl">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Carrito de Compras
        </h1>

        <!-- Empty State -->
        <div *ngIf="cartService.cartItems().length === 0" class="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
          <div class="bg-indigo-50 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 sm:h-12 sm:w-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
          <p class="text-gray-500 text-base sm:text-lg mb-8 max-w-md mx-auto px-4">Parece que aún no has añadido ningún producto. ¡Explora nuestro catálogo y encuentra lo que buscas!</p>
          <a routerLink="/products" class="inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg shadow-indigo-200 text-sm sm:text-base">
            Explorar Productos
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </a>
        </div>

        <!-- Cart Content -->
        <div *ngIf="cartService.cartItems().length > 0" class="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          <!-- Left Column: Product List -->
          <div class="lg:w-2/3">
            <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden mb-6 border border-gray-100">
              <div class="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 class="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span class="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{{ cartService.cartCount() }}</span>
                  Productos en tu carro
                </h2>
                <span class="text-xs sm:text-sm text-gray-500 hidden sm:block">Vendido y enviado por <span class="font-medium text-gray-900">Mi Tienda</span></span>
              </div>
              
              <ul class="divide-y divide-gray-100">
                <li *ngFor="let item of cartService.cartItems()" class="p-4 sm:p-6 transition-colors hover:bg-gray-50/30">
                  <div class="flex flex-row items-start gap-4 sm:gap-6">
                    <!-- Image -->
                    <div class="w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-lg sm:rounded-xl flex-shrink-0 overflow-hidden border border-gray-200 shadow-sm relative group">
                      <img [src]="getProductImage(item.product)" 
                           (error)="handleImageError($event)"
                           alt="{{ item.product.nombre }}" 
                           class="w-full h-full object-contain p-1 sm:p-2 transition-transform duration-300 group-hover:scale-110">
                    </div>
                    
                    <!-- Details -->
                    <div class="flex-grow w-full flex flex-col justify-between min-h-[5rem] sm:min-h-[7rem]">
                      <!-- Top Row: Title + Price -->
                      <div class="flex justify-between items-start gap-2 mb-2">
                        <div class="flex-1 min-w-0 pr-2">
                          <h3 class="text-base sm:text-lg font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                            <a [routerLink]="['/product', item.product.id_producto]" class="hover:text-indigo-600 transition-colors">
                              {{ item.product.nombre }}
                            </a>
                          </h3>
                          <p class="text-xs sm:text-sm text-gray-500 mb-1 truncate">Marca: <span class="font-medium text-gray-700">{{ item.product.brand?.nombre || 'Genérico' }}</span></p>
                          <div class="flex items-center gap-2 mb-1">
                            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium" 
                                  [ngClass]="item.product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                              {{ item.product.stock > 0 ? 'Disponible' : 'Agotado' }}
                            </span>
                            <span *ngIf="item.product.stock > 0 && item.product.stock < 5" class="hidden sm:inline text-xs text-orange-600 font-medium">
                              ¡Quedan pocos!
                            </span>
                          </div>
                        </div>
                        
                        <div class="text-right flex-shrink-0">
                           <p class="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">S/ {{ item.product.precio | number:'1.2-2' }}</p>
                           <p class="text-xs sm:text-sm text-gray-400 line-through" *ngIf="item.product.precio < 1000">S/ {{ (item.product.precio * 1.2) | number:'1.2-2' }}</p>
                        </div>
                      </div>

                      <!-- Bottom Row: Controls -->
                      <div class="flex justify-between items-center mt-auto gap-2 pt-2">
                         <!-- Quantity Controls -->
                         <div class="flex items-center border border-gray-200 rounded-lg bg-white shadow-sm h-8 sm:h-9">
                          <button (click)="decreaseQuantity(item.product.id_producto!, item.quantity)" 
                                  class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-l-lg focus:outline-none disabled:opacity-30 transition-colors"
                                  [disabled]="item.quantity <= 1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                            </svg>
                          </button>
                          <div class="w-8 sm:w-10 text-center font-semibold text-gray-900 text-xs sm:text-sm border-x border-gray-200 py-1 bg-gray-50 flex items-center justify-center">
                            {{ item.quantity }}
                          </div>
                          <button (click)="increaseQuantity(item.product.id_producto!, item.quantity, item.product.stock)" 
                                  class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-r-lg focus:outline-none disabled:opacity-30 transition-colors"
                                  [disabled]="item.quantity >= item.product.stock">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center gap-3">
                          <button (click)="removeItem(item.product.id_producto!)" 
                                  class="inline-flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 group"
                                  title="Eliminar del carrito">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span class="hidden sm:inline ml-2 text-sm font-medium">Eliminar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <!-- Right Column: Summary -->
          <div class="lg:w-1/3">
            <div class="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 sticky top-24">
              <h2 class="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 pb-4 border-b border-gray-100">Resumen de la orden</h2>
              
              <div class="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div class="flex justify-between text-gray-600 text-sm">
                  <span>Productos ({{ cartService.cartCount() }})</span>
                  <span class="font-medium text-gray-900">S/ {{ cartService.cartTotal() | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between text-gray-600 text-sm">
                  <span>Descuentos</span>
                  <span class="text-green-600 font-medium">- S/ 0.00</span>
                </div>
                <div class="flex justify-between text-gray-600 text-sm">
                  <span>Envío</span>
                  <span class="text-green-600 font-medium">Por calcular</span>
                </div>
              </div>

              <div class="border-t border-gray-100 pt-4 mb-6 sm:mb-8">
                <div class="flex justify-between items-end">
                  <span class="text-gray-800 font-bold text-base sm:text-lg">Total</span>
                  <div class="text-right">
                    <span class="text-2xl sm:text-3xl font-extrabold text-gray-900">S/ {{ cartService.cartTotal() | number:'1.2-2' }}</span>
                    <p class="text-xs text-gray-500 mt-1">Incluye IGV</p>
                  </div>
                </div>
              </div>

              <button routerLink="/checkout" class="w-full bg-indigo-600 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-indigo-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group">
                <span>Ir a Pagar</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <div class="mt-6 flex items-center justify-center gap-2 text-gray-500 text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>Pago 100% Seguro y Encriptado</span>
              </div>
              
              <div class="mt-6 text-center">
                 <a routerLink="/products" class="text-sm text-indigo-600 hover:text-indigo-800 hover:underline font-medium transition-colors">Continuar comprando</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CartComponent {
  cartService = inject(CartService);

  // Base64 SVG Placeholder
  private readonly PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzk0YTMiOCIgZm9udC1zaXplPSIyMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGR5PSIuM2VtIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NoSBJbWFnZTwvdGV4dD48L3N2Zz4=';

  getProductImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      const url = product.images[0].url;
      if (url.startsWith('http')) return url;
      const baseUrl = environment.imageBaseUrl;
      return `${baseUrl}${url}`;
    }
    return this.PLACEHOLDER_IMAGE;
  }

  increaseQuantity(productId: number, currentQuantity: number, stock: number) {
    if (currentQuantity < stock) {
      this.cartService.updateQuantity(productId, currentQuantity + 1);
    }
  }

  decreaseQuantity(productId: number, currentQuantity: number) {
    if (currentQuantity > 1) {
      this.cartService.updateQuantity(productId, currentQuantity - 1);
    }
  }

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  handleImageError(event: any) {
    if (event.target.src !== this.PLACEHOLDER_IMAGE) {
      event.target.src = this.PLACEHOLDER_IMAGE;
    }
  }
}
