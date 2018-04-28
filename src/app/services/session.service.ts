import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { CryptoService } from './crypto.service';
import { Convert } from '../utils/convert';

@Injectable()
export class SessionService {

  constructor(
    private router: Router,
    private cryptoService: CryptoService,
    private apiService: ApiService,
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
    const saltBytes: Uint8Array = this.cryptoService.cryptoRandomBytes(32);
    const salt: string = Convert.bytesToBase64(saltBytes);
    const verifier: string = await this.cryptoService.generateSrpVerifier(email, password, saltBytes);

    return await this.apiService.register(email, salt, verifier);
  }

}
