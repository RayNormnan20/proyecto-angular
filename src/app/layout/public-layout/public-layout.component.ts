import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col">
      <!-- Navbar Público -->
      <nav class="bg-white shadow-sm sticky top-0 z-50">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <a routerLink="/" class="text-xl font-bold text-blue-600">Mi Tienda</a>
              <div class="hidden md:block ml-10 space-x-8">
                <a routerLink="/" class="text-gray-700 hover:text-blue-600">Inicio</a>
                <a routerLink="/products" class="text-gray-700 hover:text-blue-600">Catálogo</a>
              </div>
            </div>
            
            <div class="flex items-center space-x-4">
              <ng-container *ngIf="authService.currentUser() as user; else loginButtons">
                <div class="flex items-center gap-3 relative group cursor-pointer">
                  <span class="text-gray-700 text-sm font-medium">Hola, {{ user.nombre }}</span>
                  
                    <button class="flex items-center gap-2 focus:outline-none">
                      <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200">
                        {{ user.nombre.charAt(0).toUpperCase() }}
                      </div>
                    </button>
                    <!-- Dropdown Menu -->
                    <div class="absolute right-0 top-full -mt-2 pt-4 w-48 hidden group-hover:block hover:block z-50">
                      <div class="bg-white rounded-md shadow-lg py-1 border border-gray-100">
                        <div class="px-4 py-2 border-b border-gray-100">
                          <p class="text-sm font-medium text-gray-900 truncate">{{ user.nombre }}</p>
                          <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
                          <p class="text-xs text-blue-600 font-medium mt-1 uppercase">{{ user.role }}</p>
                        </div>
                        
                        <a routerLink="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                          Mi Perfil
                        </a>

                        <a *ngIf="['admin', 'trabajador', 'supervisor'].includes(user.role || '')" 
                           routerLink="/dashboard" 
                           class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                           Ir al Dashboard
                        </a>
                        <button (click)="logout()" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  
                </div>
              </ng-container>
              
              <ng-template #loginButtons>
                <a routerLink="/auth/login" class="text-gray-700 hover:text-blue-600 font-medium">Iniciar Sesión</a>
                <a routerLink="/auth/register" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium text-sm">Registrarse</a>
              </ng-template>
            </div>
          </div>
        </div>
      </nav>

      <!-- Contenido Principal -->
      <main class="flex-grow bg-gray-50">
        <router-outlet></router-outlet>
      </main>

    </div>
  `
})
export class PublicLayoutComponent {
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
