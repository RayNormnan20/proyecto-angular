import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Obtener roles esperados desde la configuración de la ruta
  const expectedRoles = route.data['roles'] as Array<string>;

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  const currentUser = authService.currentUser();
  
  // Si el usuario tiene rol y ese rol está en los roles permitidos
  if (currentUser && expectedRoles.includes(currentUser.role)) {
    return true;
  }

  // Si no tiene permiso, redirigir al dashboard o mostrar error
  alert('Acceso denegado: No tienes permisos suficientes.');
  return router.createUrlTree(['/dashboard']);
};
