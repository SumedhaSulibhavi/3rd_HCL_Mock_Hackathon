import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthResponse,
  CreateCommentRequest,
  CreateTicketRequest,
  DashboardAnalytics,
  LoginRequest,
  RegisterRequest,
  SessionUser,
  Ticket,
  TicketComment,
  UpdateTicketRequest,
  UserRole,
} from '../models/ticket.models';

const STORAGE_KEY = 'nexusdesk_session';

@Injectable({ providedIn: 'root' })
export class TicketApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/login`, body)
      .pipe(tap((res) => this.persistSession(res)));
  }

  register(body: RegisterRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/auth/register`, body);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  getSession(): SessionUser | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SessionUser;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getSession()?.token;
  }

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/ticket`, {
      headers: this.authHeaders(),
    });
  }

  getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/ticket/${id}`, {
      headers: this.authHeaders(),
    });
  }

  createTicket(body: CreateTicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.baseUrl}/ticket`, body, {
      headers: this.authHeaders(),
    });
  }

  updateTicket(id: number, body: UpdateTicketRequest): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.baseUrl}/ticket/${id}`, body, {
      headers: this.authHeaders(),
    });
  }

  getComments(ticketId: number): Observable<TicketComment[]> {
    return this.http.get<TicketComment[]>(
      `${this.baseUrl}/comment/ticket/${ticketId}`,
      { headers: this.authHeaders() },
    );
  }

  addComment(body: CreateCommentRequest): Observable<TicketComment> {
    return this.http.post<TicketComment>(`${this.baseUrl}/comment`, body, {
      headers: this.authHeaders(),
    });
  }

  getManagerDashboard(): Observable<DashboardAnalytics> {
    return this.http.get<DashboardAnalytics>(
      `${this.baseUrl}/analytics/dashboard`,
      { headers: this.authHeaders() },
    );
  }

  private authHeaders(): HttpHeaders {
    const token = this.getSession()?.token;
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  private persistSession(res: AuthResponse): void {
    const session: SessionUser = {
      token: res.token,
      userId: res.userId,
      username: res.username,
      role: res.role as UserRole,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
}
