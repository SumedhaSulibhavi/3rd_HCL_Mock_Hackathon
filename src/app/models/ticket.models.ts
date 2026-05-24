export type UserRole = 'Employee' | 'SupportEngineer' | 'Manager';

export const TICKET_CATEGORIES = [
  'SoftwareIssue',
  'HardwareComplaint',
  'NetworkIncident',
  'AccessRequest',
  'Other',
] as const;

export const TICKET_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;

export const TICKET_STATUSES = [
  'Open',
  'InProgress',
  'Escalated',
  'Resolved',
  'Closed',
] as const;

export const USER_ROLES: UserRole[] = ['Employee', 'SupportEngineer', 'Manager'];

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  slaDueDate: string;
  employeeId: number;
  employee?: UserSummary | null;
  resolvedAt?: string | null;
  isSLABreached?: boolean;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  category: string;
  priority: string;
  employeeId: number;
}

export interface UpdateTicketRequest {
  title: string;
  description: string;
  priority: string;
  status: string;
}

export interface TicketComment {
  id: number;
  ticketId: number;
  userId: number;
  commentText: string;
  createdAt: string;
}

export interface CreateCommentRequest {
  ticketId: number;
  userId: number;
  commentText: string;
}

export interface DashboardAnalytics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  slaBreached: number;
  categoryStats: { category: string; count: number }[];
}

export interface SessionUser {
  token: string;
  userId: number;
  username: string;
  role: UserRole;
}
