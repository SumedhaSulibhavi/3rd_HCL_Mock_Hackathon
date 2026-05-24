import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, NgIf, FormsModule],
  template: `
    <div class="container py-5 d-flex justify-content-center align-items-center min-vh-85 page-fade-in">
      <div class="w-100" style="max-width: 480px;">
        
        <!-- Registration Card -->
        <div class="glass-card p-4">
          <div class="text-center mb-4">
            <div class="d-inline-flex align-items-center justify-content-center bg-glass p-3 rounded-circle border border-glass mb-2">
              <i class="fa-solid fa-user-plus text-gradient-blue fs-4"></i>
            </div>
            <h3 class="fw-bold text-white mb-1">Create Workspace Account</h3>
            <p class="text-secondary fs-14">Join HCL's internal incident management database</p>
          </div>

          <!-- Alert Messages -->
          <div *ngIf="errorMessage" class="alert alert-danger d-flex align-items-center gap-2.5 py-3 border border-danger-subtle rounded-3 mb-4" style="background: rgba(239, 68, 68, 0.1);">
            <i class="fa-solid fa-triangle-exclamation text-danger fs-5"></i>
            <span class="fs-13 fw-medium text-danger-emphasis">{{ errorMessage }}</span>
          </div>

          <div *ngIf="successMessage" class="alert alert-success d-flex align-items-center gap-2.5 py-3 border border-success-subtle rounded-3 mb-4" style="background: rgba(16, 185, 129, 0.1);">
            <i class="fa-solid fa-circle-check text-success fs-5"></i>
            <span class="fs-13 fw-medium text-success-emphasis">{{ successMessage }}</span>
          </div>

          <!-- Registration Form -->
          <form *ngIf="!successMessage" (submit)="onSubmit()">
            <!-- Hologram Name Input -->
            <div class="hologram-input-group">
              <input
                type="text"
                id="name"
                name="name"
                [(ngModel)]="name"
                required
                class="hologram-input"
                placeholder=" "
              />
              <label class="hologram-label" for="name">Full User Name</label>
            </div>

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
              />
              <label class="hologram-label" for="email">Corporate Email</label>
            </div>

            <div class="glass-input-group">
              <label class="glass-label" for="role">Assign Corporate Role</label>
              <select
                id="role"
                name="role"
                [(ngModel)]="role"
                required
                class="glass-input select-arrow"
              >
                <option value="Employee">Employee (Filing Tickets)</option>
                <option value="SupportEngineer">Support Engineer (Queue Solver)</option>
                <option value="Manager">Manager (Administration & Analytics)</option>
              </select>
            </div>

            <!-- Hologram Password Input -->
            <div class="hologram-input-group mb-4">
              <input
                type="password"
                id="password"
                name="password"
                [(ngModel)]="password"
                required
                class="hologram-input"
                placeholder=" "
              />
              <label class="hologram-label" for="password">Choose Security Password</label>
              <span class="fs-11 text-muted mt-1.5 d-block">Note: In Sandbox Mode, default password is "Password123" for demo compatibility.</span>
            </div>

            <button type="submit" class="btn btn-gradient w-100 py-2.5 text-dark fw-bold mb-3" [disabled]="loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ loading ? 'Scaffolding account...' : 'Create Account' }}
            </button>

            <div class="text-center fs-13 text-secondary">
              Already have an account?
              <a routerLink="/login" class="text-gradient-blue fw-semibold text-decoration-none">Sign In</a>
            </div>
          </form>

          <!-- Success Redirect button -->
          <div *ngIf="successMessage" class="text-center pt-2">
            <a routerLink="/login" class="btn btn-gradient px-4 py-2 text-dark fw-bold">Proceed to Sign In</a>
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
    
    .fs-11 {
      font-size: 11px;
    }
    
    .select-arrow {
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: calc(100% - 16px) center;
    }
  `]
})
export class RegisterComponent {
  apiService = inject(ApiService);
  name = '';
  email = '';
  role = 'Employee';
  password = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit() {
    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Please complete all form inputs.';
      return;
    }

    if (!this.email.includes('@')) {
      this.errorMessage = 'Please provide a valid corporate email.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.apiService.register({ name: this.name, email: this.email, role: this.role }).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = res.message || 'Registration completed successfully!';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'An error occurred during account registration.';
      }
    });
  }
}
