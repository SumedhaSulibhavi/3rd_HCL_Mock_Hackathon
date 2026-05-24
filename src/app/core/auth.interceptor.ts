import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TicketApiService } from '../services/ticket-api.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const api = inject(TicketApiService);
  const token = api.getSession()?.token;
  if (!token) {
    return next(req);
  }
  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
