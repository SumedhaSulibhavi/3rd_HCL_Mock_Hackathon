import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'Employee' | 'SupportEngineer' | 'Manager';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Use Angular Signals for reactive state management
  currentUserSignal = signal<UserSession | null>(null);
  
  isAuthenticated = computed(() => this.currentUserSignal() !== null);
  userRole = computed(() => this.currentUserSignal()?.role || null);
  userName = computed(() => this.currentUserSignal()?.name || '');
  userId = computed(() => this.currentUserSignal()?.id || '');

  constructor(private router: Router) {
    this.restoreSession();
  }

  saveSession(token: string, email: string, name: string, role: string, id: string) {
    localStorage.setItem('auth_token', token);
    const session: UserSession = {
      id,
      name,
      email,
      role: role as 'Employee' | 'SupportEngineer' | 'Manager',
    };
    localStorage.setItem('auth_user', JSON.stringify(session));
    this.currentUserSignal.set(session);
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  private restoreSession() {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    
    if (token && userStr) {
      try {
        const session: UserSession = JSON.parse(userStr);
        this.currentUserSignal.set(session);
      } catch (e) {
        this.logout();
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Decodes payload of standard JWTs
  decodeJwt(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payloadDecoded = atob(parts[1]);
        return JSON.parse(payloadDecoded);
      }
    } catch (e) {
      console.warn('Failed to parse JWT payload', e);
    }
    return null;
  }
}
