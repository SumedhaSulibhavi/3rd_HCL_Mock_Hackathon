import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService, Ticket, TicketComment, DashboardMetrics, TrendMetric, EngineerPerformance } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  apiService = inject(ApiService);
  datePipe = inject(DatePipe);

  // Active Queue Lists
  tickets: Ticket[] = [];
  metrics: DashboardMetrics = {
    totalTickets: 0,
    openCount: 0,
    inProgressCount: 0,
    escalatedCount: 0,
    resolvedCount: 0,
    slaBreachedCount: 0,
    slaAdherenceRate: 100
  };
  trends: TrendMetric[] = [];
  engineers: EngineerPerformance[] = [];

  // Filter Parameters
  loading = false;
  searchQuery = '';
  selectedStatusFilter = 'All';
  selectedPriorityFilter = '';
  selectedCategoryFilter = '';
  statusFilters = ['All', 'Open', 'In Progress', 'Escalated', 'Resolved'];

  // Detail View Drawer
  selectedTicket: Ticket | null = null;
  ticketComments: TicketComment[] = [];
  newCommentText = '';
  submittingComment = false;

  // Create Ticket Dialog
  showCreateModal = false;
  newTicketTitle = '';
  newTicketDescription = '';
  newTicketPriority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  newTicketCategory: 'Software' | 'Hardware' | 'Network' | 'Other' = 'Software';
  submittingTicket = false;

  ngOnInit() {
    this.loadDashboardData();
  }

  // Load live data from our API service
  loadDashboardData() {
    this.loading = true;
    
    // Perform parallel loads
    this.apiService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.loading = false;
        
        // If drawer is open, refresh active ticket details too
        if (this.selectedTicket) {
          const updated = this.tickets.find(t => t.id === this.selectedTicket!.id);
          if (updated) {
            this.selectedTicket = updated;
          }
        }
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });

    this.apiService.getDashboardMetrics().subscribe({
      next: (m) => this.metrics = m
    });

    this.apiService.getTrends().subscribe({
      next: (t) => this.trends = t
    });

    this.apiService.getEngineerPerformance().subscribe({
      next: (e) => this.engineers = e
    });
  }

  // Computed property: Filters data by query, category, priority, status AND role scopes!
  get filteredTickets(): Ticket[] {
    const userRole = this.authService.userRole();
    const userEmail = this.authService.currentUserSignal()?.email.toLowerCase() || '';

    return this.tickets.filter(t => {
      // 1. Role Scope Constraints (Blueprints business rule matching)
      if (userRole === 'Employee') {
        // Employees only see their own tickets
        if (t.createdBy.toLowerCase() !== userEmail) return false;
      } else if (userRole === 'SupportEngineer') {
        // Engineers see assigned to them OR completely unassigned tickets
        const isAssignedToMe = t.assignee && t.assignee.toLowerCase() === userEmail;
        const isUnassigned = !t.assignee;
        if (!isAssignedToMe && !isUnassigned) return false;
      }
      // Managers bypass constraints and see all tickets

      // 2. Search query matches ID, title or description
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        const matchesId = t.id.toLowerCase().includes(query);
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description.toLowerCase().includes(query);
        if (!matchesId && !matchesTitle && !matchesDesc) return false;
      }

      // 3. Status tab filters
      if (this.selectedStatusFilter !== 'All') {
        if (t.status !== this.selectedStatusFilter) return false;
      }

      // 4. Priority Dropdown filters
      if (this.selectedPriorityFilter) {
        if (t.priority !== this.selectedPriorityFilter) return false;
      }

      // 5. Category Dropdown filters
      if (this.selectedCategoryFilter) {
        if (t.category !== this.selectedCategoryFilter) return false;
      }

      return true;
    });
  }

  // Drawer Controls
  selectTicket(ticket: Ticket) {
    this.selectedTicket = ticket;
    this.ticketComments = [];
    this.newCommentText = '';
    
    // Fetch comments for active ticket
    this.apiService.getComments(ticket.id).subscribe({
      next: (c) => this.ticketComments = c
    });
  }

  closeDrawer() {
    this.selectedTicket = null;
  }

  // Form Controls
  openCreateModal() {
    this.showCreateModal = true;
    this.newTicketTitle = '';
    this.newTicketDescription = '';
    this.newTicketPriority = 'Low';
    this.newTicketCategory = 'Software';
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  // ==========================================
  // TRANSACTION SUBMISSIONS (API WORKERS)
  // ==========================================

  submitCreateTicket() {
    if (!this.newTicketTitle.trim() || !this.newTicketDescription.trim()) {
      return;
    }

    this.submittingTicket = true;
    const userEmail = this.authService.currentUserSignal()?.email || 'anonymous@hcl.com';

    this.apiService.createTicket({
      title: this.newTicketTitle,
      description: this.newTicketDescription,
      priority: this.newTicketPriority,
      category: this.newTicketCategory,
      email: userEmail
    }).subscribe({
      next: (ticket) => {
        this.submittingTicket = false;
        this.closeCreateModal();
        this.loadDashboardData(); // Refresh HUD charts & lists
      },
      error: (err) => {
        console.error(err);
        this.submittingTicket = false;
      }
    });
  }

  submitComment() {
    if (!this.newCommentText.trim() || !this.selectedTicket) return;

    this.submittingComment = true;
    const author = this.authService.userName() + ' (' + this.authService.userRole() + ')';

    this.apiService.addComment({
      ticketId: this.selectedTicket.id,
      content: this.newCommentText,
      author: author
    }).subscribe({
      next: (comment) => {
        this.submittingComment = false;
        this.newCommentText = '';
        
        // Refresh comments list and reload ticket logs
        this.selectTicket(this.selectedTicket!);
        this.loadDashboardData();
      },
      error: (err) => {
        console.error(err);
        this.submittingComment = false;
      }
    });
  }

  triggerAssign(engineerEmail: string) {
    if (!this.selectedTicket) return;
    
    const operator = this.authService.userName();
    this.apiService.assignTicket(this.selectedTicket.id, engineerEmail, operator).subscribe({
      next: (updatedTicket) => {
        this.selectTicket(updatedTicket);
        this.loadDashboardData();
      },
      error: (err) => console.error(err)
    });
  }

  triggerEscalate() {
    if (!this.selectedTicket) return;

    const operator = this.authService.userName();
    this.apiService.escalateTicket(this.selectedTicket.id, operator).subscribe({
      next: (updatedTicket) => {
        this.selectTicket(updatedTicket);
        this.loadDashboardData();
      },
      error: (err) => console.error(err)
    });
  }

  triggerResolve() {
    if (!this.selectedTicket) return;

    const operator = this.authService.userName();
    this.apiService.resolveTicket(this.selectedTicket.id, operator).subscribe({
      next: (updatedTicket) => {
        this.selectTicket(updatedTicket);
        this.loadDashboardData();
      },
      error: (err) => console.error(err)
    });
  }

  // ==========================================
  // BADGES & STRUCTURAL DISPLAY HELPERS
  // ==========================================

  getCategoryPercentage(count: number): number {
    if (this.metrics.totalTickets === 0) return 0;
    return Math.round((count / this.metrics.totalTickets) * 100);
  }

  getStrokeDashoffset(count: number): number {
    const percentage = this.getCategoryPercentage(count);
    const circumference = 213.63; // 2 * Math.PI * 34
    return circumference - (percentage / 100) * circumference;
  }

  getSlaAdherenceDashoffset(): number {
    const percentage = this.metrics.slaAdherenceRate;
    const circumference = 226.19; // 2 * Math.PI * 36
    return circumference - (percentage / 100) * circumference;
  }

  getRoleBadgeClass(role: string | null): string {
    switch (role) {
      case 'Manager': return 'bg-danger text-white border border-danger-subtle';
      case 'SupportEngineer': return 'bg-warning text-dark border border-warning-subtle';
      case 'Employee': return 'bg-info text-dark border border-info-subtle';
      default: return 'bg-secondary text-white';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Open': return 'status-open';
      case 'In Progress': return 'status-inprogress';
      case 'Escalated': return 'status-escalated';
      case 'Resolved': return 'status-resolved';
      default: return 'bg-secondary text-white';
    }
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'Low': return 'priority-low';
      case 'Medium': return 'priority-medium';
      case 'High': return 'priority-high';
      case 'Critical': return 'priority-critical';
      default: return 'bg-secondary';
    }
  }

  // SLA Calculation Helpers
  isSlaBreached(t: Ticket): boolean {
    if (t.status === 'Resolved' && t.resolvedAt) {
      return new Date(t.resolvedAt) > new Date(t.slaExpiresAt);
    }
    return new Date() > new Date(t.slaExpiresAt);
  }

  getSlaHoursLeft(t: Ticket): string {
    const expires = new Date(t.slaExpiresAt).getTime();
    
    let targetTime = new Date().getTime();
    if (t.status === 'Resolved' && t.resolvedAt) {
      targetTime = new Date(t.resolvedAt).getTime();
    }
    
    const diffMs = expires - targetTime;
    const isPast = diffMs < 0;
    const absDiff = Math.abs(diffMs);
    
    const hours = Math.floor(absDiff / 3600000);
    const mins = Math.floor((absDiff % 3600000) / 60000);
    
    if (isPast) {
      return `Breached by ${hours}h ${mins}m`;
    }
    return `${hours}h ${mins}m remaining`;
  }

  getSlaPercentLeft(t: Ticket): number {
    const start = new Date(t.createdAt).getTime();
    const expires = new Date(t.slaExpiresAt).getTime();
    const totalDuration = expires - start;
    
    let currentMs = new Date().getTime();
    if (t.status === 'Resolved' && t.resolvedAt) {
      currentMs = new Date(t.resolvedAt).getTime();
    }

    const elapsed = currentMs - start;
    if (elapsed <= 0) return 100;
    if (elapsed >= totalDuration) return 0;
    
    const percentLeft = Math.round(((totalDuration - elapsed) / totalDuration) * 100);
    return percentLeft;
  }

  getSlaProgressClass(t: Ticket): string {
    if (this.isSlaBreached(t)) {
      return 'bg-danger';
    }
    const percent = this.getSlaPercentLeft(t);
    if (percent < 25) {
      return 'bg-danger progress-bar-striped progress-bar-animated';
    }
    if (percent < 50) {
      return 'bg-warning';
    }
    return 'bg-success';
  }
}
