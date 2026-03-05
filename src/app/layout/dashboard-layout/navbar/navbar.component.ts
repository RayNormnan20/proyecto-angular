import { Component, inject, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
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
        <div class="hidden md:flex flex-col text-right">
          <span class="text-sm font-medium text-gray-900">{{ authService.currentUser()?.nombre }}</span>
          <span class="text-xs text-gray-500 capitalize">{{ authService.currentUser()?.role }}</span>
        </div>
        
        <button 
          (click)="authService.logout()" 
          class="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center">
          <svg class="h-4 w-4 mr-1 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="hidden md:inline">Cerrar Sesión</span>
        </button>
      </div>
    </header>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);
  @Output() toggleSidebar = new EventEmitter<void>();
}
