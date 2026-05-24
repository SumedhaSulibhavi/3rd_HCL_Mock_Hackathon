import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TicketApiService } from '../services/ticket-api.service';

export const authGuard: CanActivateFn = () => {
  const api = inject(TicketApiService);
  const router = inject(Router);
  if (api.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
