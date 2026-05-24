import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ticket } from '../../models/ticket.models';
import { TicketApiService } from '../../services/ticket-api.service';
import { categoryLabel, formatDate } from '../../utils/display.util';

@Component({
  selector: 'app-engineer-queue',
  imports: [RouterLink],
  templateUrl: './engineer-queue.component.html',
  styleUrl: './engineer-queue.component.css',
})
export class EngineerQueueComponent implements OnInit {
  private readonly api = inject(TicketApiService);

  tickets = signal<Ticket[]>([]);
  loading = signal(true);
  readonly categoryLabel = categoryLabel;
  readonly formatDate = formatDate;

  ngOnInit(): void {
    this.api.getTickets().subscribe({
      next: (all) => {
        const open = all.filter(
          (t) => t.status !== 'Resolved' && t.status !== 'Closed',
        );
        this.tickets.set(open);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
