import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gray-100">
      <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 class="mb-6 text-center text-2xl font-bold text-gray-800">Registrarse</h2>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          
          <div class="mb-4">
            <label class="mb-2 block text-sm font-bold text-gray-700" for="nombre">
              Nombre Completo
            </label>
            <input
              class="w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none focus:shadow-outline transition-colors duration-200"
              [ngClass]="{'border-red-500': registerForm.get('nombre')?.invalid && registerForm.get('nombre')?.touched}"
              id="nombre"
              type="text"
              formControlName="nombre"
              placeholder="Juan Pérez"
            />
          </div>

          <div class="mb-4">
            <label class="mb-2 block text-sm font-bold text-gray-700" for="email">
              Correo Electrónico
            </label>
            <input
              class="w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none focus:shadow-outline transition-colors duration-200"
              [ngClass]="{'border-red-500': registerForm.get('email')?.invalid && registerForm.get('email')?.touched}"
              id="email"
              type="email"
              formControlName="email"
              placeholder="juan@ejemplo.com"
            />
          </div>

          <div class="mb-6">
            <label class="mb-2 block text-sm font-bold text-gray-700" for="password">
              Contraseña
            </label>
            <input
              class="w-full appearance-none rounded border px-3 py-2 mb-3 leading-tight text-gray-700 shadow focus:outline-none focus:shadow-outline transition-colors duration-200"
              [ngClass]="{'border-red-500': registerForm.get('password')?.invalid && registerForm.get('password')?.touched}"
              id="password"
              type="password"
              formControlName="password"
              placeholder="******************"
            />
          </div>

          <div class="flex items-center justify-between mb-4">
            <button
              class="w-full rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700 focus:outline-none focus:shadow-outline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              [disabled]="registerForm.invalid || isLoading"
            >
              <span *ngIf="!isLoading">Registrarse</span>
              <span *ngIf="isLoading">Procesando...</span>
            </button>
          </div>
          
          <div class="text-center">
            <a routerLink="/auth/login" class="text-sm text-blue-500 hover:text-blue-800">¿Ya tienes cuenta? Inicia sesión</a>
          </div>

          <div *ngIf="errorMessage" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
            {{ errorMessage }}
          </div>
          
           <div *ngIf="successMessage" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm text-center">
            {{ successMessage }}
          </div>

        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authApi = inject(AuthApiService);

  registerForm = this.fb.group({
    nombre: ['', Validators.required],
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
             // Redirigir o similar
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
