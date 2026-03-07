import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile Overlay -->
    <div 
      *ngIf="isOpen" 
      (click)="close.emit()"
      class="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
    ></div>

    <!-- Sidebar -->
    <div 
      [class.translate-x-0]="isOpen"
      [class.-translate-x-full]="!isOpen"
      class="fixed inset-y-0 left-0 z-30 w-64 transform bg-[#1a1c23] text-white transition duration-300 ease-in-out lg:static lg:translate-x-0 lg:inset-y-0 lg:h-full flex flex-col shadow-2xl font-sans h-full"
    >
      <!-- Logo Area -->
      <div class="flex items-center justify-between h-16 px-6 bg-[#1a1c23] border-b border-gray-800 shrink-0">
        <div class="flex items-center space-x-2">
            <!-- Orange Icon like reference -->
            <div class="text-orange-500">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
            </div>
            <h1 class="text-xl font-bold tracking-wide text-white">Empresa App</h1>
        </div>
        <button (click)="close.emit()" class="lg:hidden text-gray-400 hover:text-white focus:outline-none transition-colors">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <nav class="flex-1 overflow-y-auto px-4 pb-4 space-y-1 mt-6">
        
        <a 
            routerLink="/dashboard" 
            routerLinkActive="bg-[#252830] text-white border-l-4 border-orange-500" 
            [routerLinkActiveOptions]="{exact: true}" 
            (click)="close.emit()"
            class="flex items-center px-4 py-3 text-gray-400 hover:bg-[#252830] hover:text-white transition-all duration-200 group rounded-r-md"
        >
            <span class="mr-3 w-6 text-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            </span> 
            <span class="font-medium text-sm">Inicio</span>
        </a>

        <!-- Pedidos -->
        <a 
            routerLink="/dashboard/orders" 
            routerLinkActive="bg-[#252830] text-white border-l-4 border-orange-500" 
            (click)="close.emit()"
            class="flex items-center px-4 py-3 text-gray-400 hover:bg-[#252830] hover:text-white transition-all duration-200 group rounded-r-md"
        >
            <span class="mr-3 w-6 text-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </span> 
            <span class="font-medium text-sm">Pedidos</span>
        </a>

        <!-- Configuración (Desplegable) -->
        <ng-container *ngIf="authService.hasRole('admin') || authService.hasPermission('VER_CONFIGURACION') || authService.hasPermission('VER_ENVIOS')">
            <!-- Botón Padre -->
            <button 
                (click)="toggleSettingsMenu()"
                class="w-full flex items-center justify-between px-4 py-3 text-gray-400 hover:bg-[#252830] hover:text-white transition-all duration-200 group rounded-r-md focus:outline-none"
                [class.text-white]="isSettingsMenuOpen()"
                [class.bg-[#252830]]="isSettingsMenuOpen()"
            >
                <div class="flex items-center">
                    <span class="mr-3 w-6 text-center">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </span> 
                    <span class="font-medium text-sm">Configuración</span>
                </div>
                <svg 
                    class="w-4 h-4 transition-transform duration-200" 
                    [class.rotate-180]="isSettingsMenuOpen()"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <!-- Submenú -->
            <div 
                *ngIf="isSettingsMenuOpen()" 
                class="bg-[#15171e] overflow-hidden transition-all duration-300"
            >
                <a 
                    *ngIf="authService.hasRole('admin') || authService.hasPermission('GESTIONAR_CONFIGURACION')"
                    routerLink="/dashboard/payment-settings" 
                    routerLinkActive="text-white border-l-4 border-orange-500 bg-[#252830]"
                    (click)="close.emit()"
                    class="flex items-center pl-12 pr-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#252830] transition-colors border-l-4 border-transparent"
                >
                    <span class="mr-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                    </span>
                    Métodos de Pago
                </a>

                <a 
                    *ngIf="authService.hasRole('admin') || authService.hasPermission('VER_ENVIOS')"
                    routerLink="/dashboard/shipping-settings" 
                    routerLinkActive="text-white border-l-4 border-orange-500 bg-[#252830]"
                    (click)="close.emit()"
                    class="flex items-center pl-12 pr-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#252830] transition-colors border-l-4 border-transparent"
                >
                    <span class="mr-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 10-4 0 2 2 0 004 0zm10 0a2 2 0 10-4 0 2 2 0 004 0z" /></svg>
                    </span>
                    Costo Envíos
                </a>
            </div>
        </ng-container>

        <!-- Módulo de Productos (Desplegable) -->
        <ng-container *ngIf="authService.hasPermission('VER_PRODUCTOS') || authService.hasPermission('VER_CATEGORIAS') || authService.hasPermission('VER_MARCAS')">

            <!-- Botón Padre -->
            <button 
                (click)="toggleProductsMenu()"
                class="w-full flex items-center justify-between px-4 py-3 text-gray-400 hover:bg-[#252830] hover:text-white transition-all duration-200 group rounded-r-md focus:outline-none"
                [class.text-white]="isProductsMenuOpen()"
                [class.bg-[#252830]]="isProductsMenuOpen()"
            >
                <div class="flex items-center">
                    <span class="mr-3 w-6 text-center">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                    </span> 
                    <span class="font-medium text-sm">Productos</span>
                </div>
                <svg 
                    class="w-4 h-4 transition-transform duration-200" 
                    [class.rotate-180]="isProductsMenuOpen()"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <!-- Submenú -->
            <div 
                *ngIf="isProductsMenuOpen()" 
                class="bg-[#15171e] overflow-hidden transition-all duration-300"
            >
                <a 
                    *ngIf="authService.hasPermission('VER_PRODUCTOS')"
                    routerLink="/dashboard/products" 
                    routerLinkActive="text-white border-l-4 border-orange-500 bg-[#252830]"
                    (click)="close.emit()"
                    class="flex items-center pl-12 pr-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#252830] transition-colors border-l-4 border-transparent"
                >
                    <span class="mr-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                    </span>
                    Listado
                </a>

                <a 
                    *ngIf="authService.hasPermission('VER_CATEGORIAS')"
                    routerLink="/dashboard/categories" 
                    routerLinkActive="text-white border-l-4 border-orange-500 bg-[#252830]"
                    (click)="close.emit()"
                    class="flex items-center pl-12 pr-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#252830] transition-colors border-l-4 border-transparent"
                >
                    <span class="mr-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                    </span>
                    Categorías
                </a>

                <a 
                    *ngIf="authService.hasPermission('VER_MARCAS')"
                    routerLink="/dashboard/brands" 
                    routerLinkActive="text-white border-l-4 border-orange-500 bg-[#252830]"
                    (click)="close.emit()"
                    class="flex items-center pl-12 pr-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#252830] transition-colors border-l-4 border-transparent"
                >
                    <span class="mr-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </span>
                    Marcas
                </a>
            </div>
        </ng-container>

        
        
        <!-- Módulo de Administración (Desplegable) -->
        <ng-container *ngIf="authService.hasPermission('VER_USUARIOS') || authService.hasPermission('VER_ROLES')">

            <!-- Botón Padre -->
            <button 
                (click)="toggleAdminMenu()"
                class="w-full flex items-center justify-between px-4 py-3 text-gray-400 hover:bg-[#252830] hover:text-white transition-all duration-200 group rounded-r-md focus:outline-none"
                [class.text-white]="isAdminMenuOpen()"
                [class.bg-[#252830]]="isAdminMenuOpen()"
            >
                <div class="flex items-center">
                    <span class="mr-3 w-6 text-center">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    </span> 
                    <span class="font-medium text-sm">Administración</span>
                </div>
                <svg 
                    class="w-4 h-4 transition-transform duration-200" 
                    [class.rotate-180]="isAdminMenuOpen()"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <!-- Submenú -->
            <div 
                *ngIf="isAdminMenuOpen()" 
                class="bg-[#15171e] overflow-hidden transition-all duration-300"
            >
                <a 
                    *ngIf="authService.hasPermission('VER_USUARIOS')"
                    routerLink="/dashboard/users" 
                    routerLinkActive="text-white border-l-4 border-orange-500 bg-[#252830]"
                    (click)="close.emit()"
                    class="flex items-center pl-12 pr-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#252830] transition-colors border-l-4 border-transparent"
                >
                    <span class="mr-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    </span>
                    Usuarios
                </a>
                
                <a 
                    *ngIf="authService.hasPermission('VER_ROLES')"
                    routerLink="/dashboard/roles" 
                    routerLinkActive="text-white border-l-4 border-orange-500 bg-[#252830]"
                    (click)="close.emit()"
                    class="flex items-center pl-12 pr-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#252830] transition-colors border-l-4 border-transparent"
                >
                    <span class="mr-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                    </span>
                    Roles y Permisos
                </a>
            </div>
        </ng-container>
      </nav>
    </div>
  `
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  authService = inject(AuthService);
  
  activeMenu = signal<string | null>(null);

  toggleMenu(menuName: string) {
    this.activeMenu.update(current => current === menuName ? null : menuName);
  }

  isSettingsMenuOpen() {
    return this.activeMenu() === 'settings';
  }

  isProductsMenuOpen() {
    return this.activeMenu() === 'products';
  }

  isAdminMenuOpen() {
    return this.activeMenu() === 'admin';
  }

  toggleProductsMenu() {
    this.toggleMenu('products');
  }

  toggleAdminMenu() {
    this.toggleMenu('admin');
  }

  toggleSettingsMenu() {
    this.toggleMenu('settings');
  }
}
