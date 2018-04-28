import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class SessionService {

  constructor(
    private router: Router,
  ) { }

  async login(email: string, password: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async logout(): Promise<void> {
    window.sessionStorage.clear();
    await this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const sessionId = window.sessionStorage.getItem('SessionId');
    return !!sessionId;
  }

  async register(email: string, password: string): Promise<void> {
    throw new Error('Not implemented');
  }

}
