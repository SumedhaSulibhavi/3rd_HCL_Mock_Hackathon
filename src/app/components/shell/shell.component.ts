import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SessionUser } from '../../models/ticket.models';
import { TicketApiService } from '../../services/ticket-api.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent {
  private readonly api = inject(TicketApiService);

  readonly appName = environment.appName;
  session: SessionUser | null = this.api.getSession();

  logout(): void {
    this.api.logout();
    window.location.href = '/login';
  }

  get isEmployee(): boolean {
    return this.session?.role === 'Employee';
  }

  get isEngineer(): boolean {
    return this.session?.role === 'SupportEngineer';
  }

  get isManager(): boolean {
    return this.session?.role === 'Manager';
  }
}
