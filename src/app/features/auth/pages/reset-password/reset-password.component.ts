import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div class="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-100 p-8">
        <div class="text-center mb-6">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 mb-4">
            <svg class="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Nueva contraseña</h1>
          <p class="text-sm text-gray-600 mt-2">Ingresa una nueva contraseña segura para tu cuenta.</p>
        </div>

        <div *ngIf="!token" class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          El enlace de recuperación no es válido.
        </div>

        <form *ngIf="token" [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
            <input
              id="newPassword"
              type="password"
              formControlName="newPassword"
              class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Minimo 6 caracteres"
            />
            <div *ngIf="form.get('newPassword')?.invalid && form.get('newPassword')?.touched" class="mt-1 text-xs text-red-600">
              La contraseña debe tener al menos 6 caracteres.
            </div>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Repite tu contraseña"
            />
            <div *ngIf="passwordMismatch && form.get('confirmPassword')?.touched" class="mt-1 text-xs text-red-600">
              Las contraseñas no coinciden.
            </div>
          </div>

          <button
            type="submit"
            [disabled]="form.invalid || isLoading || passwordMismatch"
            class="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span *ngIf="!isLoading">Guardar nueva contraseña</span>
            <span *ngIf="isLoading">Guardando...</span>
          </button>
        </form>

        <div *ngIf="message" class="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {{ message }}
        </div>

        <div *ngIf="errorMessage" class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {{ errorMessage }}
        </div>

        <div class="mt-6 text-center text-sm text-gray-600">
          <a routerLink="/auth/login" class="font-medium text-indigo-600 hover:text-indigo-500">Ir al login</a>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authApi = inject(AuthApiService);

  token = this.route.snapshot.queryParamMap.get('token') || '';

  form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  message = '';
  errorMessage = '';

  get passwordMismatch(): boolean {
    const { newPassword, confirmPassword } = this.form.value;
    return !!newPassword && !!confirmPassword && newPassword !== confirmPassword;
  }

  submit() {
    if (!this.token) {
      this.errorMessage = 'El enlace de recuperación no es válido.';
      return;
    }

    if (this.form.invalid || this.passwordMismatch) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.errorMessage = '';

    this.authApi.resetPassword({
      token: this.token,
      newPassword: this.form.value.newPassword || ''
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.message = response?.message || 'Contraseña actualizada correctamente.';
        this.form.reset();
        setTimeout(() => this.router.navigate(['/auth/login']), 1800);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'No se pudo restablecer la contraseña.';
      }
    });
  }
}
