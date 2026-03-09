import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

      <!-- Right Side: Login Form -->
      <div class="flex w-full items-center justify-center lg:w-1/2">
        <div class="w-full max-w-md px-8 py-10 bg-white shadow-2xl rounded-xl mx-4">
          <div class="text-center mb-8">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 mb-4">
              <svg class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 class="text-3xl font-extrabold text-gray-900">Bienvenido</h2>
            <p class="mt-2 text-sm text-gray-600">Ingresa tus credenciales para acceder</p>
          </div>
          
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="email">
                Correo Electrónico
              </label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  class="block w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 p-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                  [ngClass]="{'border-red-500 focus:border-red-500 focus:ring-red-500': loginForm.get('email')?.invalid && loginForm.get('email')?.touched}"
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="ejemplo@empresa.com"
                />
              </div>
              <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="mt-1 text-xs text-red-600">
                Ingrese un correo electrónico válido.
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="password">
                Contraseña
              </label>
              <div class="relative">
                 <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  class="block w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 p-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                  [ngClass]="{'border-red-500 focus:border-red-500 focus:ring-red-500': loginForm.get('password')?.invalid && loginForm.get('password')?.touched}"
                  id="password"
                  type="password"
                  formControlName="password"
                  placeholder="••••••••"
                />
              </div>
              <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="mt-1 text-xs text-red-600">
                La contraseña es requerida.
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                <label for="remember-me" class="ml-2 block text-sm text-gray-900">Recordarme</label>
              </div>
              <div class="text-sm">
                <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">¿Olvidaste tu contraseña?</a>
              </div>
            </div>

            <div>
              <button
                class="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out shadow-lg hover:shadow-xl"
                type="submit"
                [disabled]="loginForm.invalid || isLoading"
              >
                <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg *ngIf="!isLoading" class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                   <svg *ngIf="isLoading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                <span *ngIf="!isLoading">Iniciar Sesión</span>
                <span *ngIf="isLoading">Verificando...</span>
              </button>
            </div>

            <div *ngIf="errorMessage" class="mt-4 rounded-md bg-red-50 p-4 border border-red-200">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">Error de autenticación</h3>
                  <div class="mt-2 text-sm text-red-700">
                    <p>{{ errorMessage }}</p>
                  </div>
                </div>
              </div>
            </div>

          </form>
          
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              ¿No tienes una cuenta?
              <a href="/auth/register" class="font-medium text-indigo-600 hover:text-indigo-500">Regístrate aquí</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authApi = inject(AuthApiService); // Servicio de API específico de Auth
  private authService = inject(AuthService); // Servicio Global de Auth (Core)

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  isLoading = false;
  errorMessage = '';

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const { email, password } = this.loginForm.value;
      
      this.authApi.login({ email: email!, password: password! }).subscribe({
        next: (response) => {
          this.isLoading = false;
          // Delegar al servicio core el manejo del éxito (guardar token, redirigir)
          this.authService.loginSuccess(response);
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
          this.errorMessage = err.error?.message || 'Error al conectar con el servidor. Intente más tarde.';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
