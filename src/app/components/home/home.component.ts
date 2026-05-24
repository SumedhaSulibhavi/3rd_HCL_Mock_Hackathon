import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgIf],
  template: `
    <div class="container py-5 page-fade-in">
      <!-- Hero Header Section -->
      <div class="row align-items-center mb-5 min-vh-75 py-5">
        <div class="col-lg-6 mb-5 mb-lg-0 text-start">
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill mb-3 fs-13">
            <i class="fa-solid fa-sparkles me-1 text-warning"></i> Incident Management v2.0
          </span>
          <h1 class="display-3 fw-bold tracking-tight text-white mb-3">
            Smart Internal Incident <br/>
            <span class="text-gradient-blue">Management System</span>
          </h1>
          <p class="lead text-secondary mb-4 fs-18" style="max-width: 550px;">
            A high-fidelity ticketing workspace powered by .NET 8 enterprise architecture, reactive Angular standalone modules, and automated SLA breach tracking engines.
          </p>
          
          <div class="d-flex gap-3 flex-wrap">
            <a *ngIf="authService.isAuthenticated()" routerLink="/dashboard" class="btn btn-gradient btn-lg d-flex align-items-center gap-2 py-3 px-4 text-dark fs-16">
              Go to Workspace Desk <i class="fa-solid fa-arrow-right"></i>
            </a>
            <ng-container *ngIf="!authService.isAuthenticated()">
              <a routerLink="/login" class="btn btn-gradient btn-lg d-flex align-items-center gap-2 py-3 px-4 text-dark fs-16">
                Access Ticketing Portal <i class="fa-solid fa-arrow-right-to-bracket"></i>
              </a>
              <a routerLink="/register" class="btn btn-glass btn-lg py-3 px-4 fs-16">
                Create Account
              </a>
            </ng-container>
          </div>
        </div>

        <div class="col-lg-6 text-center position-relative">
          <!-- Glassmorphic Dashboard Showcase Panel -->
          <div class="hero-glow-panel glass-card p-4 mx-auto text-start position-relative" style="max-width: 480px; z-index: 2;">
            <div class="d-flex align-items-center justify-content-between mb-4 border-bottom border-light pb-3" style="--bs-border-opacity: .05">
              <div class="d-flex align-items-center gap-2">
                <span class="d-inline-block rounded-circle bg-danger" style="width: 10px; height: 10px;"></span>
                <span class="d-inline-block rounded-circle bg-warning" style="width: 10px; height: 10px;"></span>
                <span class="d-inline-block rounded-circle bg-success" style="width: 10px; height: 10px;"></span>
                <span class="ms-2 fs-12 fw-semibold text-secondary tracking-wider uppercase">Live Incident HUD</span>
              </div>
              <span class="badge status-badge status-open fs-10 py-1">Active</span>
            </div>

            <!-- Previews -->
            <div class="mb-3.5">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="fs-12 text-muted fw-medium uppercase">Ticket #T-1002</span>
                <span class="badge priority-badge priority-critical">Critical SLA</span>
              </div>
              <h5 class="fw-bold text-light mb-1">Database Connection Exhaustion</h5>
              <p class="fs-13 text-secondary mb-0">Connection pool overflow on Core-DB-01...</p>
            </div>

            <!-- SLA visual progress -->
            <div class="mt-4 mb-3">
              <div class="d-flex justify-content-between text-muted fs-11 fw-medium mb-1">
                <span>SLA COUNTDOWN (4H Window)</span>
                <span class="text-danger fw-bold"><i class="fa-solid fa-triangle-exclamation"></i> BREACH DANGER</span>
              </div>
              <div class="progress bg-dark" style="height: 6px; border-radius: 3px; overflow: hidden;">
                <div class="progress-bar bg-danger progress-bar-striped progress-bar-animated" style="width: 90%"></div>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center pt-3 border-top border-light" style="--bs-border-opacity: .05">
              <div class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-circle-user text-gradient-blue fs-5"></i>
                <div>
                  <div class="fs-12 fw-semibold text-light">Bob Jones (L2 Engineer)</div>
                  <span class="fs-11 text-muted">Assigned Assignee</span>
                </div>
              </div>
              <span class="fs-11 text-muted">1h 12m remaining</span>
            </div>
          </div>
          
          <!-- Back glowing element -->
          <div class="hero-accent-circle position-absolute"></div>
        </div>
      </div>

      <!-- Feature Grid Section -->
      <div class="row pt-5 text-center mt-5">
        <h2 class="fw-bold fs-36 text-white mb-2">Engineered for Zero-Idle Operations</h2>
        <p class="text-secondary mb-5 fs-15 mx-auto" style="max-width: 600px;">
          Explore the architectural handshakes and structural workflows integrated directly within our system interface.
        </p>

        <div class="col-md-4 mb-4">
          <div class="glass-card h-100 p-4 d-flex flex-column align-items-start text-start">
            <div class="feature-icon bg-primary-subtle text-primary mb-3">
              <i class="fa-solid fa-user-shield fs-4"></i>
            </div>
            <h4 class="fw-bold text-light mb-2">1. Architectural Scope</h4>
            <p class="text-secondary fs-14 mb-0">
              Role-restricted views automatically render dashboards customized for Employees (ticket filing), Support Engineers (ticket queues), and Managers (SLA adjustments, performance KPIs).
            </p>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="glass-card h-100 p-4 d-flex flex-column align-items-start text-start">
            <div class="feature-icon bg-warning-subtle text-warning mb-3">
              <i class="fa-solid fa-hourglass-half fs-4"></i>
            </div>
            <h4 class="fw-bold text-light mb-2">2. SLA Breach Alarms</h4>
            <p class="text-secondary fs-14 mb-0">
              Critical issues enforce a rigid 4-hour countdown. Visually pulsing badges and dynamic progress tickers warn engineers prior to trigger conditions.
            </p>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="glass-card h-100 p-4 d-flex flex-column align-items-start text-start">
            <div class="feature-icon bg-success-subtle text-success mb-3">
              <i class="fa-solid fa-chart-line fs-4"></i>
            </div>
            <h4 class="fw-bold text-light mb-2">3. Low-Latency KPIs</h4>
            <p class="text-secondary fs-14 mb-0">
              Managers inspect live metrics and interactive trends. Single-pass LINQ GroupBy aggregates and reactive chart widgets display team operational performance instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .min-vh-75 {
      min-height: 70vh;
    }
    
    .fs-13 { font-size: 13px; }
    .fs-15 { font-size: 15px; }
    .fs-16 { font-size: 16px; }
    .fs-18 { font-size: 1.15rem; }
    .fs-36 { font-size: 2.25rem; }
    
    .hero-glow-panel {
      border-color: rgba(255, 255, 255, 0.12) !important;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6) !important;
    }
    
    .hero-accent-circle {
      width: 320px;
      height: 320px;
      background: radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
      pointer-events: none;
      filter: blur(40px);
    }
    
    .feature-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
  `]
})
export class HomeComponent {
  authService = inject(AuthService);
}
