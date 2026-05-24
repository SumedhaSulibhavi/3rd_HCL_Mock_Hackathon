import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models/ticket.models';
import { TicketApiService } from '../services/ticket-api.service';

export function roleGuard(...allowed: UserRole[]): CanActivateFn {
  return () => {
    const api = inject(TicketApiService);
    const router = inject(Router);
    const role = api.getSession()?.role;
    if (role && allowed.includes(role)) {
      return true;
    }
    return router.createUrlTree(['/app/dashboard']);
  };
}
