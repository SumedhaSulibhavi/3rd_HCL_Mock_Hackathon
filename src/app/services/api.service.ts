import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError, map, tap } from 'rxjs/operators';

// Interface definitions aligning with C# models & DTOs
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Escalated' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category: 'Software' | 'Hardware' | 'Network' | 'Other';
  createdBy: string;
  assignee: string | null;
  createdAt: string;
  slaExpiresAt: string;
  resolvedAt?: string;
  timeline: TimelineEntry[];
}

export interface TimelineEntry {
  timestamp: string;
  message: string;
  operator: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalTickets: number;
  openCount: number;
  inProgressCount: number;
  escalatedCount: number;
  resolvedCount: number;
  slaBreachedCount: number;
  slaAdherenceRate: number; // percentage
}

export interface TrendMetric {
  category: string;
  count: number;
  color: string;
}

export interface EngineerPerformance {
  name: string;
  email: string;
  assignedCount: number;
  resolvedCount: number;
  slaCompliance: number; // percentage
  status: 'Active' | 'High Load' | 'Available';
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // Configurable base backend URL (live environment.ts equivalent)
  private apiBaseUrl = 'http://localhost:5123/api';
  
  // Sleek toggle signal for Live API Mode vs Demo Sandbox Mode
  isMockMode = signal<boolean>(true);

  constructor(private http: HttpClient) {
    this.initializeMockDatabase();
  }

  // Set auth headers from localStorage
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Check if mock mode is on, or run backend request with fallback
  private handleRequest<T>(httpObs: Observable<T>, mockFn: () => T): Observable<T> {
    if (this.isMockMode()) {
      return of(mockFn()).pipe(delay(450)); // Satisfying 450ms spinner latency
    } else {
      return httpObs.pipe(
        catchError((err) => {
          console.warn('Backend endpoint unreachable, auto-falling back to sandbox mock data!', err);
          // Turn on mock mode toggle automatically to keep the UI running seamlessly
          this.isMockMode.set(true);
          return of(mockFn()).pipe(delay(450));
        })
      );
    }
  }

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================

  login(credentials: { email: string; password: string }): Observable<any> {
    const mockAction = () => {
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const user = users.find(
        (u: any) => u.email.toLowerCase() === credentials.email.toLowerCase()
      );
      
      if (!user || credentials.password !== 'Password123') {
        throw new Error('Invalid email or password. Use Password123 for demo accounts.');
      }
      
      return {
        token: `mock-jwt-token-for-${user.role.toLowerCase()}-${user.id}`,
        email: user.email,
        name: user.name,
        role: user.role,
        id: user.id
      };
    };

    if (this.isMockMode()) {
      try {
        const res = mockAction();
        return of(res).pipe(delay(400));
      } catch (err: any) {
        return throwError(() => new Error(err.message));
      }
    } else {
      return this.http.post<any>(`${this.apiBaseUrl}/Auth/login`, credentials).pipe(
        catchError((err) => {
          console.warn('Backend API connection failed, executing sandbox auth instead.');
          try {
            const res = mockAction();
            this.isMockMode.set(true);
            return of(res).pipe(delay(400));
          } catch (e: any) {
            return throwError(() => new Error(e.message));
          }
        })
      );
    }
  }

