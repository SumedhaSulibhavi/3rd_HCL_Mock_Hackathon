import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { USER_ROLES, UserRole } from '../../models/ticket.models';
import { TicketApiService } from '../../services/ticket-api.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly api = inject(TicketApiService);
  private readonly router = inject(Router);

  readonly appName = environment.appName;
  readonly roles = USER_ROLES;

  username = '';
  email = '';
  password = '';
  role: UserRole = 'Employee';
  loading = signal(false);
  error = signal('');
  success = signal('');

  submit(): void {
    this.error.set('');
    this.success.set('');
    this.loading.set(true);
    this.api
      .register({
        username: this.username.trim(),
        email: this.email.trim(),
        password: this.password,
        role: this.role,
      })
      .subscribe({
        next: () => {
          this.success.set('Account created! Redirecting to login…');
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: (err) => {
          this.error.set(
            err?.error?.message ??
              (typeof err?.error === 'string' ? err.error : 'Registration failed.'),
          );
          this.loading.set(false);
        },
        complete: () => this.loading.set(false),
      });
  }
}
