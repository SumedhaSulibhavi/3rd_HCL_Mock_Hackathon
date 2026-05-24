import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, NgIf, NgClass, FormsModule],
  template: `
    <div class="container py-5 d-flex justify-content-center align-items-center min-vh-85 page-fade-in">
      <div class="w-100" style="max-width: 460px;">
        
        <!-- Login Card -->
        <div class="glass-card p-4">
          <div class="text-center mb-4">
            <div class="d-inline-flex align-items-center justify-content-center bg-glass p-3 rounded-circle border border-glass mb-2">
              <i class="fa-solid fa-lock text-gradient-blue fs-4"></i>
            </div>
            <h3 class="fw-bold text-white mb-1">Access Portal Desk</h3>
            <p class="text-secondary fs-14">Sign in to report or process operational incidents</p>
          </div>

          <!-- Error Feedback Banner -->
          <div *ngIf="errorMessage" class="alert alert-danger d-flex align-items-center gap-2.5 py-3 border border-danger-subtle rounded-3 mb-4" style="background: rgba(239, 68, 68, 0.1);">
            <i class="fa-solid fa-triangle-exclamation text-danger fs-5"></i>
            <span class="fs-13 fw-medium text-danger-emphasis">{{ errorMessage }}</span>
          </div>

          <!-- Login Form -->
          <form (submit)="onSubmit()">
            <!-- Hologram Email Input -->
            <div class="hologram-input-group">
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="email"
                required
                class="hologram-input"
                placeholder=" "
                autocomplete="username"
              />
              <label class="hologram-label" for="email">Corporate Email</label>
            </div>

            <!-- Hologram Password Input -->
            <div class="hologram-input-group mb-4">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                name="password"
                [(ngModel)]="password"
                required
                class="hologram-input pe-5"
                placeholder=" "
                autocomplete="current-password"
              />
              <label class="hologram-label" for="password">Security Password</label>
              <button
                type="button"
                class="btn position-absolute end-0 top-50 translate-middle-y border-0 text-muted px-3"
                (click)="showPassword = !showPassword"
                style="z-index: 10;"
              >
                <i class="fa-solid" [ngClass]="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>

            <button type="submit" class="btn btn-gradient w-100 py-2.5 text-dark fw-bold mb-3" [disabled]="loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ loading ? 'Securing Connection...' : 'Authenticate Credentials' }}
            </button>

            <div class="text-center fs-13 text-secondary">
              Don't have a workspace?
              <a routerLink="/register" class="text-gradient-blue fw-semibold text-decoration-none">Create account</a>
            </div>
          </form>
        </div>

        <!-- Fast-Login Sandbox Assistant (Holographic Card scanner styles) -->
        <div class="glass-card mt-4 p-3 border-warning" style="--glass-border: rgba(234, 179, 8, 0.15); background: rgba(15, 20, 38, 0.45);">
          <div class="d-flex align-items-center gap-2 mb-3">
            <i class="fa-solid fa-id-badge text-warning fs-5"></i>
            <span class="fs-12 fw-bold text-warning uppercase tracking-wider">Fast-Login Sandbox Access</span>
          </div>
          <p class="fs-12 text-secondary mb-3">
            Click a badge key below to run a security sweep login into pre-configured sandbox role profiles.
          </p>
          <div class="d-flex flex-column gap-2.5">
            <div 
              (click)="fastLogin('employee@hcl.com')"
              class="demo-badge-card"
            >
              <div>
                <i class="fa-solid fa-user text-info me-2 fs-12"></i>
                <span class="fw-semibold text-light">Alice Smith</span>
                <span class="text-muted ms-2 fs-11">employee@hcl.com</span>
              </div>
              <span class="badge bg-info text-dark fs-10 uppercase fw-bold py-1">Employee</span>
            </div>

            <div 
              (click)="fastLogin('engineer@hcl.com')"
              class="demo-badge-card"
            >
              <div>
                <i class="fa-solid fa-screwdriver-wrench text-warning me-2 fs-12"></i>
                <span class="fw-semibold text-light">Bob Jones</span>
                <span class="text-muted ms-2 fs-11">engineer@hcl.com</span>
              </div>
              <span class="badge bg-warning text-dark fs-10 uppercase fw-bold py-1">Engineer</span>
            </div>

            <div 
              (click)="fastLogin('manager@hcl.com')"
              class="demo-badge-card"
            >
              <div>
                <i class="fa-solid fa-user-shield text-danger me-2 fs-12"></i>
                <span class="fw-semibold text-light">Charlie Davis</span>
                <span class="text-muted ms-2 fs-11">manager@hcl.com</span>
              </div>
              <span class="badge bg-danger text-white fs-10 uppercase fw-bold py-1">Manager</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .min-vh-85 {
      min-height: 85vh;
    }
    
    .fs-14 {
      font-size: 14px;
    }
    
    .fs-13 {
      font-size: 13px;
    }
    
    .fs-12 {
      font-size: 12px;
    }
    
    .fs-11 {
      font-size: 11px;
    }
    
    .fs-10 {
      font-size: 10px;
    }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  apiService = inject(ApiService);
  router = inject(Router);

  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  showPassword = false;

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please provide both email and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.apiService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.authService.saveSession(res.token, res.email, res.name, res.role, res.id);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Authentication failed. Please verify credentials.';
      }
    });
  }

  fastLogin(email: string) {
    this.email = email;
    this.password = 'Password123';
    this.onSubmit();
  }
}
