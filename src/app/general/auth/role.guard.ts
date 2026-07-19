import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { PerfilUsuario } from '../../models/constants/perfil';

export const roleGuard: CanActivateFn = (route) => {
  const authService    = inject(AuthService);
  const router         = inject(Router);
  const allowedRoles: PerfilUsuario[] = route.data['roles'] ?? [];
  const usuario = authService.getUsuario();

  if (!usuario) {
    router.navigate(['/login']);
    return false;
  }

  if (allowedRoles.length === 0 || allowedRoles.includes(usuario.perfil)) {
    return true;
  }

  router.navigate(['/access-denied']);
  return false;
};
