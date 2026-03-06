import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

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
              <a routerLink="/auth/login" class="text-gray-700 hover:text-blue-600 font-medium">Iniciar Sesión</a>
              <a routerLink="/auth/register" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium text-sm">Registrarse</a>
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
export class PublicLayoutComponent {}