  register(userData: { name: string; email: string; role: string }): Observable<any> {
    const mockAction = () => {
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      if (users.some((u: any) => u.email.toLowerCase() === userData.email.toLowerCase())) {
        throw new Error('Email is already registered in the system database.');
      }
      
      const newUser = {
        id: `U-${users.length + 1}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };
      
      users.push(newUser);
      localStorage.setItem('mock_users', JSON.stringify(users));
      
      return {
        success: true,
        message: 'User registered successfully! You can now log in.',
      };
    };

    if (this.isMockMode()) {
      try {
        const res = mockAction();
        return of(res).pipe(delay(400));
      } catch (err: any) {
        return throwError(() => new Error(err.message));
      }
    } else {
      return this.http.post<any>(`${this.apiBaseUrl}/Auth/register`, userData).pipe(
        catchError((err) => {
          console.warn('Backend API failed, calling sandbox registration.');
          try {
            const res = mockAction();
            this.isMockMode.set(true);
            return of(res).pipe(delay(400));
          } catch (e: any) {
            return throwError(() => new Error(e.message));
          }
        })
      );
    }
  }

  // ==========================================
  // TICKET API ENDPOINTS
  // ==========================================

  getTickets(): Observable<Ticket[]> {
    return this.handleRequest<Ticket[]>(
      this.http.get<Ticket[]>(`${this.apiBaseUrl}/Ticket`, { headers: this.getHeaders() }),
      () => {
        const tickets = JSON.parse(localStorage.getItem('mock_tickets') || '[]');
        // Refresh SLA breach flags dynamically on retrieval
        return tickets.map((t: Ticket) => this.checkSlaBreach(t));
      }
    );
  }

  getTicketById(id: string): Observable<Ticket> {
    return this.handleRequest<Ticket>(
      this.http.get<Ticket>(`${this.apiBaseUrl}/Ticket/${id}`, { headers: this.getHeaders() }),
      () => {
        const tickets = JSON.parse(localStorage.getItem('mock_tickets') || '[]');
        const ticket = tickets.find((t: Ticket) => t.id === id);
        if (!ticket) {
          throw new Error('Ticket not found');
        }
        return this.checkSlaBreach(ticket);
      }
    );
  }

  createTicket(ticketData: { title: string; description: string; priority: any; category: any; email: string }): Observable<Ticket> {
    const mockAction = () => {
      const tickets = JSON.parse(localStorage.getItem('mock_tickets') || '[]');
      const newId = `T-${1000 + tickets.length + 1}`;
      
      // Strict SLA calculations based on priority
      const now = new Date();
      let slaHours = 72; // Low default
      if (ticketData.priority === 'Medium') slaHours = 48;
      else if (ticketData.priority === 'High') slaHours = 12;
      else if (ticketData.priority === 'Critical') slaHours = 4; // 4 hour SLA as per blueprints
      
      const expires = new Date(now.getTime() + slaHours * 3600000);
      
      const newTicket: Ticket = {
        id: newId,
        title: ticketData.title,
        description: ticketData.description,
        status: 'Open',
        priority: ticketData.priority,
        category: ticketData.category,
        createdBy: ticketData.email,
        assignee: null,
        createdAt: now.toISOString(),
        slaExpiresAt: expires.toISOString(),
        timeline: [
          {
            timestamp: now.toISOString(),
            message: `Ticket initialized successfully under ${ticketData.priority} priority. SLA target set to ${slaHours} hours.`,
            operator: ticketData.email,
          },
        ],
      };
      
      tickets.unshift(newTicket); // Newest first
      localStorage.setItem('mock_tickets', JSON.stringify(tickets));
      return newTicket;
    };

    if (this.isMockMode()) {
      return of(mockAction()).pipe(delay(500));
    } else {
      return this.http.post<Ticket>(`${this.apiBaseUrl}/Ticket`, ticketData, { headers: this.getHeaders() }).pipe(
        catchError(() => {
          this.isMockMode.set(true);
          return of(mockAction()).pipe(delay(500));
        })
      );
    }
  }

  assignTicket(ticketId: string, assigneeEmail: string, operatorName: string): Observable<Ticket> {
    const mockAction = () => {
      const tickets = JSON.parse(localStorage.getItem('mock_tickets') || '[]');
      const index = tickets.findIndex((t: Ticket) => t.id === ticketId);
      if (index === -1) throw new Error('Ticket not found');
      
      const ticket = tickets[index];
      ticket.assignee = assigneeEmail;
      if (ticket.status === 'Open') {
        ticket.status = 'In Progress';
      }
      
      const now = new Date().toISOString();
      ticket.timeline.push({
        timestamp: now,
        message: `Assigned to Support Engineer (${assigneeEmail}). Status updated to In Progress.`,
        operator: operatorName,
      });
      
      tickets[index] = ticket;
      localStorage.setItem('mock_tickets', JSON.stringify(tickets));
      
      // Auto seed system comments too
      this.addCommentMockDirect(ticketId, `System: Assigned to engineer ${assigneeEmail}. Core analysis initiated.`, 'System');
      
      return ticket;
    };

    if (this.isMockMode()) {
      return of(mockAction()).pipe(delay(400));
    } else {
      return this.http.patch<Ticket>(`${this.apiBaseUrl}/Ticket/${ticketId}/assign`, { assigneeEmail }, { headers: this.getHeaders() }).pipe(
        catchError(() => {
          this.isMockMode.set(true);
          return of(mockAction()).pipe(delay(400));
        })
      );
    }
  }

  escalateTicket(ticketId: string, operatorName: string): Observable<Ticket> {
    const mockAction = () => {
      const tickets = JSON.parse(localStorage.getItem('mock_tickets') || '[]');
      const index = tickets.findIndex((t: Ticket) => t.id === ticketId);
      if (index === -1) throw new Error('Ticket not found');
      
      const ticket = tickets[index];
      ticket.status = 'Escalated';
      
      const now = new Date().toISOString();
      ticket.timeline.push({
        timestamp: now,
        message: `Ticket escalated to Level 2 tier support hierarchy. SLA alarms notified.`,
        operator: operatorName,
      });
      
      tickets[index] = ticket;
      localStorage.setItem('mock_tickets', JSON.stringify(tickets));
      
      this.addCommentMockDirect(ticketId, `System Alarm: Incident manually escalated by system administrator ${operatorName}.`, 'System');
      
      return ticket;
    };

    if (this.isMockMode()) {
      return of(mockAction()).pipe(delay(400));
    } else {
      return this.http.patch<Ticket>(`${this.apiBaseUrl}/Ticket/${ticketId}/escalate`, {}, { headers: this.getHeaders() }).pipe(
        catchError(() => {
          this.isMockMode.set(true);
          return of(mockAction()).pipe(delay(400));
        })
      );
    }
  }

  resolveTicket(ticketId: string, operatorName: string): Observable<Ticket> {
    // Standard patch fallback using mock
    const mockAction = () => {
      const tickets = JSON.parse(localStorage.getItem('mock_tickets') || '[]');
      const index = tickets.findIndex((t: Ticket) => t.id === ticketId);
      if (index === -1) throw new Error('Ticket not found');
      
      const ticket = tickets[index];
      ticket.status = 'Resolved';
      ticket.resolvedAt = new Date().toISOString();
      
      ticket.timeline.push({
        timestamp: ticket.resolvedAt,
        message: `Incident successfully resolved. User confirmation pending.`,
        operator: operatorName,
      });
      
      tickets[index] = ticket;
      localStorage.setItem('mock_tickets', JSON.stringify(tickets));
      
      this.addCommentMockDirect(ticketId, `Resolution Alert: Service has been restored. Please verify and close if fully operational.`, operatorName);
      
      return ticket;
    };

    // Note: C# endpoint could just use a patch assign or custom resolve controller. We map it safely.
    return this.handleRequest<Ticket>(
      this.http.patch<Ticket>(`${this.apiBaseUrl}/Ticket/${ticketId}/resolve`, {}, { headers: this.getHeaders() }),
      mockAction
    );
  }

  // ==========================================
  // COMMENTS API ENDPOINTS
  // ==========================================

  getComments(ticketId: string): Observable<TicketComment[]> {
    return this.handleRequest<TicketComment[]>(
      this.http.get<TicketComment[]>(`${this.apiBaseUrl}/Comment/ticket/${ticketId}`, { headers: this.getHeaders() }),
      () => {
        const comments = JSON.parse(localStorage.getItem('mock_comments') || '[]');
        return comments.filter((c: TicketComment) => c.ticketId === ticketId);
      }
    );
  }

  addComment(commentData: { ticketId: string; content: string; author: string }): Observable<TicketComment> {
    const mockAction = () => {
      const comments = JSON.parse(localStorage.getItem('mock_comments') || '[]');
      const newComment: TicketComment = {
        id: `C-${Date.now()}`,
        ticketId: commentData.ticketId,
        content: commentData.content,
        author: commentData.author,
        createdAt: new Date().toISOString(),
      };
      comments.push(newComment);
      localStorage.setItem('mock_comments', JSON.stringify(comments));
      
      // Update ticket timeline to reflect comment addition
      const tickets = JSON.parse(localStorage.getItem('mock_tickets') || '[]');
      const idx = tickets.findIndex((t: Ticket) => t.id === commentData.ticketId);
      if (idx !== -1) {
        tickets[idx].timeline.push({
          timestamp: newComment.createdAt,
          message: `User commented: "${commentData.content.substring(0, 45)}${commentData.content.length > 45 ? '...' : ''}"`,
          operator: commentData.author,
        });
        localStorage.setItem('mock_tickets', JSON.stringify(tickets));
      }
      
      return newComment;
    };

    if (this.isMockMode()) {
      return of(mockAction()).pipe(delay(350));
    } else {
      return this.http.post<TicketComment>(`${this.apiBaseUrl}/Comment`, commentData, { headers: this.getHeaders() }).pipe(
        catchError(() => {
          this.isMockMode.set(true);
          return of(mockAction()).pipe(delay(350));
        })
      );
    }
  }

  private addCommentMockDirect(ticketId: string, content: string, author: string) {
    const comments = JSON.parse(localStorage.getItem('mock_comments') || '[]');
    comments.push({
      id: `C-${Date.now()}-${Math.random()}`,
      ticketId,
      content,
      author,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('mock_comments', JSON.stringify(comments));
  }

  // ==========================================
  // ANALYTICS API ENDPOINTS
  // ==========================================

  getDashboardMetrics(): Observable<DashboardMetrics> {
    return this.handleRequest<DashboardMetrics>(
      this.http.get<DashboardMetrics>(`${this.apiBaseUrl}/Analytics/dashboard`, { headers: this.getHeaders() }),
      () => {
        const tickets = JSON.parse(localStorage.getItem('mock_tickets') || '[]').map((t: Ticket) => this.checkSlaBreach(t));
        const total = tickets.length;
        
        const open = tickets.filter((t: Ticket) => t.status === 'Open').length;
        const progress = tickets.filter((t: Ticket) => t.status === 'In Progress').length;
        const escalated = tickets.filter((t: Ticket) => t.status === 'Escalated').length;
        const resolved = tickets.filter((t: Ticket) => t.status === 'Resolved').length;
        
        const breached = tickets.filter((t: Ticket) => {
          const now = new Date();
          const limit = new Date(t.slaExpiresAt);
          // Has breached if status is not resolved and now > limit
          const unresolvedBreach = t.status !== 'Resolved' && now > limit;
          // Or breached before resolution
          const resolvedBreach = t.status === 'Resolved' && t.resolvedAt && new Date(t.resolvedAt) > limit;
          return unresolvedBreach || resolvedBreach;
        }).length;
        
        const compliance = total > 0 ? Math.round(((total - breached) / total) * 100) : 100;
        
        return {
          totalTickets: total,
          openCount: open,
          inProgressCount: progress,
          escalatedCount: escalated,
          resolvedCount: resolved,
          slaBreachedCount: breached,
          slaAdherenceRate: compliance,
        };
      }
    );
  }

  getTrends(): Observable<TrendMetric[]> {
    return this.handleRequest<TrendMetric[]>(
      this.http.get<TrendMetric[]>(`${this.apiBaseUrl}/Analytics/trends`, { headers: this.getHeaders() }),
      () => {
        const tickets = JSON.parse(localStorage.getItem('mock_tickets') || '[]');
        
        const counts = { Software: 0, Hardware: 0, Network: 0, Other: 0 };
        tickets.forEach((t: Ticket) => {
          if (counts.hasOwnProperty(t.category)) {
            counts[t.category]++;
          }
        });

        return [
          { category: 'Software Incidents', count: counts.Software, color: '#38bdf8' },
          { category: 'Hardware Troubles', count: counts.Hardware, color: '#eab308' },
          { category: 'Network Failures', count: counts.Network, color: '#ef4444' },
          { category: 'Other Inquiries', count: counts.Other, color: '#a78bfa' },
        ];
      }
    );
  }

  getEngineerPerformance(): Observable<EngineerPerformance[]> {
    return this.handleRequest<EngineerPerformance[]>(
      this.http.get<EngineerPerformance[]>(`${this.apiBaseUrl}/Analytics/engineer-performance`, { headers: this.getHeaders() }),
      () => {
        const tickets = JSON.parse(localStorage.getItem('mock_tickets') || '[]').map((t: Ticket) => this.checkSlaBreach(t));
        
        // Let's count workload details for engineer@hcl.com and other simulated engineers
        const mainEngTickets = tickets.filter((t: Ticket) => t.assignee === 'engineer@hcl.com');
        const mainResolved = mainEngTickets.filter((t: Ticket) => t.status === 'Resolved').length;
        const mainBreached = mainEngTickets.filter((t: Ticket) => {
          const limit = new Date(t.slaExpiresAt);
          const unresolvedBreach = t.status !== 'Resolved' && new Date() > limit;
          const resolvedBreach = t.status === 'Resolved' && t.resolvedAt && new Date(t.resolvedAt) > limit;
          return unresolvedBreach || resolvedBreach;
        }).length;
        const mainCompliance = mainEngTickets.length > 0 ? Math.round(((mainEngTickets.length - mainBreached) / mainEngTickets.length) * 100) : 95;

        return [
          {
            name: 'Bob Jones',
            email: 'engineer@hcl.com',
            assignedCount: mainEngTickets.length,
            resolvedCount: mainResolved,
            slaCompliance: mainCompliance,
            status: mainEngTickets.filter((t: Ticket) => t.status !== 'Resolved').length > 3 ? 'High Load' : 'Active',
          },
          {
            name: 'Sarah Connor',
            email: 'sarah.c@hcl.com',
            assignedCount: 4,
            resolvedCount: 3,
            slaCompliance: 100,
            status: 'Available',
          },
          {
            name: 'David Lightman',
            email: 'd.lightman@hcl.com',
            assignedCount: 3,
            resolvedCount: 1,
            slaCompliance: 66,
            status: 'Active',
          },
        ];
      }
    );
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private checkSlaBreach(ticket: Ticket): Ticket {
    const now = new Date();
    const limit = new Date(ticket.slaExpiresAt);
    
    // Check if breached unresolved, or breached before resolution
    const hasBreached = ticket.status !== 'Resolved'
      ? now > limit
      : ticket.resolvedAt ? new Date(ticket.resolvedAt) > limit : false;
      
    // Check if timeline already has SLA breach record. If not, inject it!
    if (hasBreached && !ticket.timeline.some((e) => e.message.includes('SLA Breach Alert'))) {
      ticket.timeline.push({
        timestamp: ticket.slaExpiresAt,
        message: `SLA Breach Alert: Resolution window exceeded structural target limit.`,
        operator: 'System',
      });
      // Save it back to local database
      const tickets = JSON.parse(localStorage.getItem('mock_tickets') || '[]');
      const index = tickets.findIndex((t: Ticket) => t.id === ticket.id);
      if (index !== -1) {
        tickets[index] = ticket;
        localStorage.setItem('mock_tickets', JSON.stringify(tickets));
      }
    }
    return ticket;
  }

  private initializeMockDatabase() {
    // 1. Initial Mock Users
    if (!localStorage.getItem('mock_users')) {
      const initialUsers = [
        { id: 'U-1', name: 'Alice Smith', email: 'employee@hcl.com', role: 'Employee' },
        { id: 'U-2', name: 'Bob Jones', email: 'engineer@hcl.com', role: 'SupportEngineer' },
        { id: 'U-3', name: 'Charlie Davis', email: 'manager@hcl.com', role: 'Manager' },
      ];
      localStorage.setItem('mock_users', JSON.stringify(initialUsers));
    }

    // 2. Initial Mock Tickets (8 baseline mapping out statuses from Open to Escalated)
    if (!localStorage.getItem('mock_tickets')) {
      const now = new Date();
      
      const t1: Ticket = {
        id: 'T-1001',
        title: 'Network slowdown in building B',
        description: 'Wi-Fi connectivity drops every few minutes. Impacting core department productivity.',
        status: 'Open',
        priority: 'High',
        category: 'Network',
        createdBy: 'employee@hcl.com',
        assignee: null,
        createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(), // 24 hours ago
        slaExpiresAt: new Date(now.getTime() - 12 * 3600000).toISOString(), // high = 12h SLA, expired 12h ago!
        timeline: [
          {
            timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(),
            message: 'Ticket initialized successfully under High priority. SLA target set to 12 hours.',
            operator: 'employee@hcl.com',
          },
        ],
      };

      const t2: Ticket = {
        id: 'T-1002',
        title: 'Database connection pool exhaustion',
        description: 'Connection pool exhausted on DB-01 server. Critical service interruption.',
        status: 'Escalated',
        priority: 'Critical',
        category: 'Software',
        createdBy: 'employee@hcl.com',
        assignee: 'engineer@hcl.com',
        createdAt: new Date(now.getTime() - 5 * 3600000).toISOString(), // 5 hours ago
        slaExpiresAt: new Date(now.getTime() - 1 * 3600000).toISOString(), // critical = 4h SLA, expired 1h ago!
        timeline: [
          {
            timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(),
            message: 'Ticket initialized successfully under Critical priority. SLA target set to 4 hours.',
            operator: 'employee@hcl.com',
          },
          {
            timestamp: new Date(now.getTime() - 4.5 * 3600000).toISOString(),
            message: 'Assigned to Support Engineer (engineer@hcl.com). Status updated to In Progress.',
            operator: 'System',
          },
          {
            timestamp: new Date(now.getTime() - 3 * 3600000).toISOString(),
            message: 'User commented: "Investigating connection pools. Re-routing requests."',
            operator: 'engineer@hcl.com',
          },
          {
            timestamp: new Date(now.getTime() - 1 * 3600000).toISOString(),
            message: 'SLA Breach Alert: Resolution window exceeded structural target limit.',
            operator: 'System',
          },
          {
            timestamp: new Date(now.getTime() - 0.8 * 3600000).toISOString(),
            message: 'Ticket escalated to Level 2 tier support hierarchy. SLA alarms notified.',
            operator: 'Charlie Davis',
          },
        ],
      };

      const t3: Ticket = {
        id: 'T-1003',
        title: 'Laptop keyboard malfunctioning',
        description: 'Several keys are stuck and unresponsive. Replacing keyboard requested.',
        status: 'In Progress',
        priority: 'Medium',
        category: 'Hardware',
        createdBy: 'employee@hcl.com',
        assignee: 'engineer@hcl.com',
        createdAt: new Date(now.getTime() - 48 * 3600000).toISOString(),
        slaExpiresAt: new Date(now.getTime() + 24 * 3600000).toISOString(), // Medium = 72h SLA, expires in 24h
        timeline: [
          {
            timestamp: new Date(now.getTime() - 48 * 3600000).toISOString(),
            message: 'Ticket initialized successfully under Medium priority. SLA target set to 72 hours.',
            operator: 'employee@hcl.com',
          },
          {
            timestamp: new Date(now.getTime() - 36 * 3600000).toISOString(),
            message: 'Assigned to Support Engineer (engineer@hcl.com). Status updated to In Progress.',
            operator: 'System',
          },
        ],
      };

      const t4: Ticket = {
        id: 'T-1004',
        title: 'VPN tunnel failure',
        description: 'Cannot connect to corporate VPN from remote locations.',
        status: 'Resolved',
        priority: 'High',
        category: 'Network',
        createdBy: 'employee@hcl.com',
        assignee: 'engineer@hcl.com',
        createdAt: new Date(now.getTime() - 8 * 3600000).toISOString(),
        slaExpiresAt: new Date(now.getTime() + 4 * 3600000).toISOString(), // 12h SLA
        resolvedAt: new Date(now.getTime() - 2 * 3600000).toISOString(), // Resolved after 6h (within SLA!)
        timeline: [
          {
            timestamp: new Date(now.getTime() - 8 * 3600000).toISOString(),
            message: 'Ticket initialized successfully under High priority. SLA target set to 12 hours.',
            operator: 'employee@hcl.com',
          },
          {
            timestamp: new Date(now.getTime() - 7.5 * 3600000).toISOString(),
            message: 'Assigned to Support Engineer (engineer@hcl.com). Status updated to In Progress.',
            operator: 'System',
          },
          {
            timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
            message: 'Incident successfully resolved. User confirmation pending.',
            operator: 'engineer@hcl.com',
          },
        ],
      };

      const t5: Ticket = {
        id: 'T-1005',
        title: 'Active Directory password reset locked out',
        description: 'Employee account is locked after multiple incorrect login attempts.',
        status: 'Resolved',
        priority: 'Low',
        category: 'Other',
        createdBy: 'employee@hcl.com',
        assignee: 'engineer@hcl.com',
        createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
        slaExpiresAt: new Date(now.getTime() + 70 * 3600000).toISOString(), // Low = 72h SLA
        resolvedAt: new Date(now.getTime() - 1.5 * 3600000).toISOString(), // Resolved after 30 mins
        timeline: [
          {
            timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
            message: 'Ticket initialized successfully under Low priority. SLA target set to 72 hours.',
            operator: 'employee@hcl.com',
          },
          {
            timestamp: new Date(now.getTime() - 1.8 * 3600000).toISOString(),
            message: 'Assigned to Support Engineer (engineer@hcl.com). Status updated to In Progress.',
            operator: 'System',
          },
          {
            timestamp: new Date(now.getTime() - 1.5 * 3600000).toISOString(),
            message: 'Incident successfully resolved. User confirmation pending.',
            operator: 'engineer@hcl.com',
          },
        ],
      };

      const t6: Ticket = {
        id: 'T-1006',
        title: 'Software package license procurement',
        description: 'Visual Studio Enterprise licenses requested for the new dev squad.',
        status: 'Open',
        priority: 'Medium',
        category: 'Software',
        createdBy: 'employee@hcl.com',
        assignee: null,
        createdAt: new Date(now.getTime() - 4 * 3600000).toISOString(),
        slaExpiresAt: new Date(now.getTime() + 68 * 3600000).toISOString(), // 72h SLA
        timeline: [
          {
            timestamp: new Date(now.getTime() - 4 * 3600000).toISOString(),
            message: 'Ticket initialized successfully under Medium priority. SLA target set to 72 hours.',
            operator: 'employee@hcl.com',
          },
        ],
      };

      const t7: Ticket = {
        id: 'T-1007',
        title: 'Printer offline in room 302',
        description: 'Paper jam resolved but device status remains offline in the spooler.',
        status: 'In Progress',
        priority: 'Low',
        category: 'Hardware',
        createdBy: 'employee@hcl.com',
        assignee: 'engineer@hcl.com',
        createdAt: new Date(now.getTime() - 12 * 3600000).toISOString(),
        slaExpiresAt: new Date(now.getTime() + 60 * 3600000).toISOString(), // 72h SLA
        timeline: [
          {
            timestamp: new Date(now.getTime() - 12 * 3600000).toISOString(),
            message: 'Ticket initialized successfully under Low priority. SLA target set to 72 hours.',
            operator: 'employee@hcl.com',
          },
          {
            timestamp: new Date(now.getTime() - 11.5 * 3600000).toISOString(),
            message: 'Assigned to Support Engineer (engineer@hcl.com). Status updated to In Progress.',
            operator: 'System',
          },
        ],
      };

      const t8: Ticket = {
        id: 'T-1008',
        title: 'Memory leak in web API production instance',
        description: 'Critical memory buildup leading to container crashes every 6 hours. High SLA visibility.',
        status: 'Escalated',
        priority: 'Critical',
        category: 'Software',
        createdBy: 'employee@hcl.com',
        assignee: 'engineer@hcl.com',
        createdAt: new Date(now.getTime() - 3 * 3600000).toISOString(), // 3 hours ago
        slaExpiresAt: new Date(now.getTime() + 1 * 3600000).toISOString(), // expires in 1 hour
        timeline: [
          {
            timestamp: new Date(now.getTime() - 3 * 3600000).toISOString(),
            message: 'Ticket initialized successfully under Critical priority. SLA target set to 4 hours.',
            operator: 'employee@hcl.com',
          },
          {
            timestamp: new Date(now.getTime() - 2.8 * 3600000).toISOString(),
            message: 'Assigned to Support Engineer (engineer@hcl.com). Status updated to In Progress.',
            operator: 'System',
          },
          {
            timestamp: new Date(now.getTime() - 1.2 * 3600000).toISOString(),
            message: 'Ticket escalated to Level 2 tier support hierarchy. SLA alarms notified.',
            operator: 'Charlie Davis',
          },
        ],
      };

      localStorage.setItem('mock_tickets', JSON.stringify([t1, t2, t3, t4, t5, t6, t7, t8]));
    }

    // 3. Initial Mock Comments
    if (!localStorage.getItem('mock_comments')) {
      const now = new Date();
      const initialComments = [
        {
          id: 'C-1',
          ticketId: 'T-1002',
          content: 'We are seeing database pool exhaustion errors on server DB-01.',
          author: 'employee@hcl.com',
          createdAt: new Date(now.getTime() - 5 * 3600000).toISOString(),
        },
        {
          id: 'C-2',
          ticketId: 'T-1002',
          content: 'Investigating connection pools. Re-routing backend requests to standby DB.',
          author: 'engineer@hcl.com',
          createdAt: new Date(now.getTime() - 3 * 3600000).toISOString(),
        },
        {
          id: 'C-3',
          ticketId: 'T-1004',
          content: 'VPN tunnel dropped in server group APAC-01.',
          author: 'employee@hcl.com',
          createdAt: new Date(now.getTime() - 8 * 3600000).toISOString(),
        },
        {
          id: 'C-4',
          ticketId: 'T-1004',
          content: 'Tunnel rebooted and security headers verified. Please re-test VPN.',
          author: 'engineer@hcl.com',
          createdAt: new Date(now.getTime() - 2.5 * 3600000).toISOString(),
        },
        {
          id: 'C-5',
          ticketId: 'T-1004',
          content: 'Verified VPN connectivity. High speed channel is open. Ticket resolved.',
          author: 'employee@hcl.com',
          createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
        },
      ];
      localStorage.setItem('mock_comments', JSON.stringify(initialComments));
    }
  }
}
