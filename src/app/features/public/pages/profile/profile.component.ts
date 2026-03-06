import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-gray-50 min-h-screen pb-12">
      <!-- Header / Banner -->
      <div class="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 w-full relative overflow-hidden">
         <div class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <!-- Main Content -->
      <div class="container mx-auto px-4 -mt-20 relative z-10">
        <div class="flex flex-col md:flex-row gap-6">
          
          <!-- Sidebar: User Card -->
          <div class="w-full md:w-1/3 lg:w-1/4">
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
              <div class="p-6 text-center border-b border-gray-100">
                <div class="w-32 h-32 mx-auto bg-white p-1 rounded-full shadow-lg -mt-16 mb-4 relative">
                   <div class="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600 border-4 border-white">
                     {{ (currentUser()?.nombre || 'U').charAt(0).toUpperCase() }}
                   </div>
                   <button class="absolute bottom-0 right-0 bg-gray-100 p-2 rounded-full border-2 border-white text-gray-600 hover:text-blue-600 transition-colors" title="Cambiar foto">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                   </button>
                </div>
                
                <h2 class="text-xl font-bold text-gray-800">{{ currentUser()?.nombre }}</h2>
                <p class="text-sm text-gray-500 mb-2">{{ currentUser()?.email }}</p>
                <span class="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                  {{ currentUser()?.role || 'Usuario' }}
                </span>
              </div>
              
              <div class="p-4">
                <nav class="space-y-1">
                  <a class="flex items-center px-4 py-2 text-gray-700 bg-gray-50 rounded-md font-medium border-l-4 border-blue-600 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Información Personal
                  </a>
                  <a class="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md font-medium transition-colors cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Mis Pedidos
                    <span class="ml-auto bg-gray-200 text-gray-600 py-0.5 px-2 rounded-full text-xs">0</span>
                  </a>
                  <a class="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md font-medium transition-colors cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Seguridad
                  </a>
                  <a class="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md font-medium transition-colors cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Configuración
                  </a>
                </nav>
              </div>
            </div>
            
            <div class="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
               <h3 class="text-sm font-semibold text-blue-800 mb-2">¿Necesitas ayuda?</h3>
               <p class="text-xs text-blue-600 mb-3">Si tienes problemas con tu cuenta, contacta a soporte.</p>
               <button class="text-xs font-bold text-blue-700 hover:text-blue-900 underline">Contactar Soporte</button>
            </div>
          </div>

          <!-- Main Area: Details -->
          <div class="w-full md:w-2/3 lg:w-3/4">
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
              <div class="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <h3 class="text-xl font-bold text-gray-800">Información de Perfil</h3>
                <button class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Editar Perfil
                </button>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label class="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Nombre Completo</label>
                  <div class="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2">{{ currentUser()?.nombre }}</div>
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Correo Electrónico</label>
                  <div class="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2">{{ currentUser()?.email }}</div>
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Rol de Usuario</label>
                  <div class="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2 capitalize">{{ currentUser()?.role }}</div>
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Fecha de Registro</label>
                  <div class="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2">
                    {{ (currentUser()?.createdAt || today) | date:'longDate' }}
                  </div>
                </div>

                <div>
                   <label class="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Teléfono</label>
                   <div class="text-gray-500 italic text-lg border-b border-gray-100 pb-2">No registrado</div>
                </div>
                
                <div>
                   <label class="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Ubicación</label>
                   <div class="text-gray-500 italic text-lg border-b border-gray-100 pb-2">No registrada</div>
                </div>
              </div>
            </div>

            <!-- Activity / Stats Placeholder -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
               <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
                  <div class="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                     </svg>
                  </div>
                  <div>
                     <div class="text-2xl font-bold text-gray-800">0</div>
                     <div class="text-xs text-gray-500 uppercase font-medium">Pedidos Activos</div>
                  </div>
               </div>
               
               <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
                  <div class="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                     </svg>
                  </div>
                  <div>
                     <div class="text-2xl font-bold text-gray-800">0</div>
                     <div class="text-xs text-gray-500 uppercase font-medium">Favoritos</div>
                  </div>
               </div>

               <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
                  <div class="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                     </svg>
                  </div>
                  <div>
                     <div class="text-2xl font-bold text-gray-800">0</div>
                     <div class="text-xs text-gray-500 uppercase font-medium">Puntos</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;
  today = new Date();
}