import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent {
  authCode = '';
  error = '';

  constructor(private router: Router, private socket: SocketService) {}

  continue() {
    if (!this.authCode.trim()) { this.error = 'Please enter an auth code.'; return; }
    sessionStorage.setItem('authCode', this.authCode.trim());
    this.socket.auth(this.authCode.trim());
    this.router.navigate(['/notes']);
  }

  onKey(e: KeyboardEvent) { if (e.key === 'Enter') this.continue(); }
}
