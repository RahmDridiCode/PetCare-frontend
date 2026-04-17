import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const vetGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const decoded = auth.getDecodedToken();
  if (!decoded) {
    router.navigate(['/login']);
    return false;
  }

  const isVet = decoded.role === 'veterinaire';
  const approved = decoded.isApproved !== false;
  if (isVet && approved && auth.isTokenValid()) return true;

  router.navigate(['/login']);
  return false;
};
