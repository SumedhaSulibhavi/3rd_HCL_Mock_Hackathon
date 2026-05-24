import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
} from '../../models/ticket.models';
import { TicketApiService } from '../../services/ticket-api.service';

@Component({
  selector: 'app-ticket-create',
  imports: [FormsModule, RouterLink],
  templateUrl: './ticket-create.component.html',
  styleUrl: './ticket-create.component.css',
})
export class TicketCreateComponent {
  private readonly api = inject(TicketApiService);
  private readonly router = inject(Router);

  readonly categories = TICKET_CATEGORIES;
  readonly priorities = TICKET_PRIORITIES;

  title = '';
  description = '';
  category = 'SoftwareIssue';
  priority = 'Medium';
  loading = signal(false);
  error = signal('');

  submit(): void {
    const session = this.api.getSession();
    if (!session) {
      this.error.set('You must be logged in.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.api
      .createTicket({
        title: this.title.trim(),
        description: this.description.trim(),
        category: this.category,
        priority: this.priority,
        employeeId: session.userId,
      })
      .subscribe({
        next: (t) => this.router.navigate(['/app/tickets', t.id]),
        error: (err) => {
          this.error.set(err?.error?.title?.[0] ?? 'Failed to create ticket.');
          this.loading.set(false);
        },
        complete: () => this.loading.set(false),
      });
  }
}
