import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen bg-gray-50">
      <!-- Left Side: Image/Branding (Hidden on mobile) -->
      <div class="hidden w-1/2 bg-cover bg-center lg:block" style="background-image: url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80');">
        <div class="flex h-full items-center justify-center bg-gray-900 bg-opacity-40">
          <div class="text-center">
            <h1 class="text-4xl font-bold text-white">Sistema de Gestión Empresarial</h1>
            <p class="mt-3 text-xl text-gray-200">Eficiencia y control en un solo lugar</p>
          </div>
        </div>
      </div>

      <!-- Right Side: Register Form -->
      <div class="flex w-full items-center justify-center lg:w-1/2 overflow-y-auto py-10">
        <div class="w-full max-w-lg px-8 py-10 bg-white shadow-2xl rounded-xl mx-4 my-auto">
          <div class="text-center mb-8">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 mb-4">
              <svg class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 class="text-3xl font-extrabold text-gray-900">Crear Cuenta</h2>
            <p class="mt-2 text-sm text-gray-600">Regístrate para comenzar a gestionar tu negocio</p>
          </div>
          
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Nombre -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1" for="nombre">Nombre</label>
                <div class="relative">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    class="block w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    [ngClass]="{'border-red-500 focus:border-red-500 focus:ring-red-500': registerForm.get('nombre')?.invalid && registerForm.get('nombre')?.touched}"
                    id="nombre" type="text" formControlName="nombre" placeholder="Juan"
                  />
                </div>
                <div *ngIf="registerForm.get('nombre')?.invalid && registerForm.get('nombre')?.touched" class="mt-1 text-xs text-red-600">
                  El nombre es obligatorio.
                </div>
              </div>

              <!-- Apellidos -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1" for="apellidos">Apellidos</label>
                <div class="relative">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    class="block w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    [ngClass]="{'border-red-500 focus:border-red-500 focus:ring-red-500': registerForm.get('apellidos')?.invalid && registerForm.get('apellidos')?.touched}"
                    id="apellidos" type="text" formControlName="apellidos" placeholder="Pérez"
                  />
                </div>
                <div *ngIf="registerForm.get('apellidos')?.invalid && registerForm.get('apellidos')?.touched" class="mt-1 text-xs text-red-600">
                  Los apellidos son obligatorios.
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Teléfono -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1" for="telefono">Teléfono</label>
                <div class="relative">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    class="block w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    [ngClass]="{'border-red-500 focus:border-red-500 focus:ring-red-500': registerForm.get('telefono')?.invalid && registerForm.get('telefono')?.touched}"
                    id="telefono" type="tel" formControlName="telefono" placeholder="987654321"
                  />
                </div>
                <div *ngIf="registerForm.get('telefono')?.invalid && registerForm.get('telefono')?.touched" class="mt-1 text-xs text-red-600">
                  El teléfono es obligatorio.
                </div>
              </div>

              <!-- Dirección -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1" for="direccion">Dirección</label>
                <div class="relative">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    class="block w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    [ngClass]="{'border-red-500 focus:border-red-500 focus:ring-red-500': registerForm.get('direccion')?.invalid && registerForm.get('direccion')?.touched}"
                    id="direccion" type="text" formControlName="direccion" placeholder="Av. Principal 123"
                  />
                </div>
                <div *ngIf="registerForm.get('direccion')?.invalid && registerForm.get('direccion')?.touched" class="mt-1 text-xs text-red-600">
                  La dirección es obligatoria.
                </div>
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="email">Correo Electrónico</label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  class="block w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  [ngClass]="{'border-red-500 focus:border-red-500 focus:ring-red-500': registerForm.get('email')?.invalid && registerForm.get('email')?.touched}"
                  id="email" type="email" formControlName="email" placeholder="ejemplo@empresa.com"
                />
              </div>
              <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="mt-1 text-xs text-red-600">
                Ingrese un correo electrónico válido.
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="password">Contraseña</label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  class="block w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  [ngClass]="{'border-red-500 focus:border-red-500 focus:ring-red-500': registerForm.get('password')?.invalid && registerForm.get('password')?.touched}"
                  id="password" type="password" formControlName="password" placeholder="••••••••"
                />
              </div>
              <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="mt-1 text-xs text-red-600">
                La contraseña debe tener al menos 6 caracteres.
              </div>
            </div>

            <div class="pt-2">
              <button
                class="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out shadow-lg hover:shadow-xl"
                type="submit"
                [disabled]="registerForm.invalid || isLoading"
              >
                <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg *ngIf="!isLoading" class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <svg *ngIf="isLoading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                <span *ngIf="!isLoading">Registrarse</span>
                <span *ngIf="isLoading">Procesando...</span>
              </button>
            </div>

            <!-- Messages -->
            <div *ngIf="errorMessage" class="mt-4 rounded-md bg-red-50 p-4 border border-red-200">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">Error de registro</h3>
                  <div class="mt-2 text-sm text-red-700">
                    <p>{{ errorMessage }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div *ngIf="successMessage" class="mt-4 rounded-md bg-green-50 p-4 border border-green-200">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800">Registro Exitoso</h3>
                  <div class="mt-2 text-sm text-green-700">
                    <p>{{ successMessage }}</p>
                  </div>
                </div>
              </div>
            </div>

          </form>
          
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              ¿Ya tienes una cuenta?
              <a routerLink="/auth/login" class="font-medium text-indigo-600 hover:text-indigo-500">Inicia sesión aquí</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authApi = inject(AuthApiService);
  private router = inject(Router);

  registerForm = this.fb.group({
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    telefono: ['', Validators.required],
    direccion: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      this.authApi.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Registro exitoso. Redirigiendo al login...';
          setTimeout(() => {
             this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
          this.errorMessage = err.error?.message || 'Error al registrar usuario.';
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
