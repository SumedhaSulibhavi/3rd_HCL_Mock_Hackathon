import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ticket } from '../../models/ticket.models';
import { TicketApiService } from '../../services/ticket-api.service';
import { categoryLabel, formatDate, isSlaBreached } from '../../utils/display.util';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(TicketApiService);

  readonly session = this.api.getSession();
  tickets = signal<Ticket[]>([]);
  loading = signal(true);
  error = signal('');

  readonly categoryLabel = categoryLabel;
  readonly formatDate = formatDate;
  readonly isSlaBreached = isSlaBreached;

  ngOnInit(): void {
    this.api.getTickets().subscribe({
      next: (all) => {
        const userId = this.session?.userId;
        const role = this.session?.role;
        const filtered =
          role === 'Employee' && userId
            ? all.filter((t) => t.employeeId === userId)
            : all;
        this.tickets.set(filtered);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load tickets. Is the API running on port 5005?');
        this.loading.set(false);
      },
    });
  }

  statusClass(status: string): string {
    return `status-${status.replace(/\s+/g, '').toLowerCase()}`;
  }

  priorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }
}
