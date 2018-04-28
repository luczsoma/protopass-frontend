import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class SessionService {

  constructor(
    private router: Router,
  ) { }

  async login(email: string, password: string): Promise<boolean> {
    return false;
  }

  async logout() {
    window.sessionStorage.clear();
    await this.router.navigate(['/login']);
  }

  isLoggedIn() {
    const sessionId = window.sessionStorage.getItem('SessionId');
    return !!sessionId;
  }

}
