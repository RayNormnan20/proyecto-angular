import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../core/services/cart.service';
import { OrderService } from '../../../../core/services/order.service';
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
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold shadow-sm ring-4 ring-blue-50 text-sm">
                2
              </div>
              <span class="ml-2 font-bold text-blue-600 text-sm hidden sm:inline">Pago y Envío</span>
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
          <a routerLink="/cart" class="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors">
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
                    <span class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 text-sm font-bold shadow-sm">1</span>
                    Método de Entrega
                  </h2>
                </div>
                
                <div class="p-6 space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Opción Recojo en Tienda -->
                    <label class="relative border-2 rounded-xl p-4 cursor-pointer hover:border-blue-200 transition-all duration-200 group"
                           [class.border-blue-500]="deliveryMethod() === 'pickup'"
                           [class.bg-blue-50]="deliveryMethod() === 'pickup'"
                           [class.border-gray-200]="deliveryMethod() !== 'pickup'">
                      <input type="radio" formControlName="metodo_entrega" value="pickup" class="sr-only">
                      <div class="flex items-center">
                        <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <span class="font-bold text-gray-900 block">Recojo en Tienda</span>
                          <span class="text-xs text-gray-500">Gratis - Sin costo de envío</span>
                        </div>
                      </div>
                      <div *ngIf="deliveryMethod() === 'pickup'" class="absolute top-4 right-4 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </label>

                    <!-- Opción Delivery -->
                    <label class="relative border-2 rounded-xl p-4 cursor-pointer hover:border-blue-200 transition-all duration-200 group"
                           [class.border-blue-500]="deliveryMethod() === 'delivery'"
                           [class.bg-blue-50]="deliveryMethod() === 'delivery'"
                           [class.border-gray-200]="deliveryMethod() !== 'delivery'">
                      <input type="radio" formControlName="metodo_entrega" value="delivery" class="sr-only">
                      <div class="flex items-center">
                        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        </div>
                        <div>
                          <span class="font-bold text-gray-900 block">Envío a Domicilio</span>
                          <span class="text-xs text-gray-500">Costo depende del distrito</span>
                        </div>
                      </div>
                      <div *ngIf="deliveryMethod() === 'delivery'" class="absolute top-4 right-4 text-blue-500">
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
                    <span class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 text-sm font-bold shadow-sm">2</span>
                    Información de Envío
                  </h2>
                </div>
                
                <div class="p-6 space-y-6">
                  <!-- Distrito Selection -->
                  <div>
                    <label for="distrito" class="block text-sm font-medium text-gray-700 mb-2">Distrito</label>
                    <select id="distrito" formControlName="distrito" 
                            class="w-full pl-4 pr-10 py-3 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
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
                                class="w-full pl-10 pr-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
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
                              class="w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                              placeholder="Referencia de ubicación, quién recibe, horario preferido..."></textarea>
                  </div>
                </div>
              </div>

              <!-- Step 3: Payment Method (Visible only if Delivery Method is selected) -->
              <div *ngIf="deliveryMethod()" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                <div class="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h2 class="text-lg font-semibold text-gray-800 flex items-center">
                    <span class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 text-sm font-bold shadow-sm">
                      {{ deliveryMethod() === 'delivery' ? '3' : '2' }}
                    </span>
                    Método de Pago
                  </h2>
                </div>
                
                <div class="p-6 space-y-4">
                  <!-- Accordion Style Payment Methods -->
                  <div class="space-y-3">
                    
                    <!-- Yape Option -->
                    <div class="border rounded-xl overflow-hidden" 
                         [class.border-blue-500]="paymentMethod === 'yape'"
                         [class.border-gray-200]="paymentMethod !== 'yape'">
                      <label class="flex items-center justify-between p-4 cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                        <div class="flex items-center">
                          <input type="radio" formControlName="metodo_pago" value="yape" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" (change)="onPaymentMethodChange('yape')">
                          <span class="ml-3 font-bold text-gray-900">Yape / Plin</span>
                        </div>
                        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 17h.01M8 11h16M12 17h.01M12 17h.01" />
                          </svg>
                        </div>
                      </label>
                      
                      <!-- Yape Details (Collapsible) -->
                      <div *ngIf="paymentMethod === 'yape'" class="p-4 bg-blue-50 border-t border-blue-100 animate-fade-in">
                        <div class="flex flex-col sm:flex-row items-center gap-6">
                          <div class="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex-shrink-0">
                            <div class="w-32 h-32 flex items-center justify-center relative overflow-hidden bg-white">
                               <img *ngIf="getQrUrl()" [src]="getQrUrl()" alt="QR Yape" class="w-full h-full object-contain">
                               <div *ngIf="!getQrUrl()" class="text-center p-2">
                                 <span class="block text-gray-400 text-xs mb-1">QR no configurado</span>
                               </div>
                            </div>
                          </div>
                          <div class="text-center sm:text-left flex-grow">
                            <p class="text-gray-600 text-sm mb-1">Nombre: <span class="font-semibold text-gray-900">{{ settings()?.['yape_nombre'] || 'Mi Tienda S.A.C.' }}</span></p>
                            <p class="text-gray-600 text-sm">Número: <span class="font-semibold text-gray-900">{{ settings()?.['yape_numero'] || '999 999 999' }}</span></p>
                            <div class="mt-2 text-xs text-blue-600 bg-white px-2 py-1 rounded border border-blue-100 inline-block">
                              Escanea y guarda el comprobante
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Transferencia Option -->
                    <div class="border rounded-xl overflow-hidden" 
                         [class.border-blue-500]="paymentMethod === 'transferencia'"
                         [class.border-gray-200]="paymentMethod !== 'transferencia'">
                      <label class="flex items-center justify-between p-4 cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                        <div class="flex items-center">
                          <input type="radio" formControlName="metodo_pago" value="transferencia" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" (change)="onPaymentMethodChange('transferencia')">
                          <span class="ml-3 font-bold text-gray-900">Transferencia Bancaria</span>
                        </div>
                        <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                          </svg>
                        </div>
                      </label>

                      <!-- Transferencia Details (Collapsible) -->
                      <div *ngIf="paymentMethod === 'transferencia'" class="p-4 bg-green-50 border-t border-green-100 animate-fade-in">
                        <div class="space-y-3">
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="bg-white p-3 rounded border border-gray-200">
                              <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Banco</p>
                              <p class="font-bold text-gray-900">{{ settings()?.['transfer_banco'] || 'BCP' }}</p>
                            </div>
                            <div class="bg-white p-3 rounded border border-gray-200">
                              <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Titular</p>
                              <p class="font-bold text-gray-900 text-sm truncate">{{ settings()?.['transfer_titular'] || 'Mi Tienda S.A.C.' }}</p>
                            </div>
                          </div>
                          <div class="bg-white p-3 rounded border border-gray-200">
                            <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Número de Cuenta</p>
                            <p class="font-mono font-bold text-gray-900 tracking-wide">{{ settings()?.['transfer_numero'] || '191-12345678-0-01' }}</p>
                          </div>
                          <div class="bg-white p-3 rounded border border-gray-200">
                            <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">CCI</p>
                            <p class="font-mono font-bold text-gray-900 tracking-wide">{{ settings()?.['transfer_cci'] || '002-191-12345678-0-01' }}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  <!-- Transaction Code Input -->
                  <div class="mt-6 pt-6 border-t border-gray-200">
                    <label for="operation-code" class="block text-sm font-medium text-gray-900 mb-2">
                      Código de Operación / Nro. de Pedido
                      <span class="text-red-500">*</span>
                    </label>
                    <input type="text" id="operation-code" formControlName="codigo_operacion" 
                           class="w-full pl-4 pr-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono tracking-wider"
                           placeholder="Ej: 12345678"
                           [class.border-red-300]="isFieldInvalid('codigo_operacion')">
                    <p class="text-xs text-gray-500 mt-2">
                      Ingresa el código que aparece en tu comprobante de pago.
                    </p>
                    <p *ngIf="isFieldInvalid('codigo_operacion')" class="text-red-500 text-xs mt-1 ml-1">
                      Este campo es requerido.
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
                    <p class="text-sm font-bold text-gray-900">S/ {{ (item.product.precio * item.quantity) | number:'1.2-2' }}</p>
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
                      class="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none flex justify-center items-center">
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
  authService = inject(AuthService);
  settingsService = inject(SettingsService);
  router = inject(Router);
  fb = inject(FormBuilder);

  isProcessing = signal(false);
  settings = signal<Settings | null>(null);
  
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
    metodo_pago: ['yape', Validators.required],
    codigo_operacion: ['', [Validators.required, Validators.minLength(4)]],
    notas: ['']
  });

  ngOnInit() {
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

  get paymentMethod() {
    return this.checkoutForm.get('metodo_pago')?.value;
  }

  onPaymentMethodChange(method: string) {
    this.checkoutForm.patchValue({ metodo_pago: method });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.checkoutForm.get(field);
    return !!(control && control.touched && control.invalid);
  }

  // Base64 SVG Placeholder
  private readonly PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzk0YTMiOCIgZm9udC1zaXplPSIyMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGR5PSIuM2VtIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NoSBJbWFnZTwvdGV4dD48L3N2Zz4=';

  getQrUrl(): string {
    const qrPath = this.settings()?.['yape_qr'];
    if (qrPath) {
      // Remove '/api' from the end of apiUrl if present to get the base URL
      const baseUrl = environment.apiUrl.replace(/\/api$/, '');
      // Ensure the image URL starts with a slash if needed
      const imageUrl = qrPath.startsWith('/') ? qrPath : `/${qrPath}`;
      return `${baseUrl}${imageUrl}`;
    }
    return '';
  }
  
  getProductImage(product: any): string {
    if (product.images && product.images.length > 0) {
      // Remove '/api' from the end of apiUrl if present to get the base URL
      const baseUrl = environment.apiUrl.replace(/\/api$/, '');
      // Ensure the image URL starts with a slash if needed
      const imageUrl = product.images[0].url.startsWith('/') ? product.images[0].url : `/${product.images[0].url}`;
      return `${baseUrl}${imageUrl}`;
    }
    return this.PLACEHOLDER_IMAGE;
  }

  onSubmit() {
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
    const orderData = {
      items: this.cartService.cartItems().map(item => ({
        id_producto: item.product.id_producto,
        cantidad: item.quantity
      })),
      ...this.checkoutForm.value,
      costo_envio: this.currentShippingCost(), // Send shipping cost to backend if needed
      total: this.totalToPay()
    };

    this.orderService.createOrder(orderData).subscribe({
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
