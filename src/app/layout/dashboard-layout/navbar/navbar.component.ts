import { Component, inject, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-6 w-full relative z-10">
      <div class="flex items-center">
        <!-- Mobile Menu Button -->
        <button (click)="toggleSidebar.emit()" class="mr-4 text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Breadcrumb o Título de página dinámico podría ir aquí -->
        <h2 class="text-xl font-semibold text-gray-800">Dashboard</h2>
      </div>

      <div class="flex items-center space-x-4">
        <a 
          routerLink="/" 
          target="_blank"
          class="flex items-center text-gray-500 hover:text-indigo-600 transition-colors mr-2 md:mr-4"
          title="Ver Tienda"
        >
          <svg class="h-6 w-6 md:h-5 md:w-5 md:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-9 3-9s-1.343-9-3-9m0 18c-1.657 0-3-9-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <span class="hidden md:inline text-sm font-medium">Ver Tienda</span>
        </a>

        <div class="flex items-center space-x-3">
          <div class="hidden md:flex flex-col text-right">
             <span class="text-sm font-semibold text-gray-900">{{ authService.currentUser()?.nombre }}</span>
             <span class="text-xs text-gray-500 font-medium uppercase tracking-wide">{{ authService.currentUser()?.role }}</span>
          </div>
           <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
             {{ authService.currentUser()?.nombre?.charAt(0) || 'U' }}
           </div>
        </div>
        
        <button 
          (click)="authService.logout()" 
          class="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center shadow-sm ml-4">
          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Salir</span>
        </button>
      </div>
    </header>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);
  @Output() toggleSidebar = new EventEmitter<void>();
}
