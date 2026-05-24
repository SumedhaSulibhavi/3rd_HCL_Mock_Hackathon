import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  Ticket,
  TicketComment,
} from '../../models/ticket.models';
import { TicketApiService } from '../../services/ticket-api.service';
import { categoryLabel, formatDate, isSlaBreached } from '../../utils/display.util';

@Component({
  selector: 'app-ticket-detail',
  imports: [FormsModule, RouterLink],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.css',
})
export class TicketDetailComponent implements OnInit {
  private readonly api = inject(TicketApiService);
  private readonly route = inject(ActivatedRoute);

  readonly session = this.api.getSession();
  readonly statuses = TICKET_STATUSES;
  readonly priorities = TICKET_PRIORITIES;
  readonly categoryLabel = categoryLabel;
  readonly formatDate = formatDate;
  readonly isSlaBreached = isSlaBreached;

  ticket = signal<Ticket | null>(null);
  comments = signal<TicketComment[]>([]);
  newComment = '';
  loading = signal(true);
  saving = signal(false);
  error = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('Invalid ticket id');
      this.loading.set(false);
      return;
    }
    this.api.getTicket(id).subscribe({
      next: (t) => {
        this.ticket.set(t);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Ticket not found');
        this.loading.set(false);
      },
    });
    this.api.getComments(id).subscribe({
      next: (c) => this.comments.set(c),
      error: () => this.comments.set([]),
    });
  }

  get canUpdateStatus(): boolean {
    return (
      this.session?.role === 'SupportEngineer' ||
      this.session?.role === 'Manager'
    );
  }

  postComment(): void {
    const t = this.ticket();
    const session = this.api.getSession();
    if (!t || !session || !this.newComment.trim()) return;

    this.api
      .addComment({
        ticketId: t.id,
        userId: session.userId,
        commentText: this.newComment.trim(),
      })
      .subscribe({
        next: (c) => {
          this.comments.update((list) => [...list, c]);
          this.newComment = '';
        },
      });
  }

  updateStatus(status: string): void {
    const t = this.ticket();
    if (!t || !this.canUpdateStatus) return;
    this.saving.set(true);
    this.api
      .updateTicket(t.id, {
        title: t.title,
        description: t.description,
        priority: t.priority,
        status,
      })
      .subscribe({
        next: (updated) => {
          this.ticket.set(updated);
          this.saving.set(false);
        },
        error: () => this.saving.set(false),
      });
  }

  updatePriority(priority: string): void {
    const t = this.ticket();
    if (!t || !this.canUpdateStatus) return;
    this.api
      .updateTicket(t.id, {
        title: t.title,
        description: t.description,
        priority,
        status: t.status,
      })
      .subscribe({
        next: (updated) => this.ticket.set(updated),
      });
  }
}
