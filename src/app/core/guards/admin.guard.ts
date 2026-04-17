import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const token = auth.getToken();
    if (!token) {
        router.navigate(['/login']);
        return false;
    }

    const decoded = auth.getDecodedToken();
    if (!decoded || !decoded.role) {
        router.navigate(['/login']);
        return false;
    }

    if (decoded.role === 'admin' && auth.isTokenValid()) return true;
    router.navigate(['/login']);
    return false;
};
