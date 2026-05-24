import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf, NgClass],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark px-4 py-3">
      <div class="container-fluid">
        <!-- System Logo & Branding -->
        <a class="navbar-brand d-flex align-items-center gap-2" routerLink="/">
          <i class="fa-solid fa-square-poll-vertical text-gradient-blue fs-4"></i>
          <span class="fw-bold tracking-wide">HCL <span class="text-gradient-blue">TicketSystem</span></span>
        </a>

        <!-- Mobile Toggler -->
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarContent">
          <!-- Central Navigation Links -->
          <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-4 gap-2">
            <li class="nav-item">
              <a class="nav-link px-3" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                <i class="fa-solid fa-house me-1"></i> Home
              </a>
            </li>
            <li class="nav-item" *ngIf="authService.isAuthenticated()">
              <a class="nav-link px-3" routerLink="/dashboard" routerLinkActive="active">
                <i class="fa-solid fa-gauge me-1"></i> Incident Desk
              </a>
            </li>
          </ul>

          <!-- Right Align Toolbar -->
          <div class="d-flex align-items-center gap-3 flex-wrap">
            
            <!-- Dynamic API Mode Toggle HUD -->
            <div class="d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill border border-glass bg-glass" style="font-size: 13px;">
              <span class="fw-medium text-muted">API Status:</span>
              <button 
                (click)="toggleApiMode()" 
                class="btn btn-sm py-0.5 px-2 rounded-pill d-flex align-items-center gap-1.5 border-0 transition-all font-semibold"
                [ngClass]="apiService.isMockMode() ? 'bg-warning text-dark' : 'bg-success text-white'"
                style="font-size: 11px; cursor: pointer;"
                [title]="apiService.isMockMode() ? 'Running on Local Sandbox Database' : 'Running on Live Backend API'"
              >
                <span class="d-inline-block rounded-circle" [ngClass]="apiService.isMockMode() ? 'bg-dark' : 'bg-light'" style="width: 6px; height: 6px;"></span>
                {{ apiService.isMockMode() ? 'SANDBOX DEMO' : 'LIVE API' }}
              </button>
            </div>

            <!-- Session Controls -->
            <ng-container *ngIf="authService.isAuthenticated(); else authButtons">
              <div class="d-flex align-items-center gap-2.5">
                <div class="text-end d-none d-sm-block">
                  <div class="fw-semibold text-light fs-14">{{ authService.userName() }}</div>
                  <span class="badge" [ngClass]="getRoleBadgeClass(authService.userRole())" style="font-size: 9px; letter-spacing: 0.05em;">
                    {{ authService.userRole() }}
                  </span>
                </div>
                <button (click)="logout()" class="btn btn-glass d-flex align-items-center gap-2 fs-14 py-2">
                  <i class="fa-solid fa-right-from-bracket text-danger"></i> Logout
                </button>
              </div>
            </ng-container>

            <ng-template #authButtons>
              <div class="d-flex gap-2">
                <a routerLink="/login" class="btn btn-glass fs-14 py-2">Sign In</a>
                <a routerLink="/register" class="btn btn-gradient fs-14 py-2 text-dark">Sign Up</a>
              </div>
            </ng-template>

          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: rgba(7, 10, 19, 0.7);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      position: sticky;
      top: 0;
      z-index: 1030;
    }
    
    .nav-link {
      color: var(--text-secondary) !important;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.25s ease;
    }
    
    .nav-link:hover, .nav-link.active {
      color: var(--text-primary) !important;
      background: rgba(255, 255, 255, 0.04);
    }
    
    .bg-glass {
      background: rgba(15, 20, 38, 0.4);
    }
    
    .border-glass {
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    
    .fs-14 {
      font-size: 14px;
    }
    
    .fs-4 {
      font-size: 1.5rem;
    }
    
    .transition-all {
      transition: all 0.25s ease;
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  apiService = inject(ApiService);

  toggleApiMode() {
    this.apiService.isMockMode.set(!this.apiService.isMockMode());
  }

  logout() {
    this.authService.logout();
  }

  getRoleBadgeClass(role: string | null): string {
    switch (role) {
      case 'Manager':
        return 'bg-danger text-white';
      case 'SupportEngineer':
        return 'bg-warning text-dark';
      case 'Employee':
        return 'bg-info text-dark';
      default:
        return 'bg-secondary text-white';
    }
  }
}
