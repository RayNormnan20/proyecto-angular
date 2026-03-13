import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../core/services/cart.service';
import { OrderService } from '../../../../core/services/order.service';
import { PaymentMethodService, PaymentMethod } from '../../../../core/services/payment-method.service';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { SettingsService, Settings } from '../../../../core/services/settings.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 font-sans">
      <div class="container mx-auto px-4 max-w-5xl">
        
        <!-- Stepper -->
        <div class="mb-8">
          <div class="flex items-center justify-center">
            <div class="flex items-center">
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-bold shadow-sm text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span class="ml-2 font-medium text-gray-900 text-sm hidden sm:inline">Carrito</span>
            </div>
            <div class="w-12 h-0.5 bg-gray-200 mx-2 sm:mx-4 rounded-full"></div>
            <div class="flex items-center">
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold shadow-sm ring-4 ring-indigo-50 text-sm">
                2
              </div>
              <span class="ml-2 font-bold text-indigo-600 text-sm hidden sm:inline">Pago y Envío</span>
            </div>
            <div class="w-12 h-0.5 bg-gray-200 mx-2 sm:mx-4 rounded-full"></div>
            <div class="flex items-center">
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-500 font-bold text-sm">
                3
              </div>
              <span class="ml-2 font-medium text-gray-500 text-sm hidden sm:inline">Confirmación</span>
            </div>
          </div>
        </div>

        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Finalizar Compra</h1>
          <a routerLink="/cart" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al carrito
          </a>
        </div>

        <div class="flex flex-col lg:flex-row gap-8">
          
          <!-- Left Column: Forms -->
          <div class="lg:w-2/3 space-y-6">
            
            <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
              
              <!-- Step 1: Método de Entrega -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div class="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h2 class="text-lg font-semibold text-gray-800 flex items-center">
                    <span class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-3 text-sm font-bold shadow-sm">1</span>
                    Método de Entrega
                  </h2>
                </div>
                
                <div class="p-6 space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Opción Recojo en Tienda -->
                    <label class="relative border-2 rounded-xl p-4 cursor-pointer hover:border-indigo-200 transition-all duration-200 group"
                           [class.border-indigo-500]="deliveryMethod() === 'pickup'"
                           [class.bg-indigo-50]="deliveryMethod() === 'pickup'"
                           [class.border-gray-200]="deliveryMethod() !== 'pickup'">
                      <input type="radio" formControlName="metodo_entrega" value="pickup" class="sr-only">
                      <div class="flex items-center">
                        <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <span class="font-bold text-gray-900 block">Recojo en Tienda</span>
                          <span class="text-xs text-gray-500">Gratis - Sin costo de envío</span>
                        </div>
                      </div>
                      <div *ngIf="deliveryMethod() === 'pickup'" class="absolute top-4 right-4 text-indigo-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </label>

                    <!-- Opción Delivery -->
                    <label class="relative border-2 rounded-xl p-4 cursor-pointer hover:border-indigo-200 transition-all duration-200 group"
                           [class.border-indigo-500]="deliveryMethod() === 'delivery'"
                           [class.bg-indigo-50]="deliveryMethod() === 'delivery'"
                           [class.border-gray-200]="deliveryMethod() !== 'delivery'">
                      <input type="radio" formControlName="metodo_entrega" value="delivery" class="sr-only">
                      <div class="flex items-center">
                        <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        </div>
                        <div>
                          <span class="font-bold text-gray-900 block">Envío a Domicilio</span>
                          <span class="text-xs text-gray-500">Costo depende del distrito</span>
                        </div>
                      </div>
                      <div *ngIf="deliveryMethod() === 'delivery'" class="absolute top-4 right-4 text-indigo-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Step 2: Información de Envío (Solo para Delivery) -->
              <div *ngIf="deliveryMethod() === 'delivery'" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 animate-fade-in">
                <div class="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h2 class="text-lg font-semibold text-gray-800 flex items-center">
                    <span class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-3 text-sm font-bold shadow-sm">2</span>
                    Información de Envío
                  </h2>
                </div>
                
                <div class="p-6 space-y-6">
                  <!-- Distrito Selection -->
                  <div>
                    <label for="distrito" class="block text-sm font-medium text-gray-700 mb-2">Distrito</label>
                    <select id="distrito" formControlName="distrito" 
                            class="w-full pl-4 pr-10 py-3 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                            [class.border-red-300]="isFieldInvalid('distrito')">
                      <option value="" disabled selected>Selecciona tu distrito</option>
                      <option *ngFor="let item of shippingCosts()" [value]="item.district">
                        {{ item.district }} - S/ {{ item.cost | number:'1.2-2' }}
                      </option>
                    </select>
                    <p *ngIf="isFieldInvalid('distrito')" class="text-red-500 text-xs mt-1 ml-1">
                      Debes seleccionar un distrito.
                    </p>
                  </div>

                  <!-- Address -->
                  <div>
                    <label for="address" class="block text-sm font-medium text-gray-700 mb-2">Dirección Exacta</label>
                    <div class="relative">
                      <div class="absolute top-3 left-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <textarea id="address" formControlName="direccion_envio" rows="2" 
                                class="w-full pl-10 pr-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                placeholder="Ej: Av. Javier Prado Este 1234, Dpto 501"
                                [class.border-red-300]="isFieldInvalid('direccion_envio')"></textarea>
                    </div>
                    <p *ngIf="isFieldInvalid('direccion_envio')" class="text-red-500 text-xs mt-1 ml-1">
                      La dirección es obligatoria para el envío.
                    </p>
                  </div>

                  <!-- Notes -->
                  <div>
                    <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">Referencia / Notas (Opcional)</label>
                    <textarea id="notes" formControlName="notas" rows="2" 
                              class="w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                              placeholder="Referencia de ubicación, quién recibe, horario preferido..."></textarea>
                  </div>
                </div>
              </div>

              <!-- Step 3: Payment Method (Visible only if Delivery Method is selected) -->
              <div *ngIf="deliveryMethod()" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                <div class="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h2 class="text-lg font-semibold text-gray-800 flex items-center">
                    <span class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-3 text-sm font-bold shadow-sm">
                      {{ deliveryMethod() === 'delivery' ? '3' : '2' }}
                    </span>
                    Método de Pago
                  </h2>
                </div>
                
                <div class="p-6 space-y-4">
                  <!-- Dynamic Payment Methods -->
                  <div class="space-y-3">
                    <div *ngFor="let method of paymentMethods()" class="border rounded-xl overflow-hidden"
                         [class.border-indigo-500]="selectedPaymentMethod()?.id_metodo_pago === method.id_metodo_pago"
                         [class.border-gray-200]="selectedPaymentMethod()?.id_metodo_pago !== method.id_metodo_pago">
                      
                      <label class="flex items-center justify-between p-4 cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                        <div class="flex items-center">
                          <input type="radio" 
                                 name="paymentMethod"
                                 [checked]="selectedPaymentMethod()?.id_metodo_pago === method.id_metodo_pago"
                                 (change)="selectPaymentMethod(method)"
                                 class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300">
                          <span class="ml-3 font-bold text-gray-900">{{ method.nombre }}</span>
                        </div>
                        <!-- Icon based on method image or name -->
                        <div class="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-gray-50 border border-gray-100"
                             [ngClass]="{'p-0': method.imagen_url, 'p-2': !method.imagen_url}">
                             
                             <img *ngIf="method.imagen_url" [src]="getPaymentMethodImage(method)" [alt]="method.nombre" class="w-full h-full object-cover">
                             
                             <ng-container *ngIf="!method.imagen_url">
                               <!-- Yape Icon -->
                               <svg *ngIf="method.nombre.toLowerCase().includes('yape')" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 17h.01M8 11h16M12 17h.01M12 17h.01" />
                               </svg>
                               
                               <!-- Transfer Icon -->
                               <svg *ngIf="method.nombre.toLowerCase().includes('transferencia')" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                               </svg>

                               <!-- Cash/Other Icon -->
                               <svg *ngIf="!method.nombre.toLowerCase().includes('yape') && !method.nombre.toLowerCase().includes('transferencia')" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a1 1 0 11-2 0 1 1 0 012 0z" />
                               </svg>
                             </ng-container>
                        </div>
                      </label>

                      <!-- Method Details (Collapsible) -->
                      <div *ngIf="selectedPaymentMethod()?.id_metodo_pago === method.id_metodo_pago" class="p-4 bg-gray-50 border-t border-gray-100 animate-fade-in">
                        <div class="space-y-3">
                           <p class="text-gray-600 text-sm">{{ method.descripcion }}</p>
                           
                           <!-- Instructions -->
                           <div *ngIf="method.instrucciones" class="bg-white p-3 rounded border border-gray-200 text-sm text-gray-700 whitespace-pre-line">
                             {{ method.instrucciones }}
                           </div>

                           <!-- QR/Image for Payment Method -->
                           <div *ngIf="method.imagen_url" class="mt-4 flex justify-center">
                              <div class="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                                <img [src]="getPaymentMethodImage(method)" [alt]="method.nombre" class="w-48 h-48 object-contain">
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Transaction Code Input -->
                  <div class="mt-6 pt-6 border-t border-gray-200" *ngIf="selectedPaymentMethod()?.requiere_comprobante">
                    
                    <div class="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-4">
                      <div class="flex">
                        <div class="flex-shrink-0">
                          <svg class="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                          </svg>
                        </div>
                        <div class="ml-3">
                          <p class="text-sm text-indigo-700">
                            Realiza tu pago directamente en nuestra cuenta bancarias. Completa el pedido, y sube el comprobante de pago al finalizar el pedido. El producto no se enviará hasta que se verifique el comprobante de pago y el depósito en nuestras cuentas. Puede subir su comprobante en la parte inferior.
                          </p>
                        </div>
                      </div>
                    </div>

                    <label for="operation-code" class="block text-sm font-medium text-gray-900 mb-2">
                      Código de Operación / Nro. de Pedido (Opcional)
                    </label>
                    <input type="text" id="operation-code" formControlName="codigo_operacion" 
                           class="w-full pl-4 pr-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono tracking-wider"
                           placeholder="Ej: 12345678">
                    
                    <div class="mt-4">
                      <label class="block text-sm font-medium text-gray-900 mb-2">
                        Subir Comprobante (Imagen)
                        <span class="text-red-500">*</span>
                      </label>
                      <input type="file" (change)="onFileSelected($event)" accept="image/*" 
                             class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                             [class.border-red-300]="showFileError()">
                      <p *ngIf="showFileError()" class="text-red-500 text-xs mt-1 ml-1">
                        Debes subir una imagen del comprobante de pago.
                      </p>
                    </div>

                    <p class="text-xs text-gray-500 mt-2">
                      Ingresa el código que aparece en tu comprobante de pago.
                    </p>
                  </div>
                </div>
              </div>

            </form>
          </div>

          <!-- Right Column: Order Summary (Sticky) -->
          <div class="lg:w-1/3">
            <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h2 class="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Resumen del Pedido</h2>
              
              <!-- Mini Cart Items -->
              <div class="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                <div *ngFor="let item of cartService.cartItems()" class="flex gap-3">
                  <div class="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                     <img [src]="getProductImage(item.product)" alt="" class="w-full h-full object-cover">
                  </div>
                  <div class="flex-grow min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ item.product.nombre }}</p>
                    <p class="text-xs text-gray-500">Cant: {{ item.quantity }}</p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <p class="text-sm font-bold text-gray-900">S/ {{ (cartService.getItemPrice(item.product, item.quantity) * item.quantity) | number:'1.2-2' }}</p>
                  </div>
                </div>
              </div>

              <!-- Totals -->
              <div class="space-y-3 mb-6 pt-4 border-t border-gray-100">
                <div class="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>S/ {{ cartService.cartTotal() | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between text-gray-600 text-sm">
                  <span>Envío</span>
                  <span *ngIf="currentShippingCost() > 0">S/ {{ currentShippingCost() | number:'1.2-2' }}</span>
                  <span *ngIf="currentShippingCost() === 0 && deliveryMethod() === 'pickup'" class="text-green-600">Gratis (Recojo)</span>
                  <span *ngIf="currentShippingCost() === 0 && deliveryMethod() !== 'pickup'" class="text-gray-400">--</span>
                </div>
                <div class="flex justify-between items-end pt-4 border-t border-gray-100">
                  <span class="text-gray-900 font-bold text-lg">Total a Pagar</span>
                  <span class="text-2xl font-bold text-gray-900">S/ {{ totalToPay() | number:'1.2-2' }}</span>
                </div>
              </div>

              <!-- Submit Button -->
              <button (click)="onSubmit()" 
                      [disabled]="checkoutForm.invalid || isProcessing()"
                      class="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none flex justify-center items-center">
                <svg *ngIf="isProcessing()" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span *ngIf="!isProcessing()">Confirmar y Pagar</span>
                <span *ngIf="isProcessing()">Procesando...</span>
              </button>
              
              <div class="mt-4 flex items-center justify-center text-xs text-gray-500 gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Pago 100% Seguro
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  cartService = inject(CartService);
  orderService = inject(OrderService);
  paymentMethodService = inject(PaymentMethodService);
  authService = inject(AuthService);
  settingsService = inject(SettingsService);
  router = inject(Router);
  fb = inject(FormBuilder);

  isProcessing = signal(false);
  settings = signal<Settings | null>(null);
  
  paymentMethods = signal<PaymentMethod[]>([]);
  selectedPaymentMethod = signal<PaymentMethod | null>(null);
  
  selectedFile: File | null = null;
  showFileError = signal(false);
  
  // Shipping logic
  shippingCosts = signal<{district: string, cost: number}[]>([]);
  currentShippingCost = signal(0);
  deliveryMethod = signal<'pickup' | 'delivery' | null>(null);

  // Total computed
  totalToPay = computed(() => this.cartService.cartTotal() + this.currentShippingCost());

  checkoutForm: FormGroup = this.fb.group({
    metodo_entrega: ['', Validators.required],
    distrito: [''],
    direccion_envio: [''],
    metodo_pago_id: [null, Validators.required],
    codigo_operacion: [''], // Removed required initially
    notas: ['']
  });

  ngOnInit() {
    this.loadPaymentMethods();

    // Check authentication first
    if (!this.authService.currentUser()) {
      // Save current URL for redirect after login
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    // Redirect if cart is empty
    if (this.cartService.cartItems().length === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    // Subscribe to form changes
    this.checkoutForm.get('metodo_entrega')?.valueChanges.subscribe(method => {
      this.deliveryMethod.set(method);
      this.updateValidators(method);
      this.calculateShipping();
    });

    this.checkoutForm.get('distrito')?.valueChanges.subscribe(() => {
      this.calculateShipping();
    });

    // Load settings
    this.settingsService.getSettings().subscribe({
      next: (data) => {
        this.settings.set(data);
        if (data['shipping_costs']) {
          try {
            this.shippingCosts.set(JSON.parse(data['shipping_costs']));
          } catch (e) {
            console.error('Error parsing shipping costs', e);
          }
        }
      },
      error: (err) => console.error('Error loading settings', err)
    });
  }

  loadPaymentMethods() {
    this.paymentMethodService.getAll().subscribe({
      next: (methods) => {
        this.paymentMethods.set(methods.filter(m => m.activo));
      },
      error: (err) => console.error('Error loading payment methods', err)
    });
  }

  updateValidators(method: string) {
    const addressControl = this.checkoutForm.get('direccion_envio');
    const districtControl = this.checkoutForm.get('distrito');

    if (method === 'delivery') {
      addressControl?.setValidators([Validators.required, Validators.minLength(5)]);
      districtControl?.setValidators([Validators.required]);
    } else {
      addressControl?.clearValidators();
      districtControl?.clearValidators();
    }
    addressControl?.updateValueAndValidity();
    districtControl?.updateValueAndValidity();
  }

  calculateShipping() {
    const method = this.checkoutForm.get('metodo_entrega')?.value;
    if (method === 'pickup') {
      this.currentShippingCost.set(0);
      return;
    }
    
    const districtName = this.checkoutForm.get('distrito')?.value;
    const district = this.shippingCosts().find(d => d.district === districtName);
    this.currentShippingCost.set(district ? Number(district.cost) : 0);
  }

  selectPaymentMethod(method: PaymentMethod) {
    this.checkoutForm.patchValue({ metodo_pago_id: method.id_metodo_pago });
    this.selectedPaymentMethod.set(method);

    // Operation code is now optional for all methods
    const codeControl = this.checkoutForm.get('codigo_operacion');
    codeControl?.clearValidators();
    codeControl?.updateValueAndValidity();
    
    // Reset file
    this.selectedFile = null;
    this.showFileError.set(false);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.showFileError.set(false);
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.checkoutForm.get(field);
    return !!(control && control.touched && control.invalid);
  }

  // Base64 SVG Placeholder
  private readonly PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzk0YTMiOCIgZm9udC1zaXplPSIyMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGR5PSIuM2VtIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NoSBJbWFnZTwvdGV4dD48L3N2Zz4=';

  getPaymentMethodImage(method: PaymentMethod): string {
    if (method.imagen_url) {
      if (method.imagen_url.startsWith('http')) {
        return method.imagen_url;
      }
      const baseUrl = environment.imageBaseUrl;
      const imageUrl = method.imagen_url.startsWith('/') ? method.imagen_url : `/${method.imagen_url}`;
      return `${baseUrl}${imageUrl}`;
    }
    return '';
  }
  
  getProductImage(product: any): string {
    if (product.images && product.images.length > 0) {
      const url = product.images[0].url;
      if (url.startsWith('http')) return url;
      
      const baseUrl = environment.imageBaseUrl;
      // Ensure the image URL starts with a slash if needed
      const imageUrl = url.startsWith('/') ? url : `/${url}`;
      return `${baseUrl}${imageUrl}`;
    }
    return this.PLACEHOLDER_IMAGE;
  }

  onSubmit() {
    // Validate file upload if required
    if (this.selectedPaymentMethod()?.requiere_comprobante && !this.selectedFile) {
      this.showFileError.set(true);
      // Mark other fields as touched so they show errors too
      this.checkoutForm.markAllAsTouched();
      return;
    }

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    if (!this.authService.currentUser()) {
      // Redirect to login with return url
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    this.isProcessing.set(true);

    // Prepare order data with current costs
    let shippingAddress = this.checkoutForm.value.direccion_envio || '';
    if (this.checkoutForm.value.metodo_entrega === 'delivery') {
      const district = this.checkoutForm.value.distrito;
      if (district) {
        shippingAddress = `${district}, ${shippingAddress}`;
      }
    }

    const orderData = {
      items: this.cartService.cartItems().map(item => ({
        id_producto: item.product.id_producto,
        cantidad: item.quantity
      })),
      ...this.checkoutForm.value,
      direccion_envio: shippingAddress,
      costo_envio: this.currentShippingCost(), // Send shipping cost to backend if needed
      total: this.totalToPay()
    };

    // Convert to FormData for file upload
    const formData = new FormData();
    formData.append('items', JSON.stringify(orderData.items));
    formData.append('metodo_entrega', orderData.metodo_entrega || '');
    if (orderData.distrito) formData.append('distrito', orderData.distrito);
    if (orderData.direccion_envio) formData.append('direccion_envio', orderData.direccion_envio);
    formData.append('metodo_pago_id', String(orderData.metodo_pago_id));
    if (orderData.codigo_operacion) formData.append('codigo_operacion', orderData.codigo_operacion);
    if (orderData.notas) formData.append('notas', orderData.notas);
    if (this.selectedFile) {
      formData.append('comprobante_pago', this.selectedFile);
    }

    this.orderService.createOrder(formData).subscribe({
      next: (order) => {
        this.cartService.clearCart();
        this.isProcessing.set(false);
        // Navigate to profile or success page
        this.router.navigate(['/profile']); // Or a dedicated success page
      },
      error: (err) => {
        console.error('Error creating order', err);
        this.isProcessing.set(false);
        alert('Hubo un error al procesar tu pedido. Por favor intenta nuevamente.');
      }
    });
  }
}
