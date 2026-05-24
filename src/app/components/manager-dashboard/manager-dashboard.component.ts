import { Component, OnInit, inject, signal } from '@angular/core';
import { DashboardAnalytics } from '../../models/ticket.models';
import { TicketApiService } from '../../services/ticket-api.service';
import { categoryLabel } from '../../utils/display.util';

@Component({
  selector: 'app-manager-dashboard',
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.css',
})
export class ManagerDashboardComponent implements OnInit {
  private readonly api = inject(TicketApiService);

  data = signal<DashboardAnalytics | null>(null);
  loading = signal(true);
  error = signal('');
  readonly categoryLabel = categoryLabel;

  ngOnInit(): void {
    this.api.getManagerDashboard().subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.status === 401 || err?.status === 403
            ? 'Analytics requires Manager role and valid JWT.'
            : 'Could not load analytics. Ensure API is running.',
        );
        this.loading.set(false);
      },
    });
  }
}
