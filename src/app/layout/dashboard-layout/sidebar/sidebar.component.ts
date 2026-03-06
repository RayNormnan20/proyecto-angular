import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
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
      
      <!-- User Profile Section (Top) -->
      <div class="p-6 bg-[#1a1c23]">
        <div class="flex items-center space-x-3 mb-4">
           <div class="shrink-0 h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold border-2 border-gray-600">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
             </svg>
           </div>
           <div class="overflow-hidden">
             <p class="text-sm font-semibold text-white truncate">{{ authService.currentUser()?.nombre || 'Usuario' }}</p>
             <p class="text-xs text-gray-400 truncate">{{ authService.currentUser()?.role || 'Rol' }}</p>
           </div>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
        
        <a 
            routerLink="/dashboard" 
            routerLinkActive="bg-[#252830] text-white border-l-4 border-orange-500" 
            [routerLinkActiveOptions]="{exact: true}" 
            (click)="close.emit()"
            class="flex items-center px-4 py-3 text-gray-400 hover:bg-[#252830] hover:text-white transition-all duration-200 group rounded-r-md"
        >
            <span class="text-lg mr-3 w-6 text-center">🏠</span> 
            <span class="font-medium text-sm">Inicio</span>
        </a>

        <!-- Módulo de Productos (Desplegable) -->
        <ng-container *ngIf="authService.hasPermission('VER_PRODUCTOS') || authService.hasPermission('VER_CATEGORIAS') || authService.hasPermission('VER_MARCAS')">

            <!-- Botón Padre -->
            <button 
                (click)="toggleProductsMenu()"
                class="w-full flex items-center justify-between px-4 py-3 text-gray-400 hover:bg-[#252830] hover:text-white transition-all duration-200 group rounded-r-md focus:outline-none"
                [class.text-white]="isProductsMenuOpen"
                [class.bg-[#252830]]="isProductsMenuOpen"
            >
                <div class="flex items-center">
                    <span class="text-lg mr-3 w-6 text-center">📦</span> 
                    <span class="font-medium text-sm">Productos</span>
                </div>
                <svg 
                    class="w-4 h-4 transition-transform duration-200" 
                    [class.rotate-180]="isProductsMenuOpen"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <!-- Submenú -->
            <div 
                *ngIf="isProductsMenuOpen" 
                class="bg-[#15171e] overflow-hidden transition-all duration-300"
            >
                <a 
                    *ngIf="authService.hasPermission('VER_PRODUCTOS')"
                    routerLink="/dashboard/products" 
                    routerLinkActive="text-white border-l-4 border-orange-500 bg-[#252830]"
                    (click)="close.emit()"
                    class="flex items-center pl-12 pr-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#252830] transition-colors border-l-4 border-transparent"
                >
                    Listado
                </a>

                <a 
                    *ngIf="authService.hasPermission('VER_CATEGORIAS')"
                    routerLink="/dashboard/categories" 
                    routerLinkActive="text-white border-l-4 border-orange-500 bg-[#252830]"
                    (click)="close.emit()"
                    class="flex items-center pl-12 pr-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#252830] transition-colors border-l-4 border-transparent"
                >
                    Categorías
                </a>

                <a 
                    *ngIf="authService.hasPermission('VER_MARCAS')"
                    routerLink="/dashboard/brands" 
                    routerLinkActive="text-white border-l-4 border-orange-500 bg-[#252830]"
                    (click)="close.emit()"
                    class="flex items-center pl-12 pr-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#252830] transition-colors border-l-4 border-transparent"
                >
                    Marcas
                </a>
            </div>
        </ng-container>

        <a 
            routerLink="/" 
            target="_blank"
            class="flex items-center px-4 py-3 text-gray-400 hover:bg-[#252830] hover:text-white transition-all duration-200 group rounded-r-md"
        >
            <span class="text-lg mr-3 w-6 text-center">🌐</span> 
            <span class="font-medium text-sm">Ver Tienda</span>
        </a>
        
        <!-- Módulo de Administración (Desplegable) -->
        <ng-container *ngIf="authService.hasPermission('VER_USUARIOS') || authService.hasPermission('VER_ROLES')">

            <!-- Botón Padre -->
            <button 
                (click)="toggleAdminMenu()"
                class="w-full flex items-center justify-between px-4 py-3 text-gray-400 hover:bg-[#252830] hover:text-white transition-all duration-200 group rounded-r-md focus:outline-none"
                [class.text-white]="isAdminMenuOpen"
                [class.bg-[#252830]]="isAdminMenuOpen"
            >
                <div class="flex items-center">
                    <span class="text-lg mr-3 w-6 text-center">⚙️</span> 
                    <span class="font-medium text-sm">Administración</span>
                </div>
                <svg 
                    class="w-4 h-4 transition-transform duration-200" 
                    [class.rotate-180]="isAdminMenuOpen"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <!-- Submenú -->
            <div 
                *ngIf="isAdminMenuOpen" 
                class="bg-[#15171e] overflow-hidden transition-all duration-300"
            >
                <a 
                    *ngIf="authService.hasPermission('VER_USUARIOS')"
                    routerLink="/dashboard/users" 
                    routerLinkActive="text-white border-l-4 border-orange-500 bg-[#252830]"
                    (click)="close.emit()"
                    class="flex items-center pl-12 pr-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#252830] transition-colors border-l-4 border-transparent"
                >
                    Usuarios
                </a>
                
                <a 
                    *ngIf="authService.hasPermission('VER_ROLES')"
                    routerLink="/dashboard/roles" 
                    routerLinkActive="text-white border-l-4 border-orange-500 bg-[#252830]"
                    (click)="close.emit()"
                    class="flex items-center pl-12 pr-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#252830] transition-colors border-l-4 border-transparent"
                >
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
  
  isProductsMenuOpen = false;
  isAdminMenuOpen = false;

  toggleProductsMenu() {
    this.isProductsMenuOpen = !this.isProductsMenuOpen;
  }

  toggleAdminMenu() {
    this.isAdminMenuOpen = !this.isAdminMenuOpen;
  }
}
