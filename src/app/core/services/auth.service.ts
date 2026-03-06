import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Estado reactivo del usuario usando Signals de Angular
  currentUser = signal<any>(this.tokenService.getUser());

  constructor() {
    if (this.isAuthenticated()) {
      this.refreshProfile();
    }
  }

  refreshProfile() {
    this.http.get(`${this.apiUrl}/me`).subscribe({
      next: (user: any) => {
        this.tokenService.setUser(user);
        this.currentUser.set(user);
      },
      error: (err) => {
        console.error('Error refreshing profile:', err);
      }
    });
  }

  // Método llamado después de un login exitoso desde la feature
  loginSuccess(response: any) {
    this.tokenService.setTokens(response.accessToken, response.refreshToken);
    this.tokenService.setUser(response.user);
    this.currentUser.set(response.user);
    
    // Redirección basada en rol
    const userRole = response.user.role?.toLowerCase() || 'user';
    
    if (['usuario', 'cliente', 'user'].includes(userRole)) {
      this.router.navigate(['/']); // Ir a Home
    } else {
      this.router.navigate(['/dashboard']); // Ir a Dashboard (admin, trabajador, etc.)
    }
  }

  logout() {
    this.tokenService.clear();
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return this.tokenService.isAuthenticated();
  }

  hasRole(role: string): boolean {
    return this.tokenService.hasRole(role);
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUser();
    return user?.permissions?.includes(permission) || false;
  }
}
