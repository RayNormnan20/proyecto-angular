import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div class="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-100 p-8">
        <div class="text-center mb-6">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 mb-4">
            <svg class="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 .552-.448 1-1 1s-1-.448-1-1a1 1 0 112 0zm0 0V9a4 4 0 10-8 0v2m14 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2h12a2 2 0 012 2z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Recuperar contraseña</h1>
          <p class="text-sm text-gray-600 mt-2">Ingresa tu correo y te enviaremos un enlace seguro para restablecerla.</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="ejemplo@empresa.com"
            />
            <div *ngIf="form.get('email')?.invalid && form.get('email')?.touched" class="mt-1 text-xs text-red-600">
              Ingresa un correo válido.
            </div>
          </div>

          <button
            type="submit"
            [disabled]="form.invalid || isLoading"
            class="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span *ngIf="!isLoading">Enviar enlace</span>
            <span *ngIf="isLoading">Enviando...</span>
          </button>
        </form>

        <div *ngIf="message" class="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {{ message }}
        </div>

        <div *ngIf="errorMessage" class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {{ errorMessage }}
        </div>

        <div class="mt-6 text-center text-sm text-gray-600">
          <a routerLink="/auth/login" class="font-medium text-indigo-600 hover:text-indigo-500">Volver al login</a>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authApi = inject(AuthApiService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = false;
  message = '';
  errorMessage = '';

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.errorMessage = '';

    this.authApi.forgotPassword(this.form.value.email || '').subscribe({
      next: (response) => {
        this.isLoading = false;
        this.message = response?.message || 'Si el correo existe, se envio el enlace de recuperación.';
        this.form.reset();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'No se pudo procesar la solicitud.';
      }
    });
  }
}
