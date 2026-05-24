import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { TicketApiService } from '../../services/ticket-api.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly api = inject(TicketApiService);
  private readonly router = inject(Router);

  readonly appName = environment.appName;
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  submit(): void {
    this.error.set('');
    this.loading.set(true);
    this.api.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => this.router.navigate(['/app/dashboard']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Login failed. Check credentials.');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
