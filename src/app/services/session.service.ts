import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { CryptoService } from './crypto.service';
import { Convert } from '../utils/convert';
import * as srp from 'secure-remote-password/client';

@Injectable()
export class SessionService {

  constructor(
    private router: Router,
    private cryptoService: CryptoService,
    private api: ApiService,
  ) { }

  public get sessionId(): string | undefined {
    return sessionStorage.getItem('sessionId') || undefined;
  }

  isLoggedIn(): boolean {
    return !!this.sessionId;
  }

  async register(email: string, password: string): Promise<void> {
    const saltBytes: Uint8Array = this.cryptoService.cryptoRandomBytes(32);
    const salt: string = Convert.bytesToBase64(saltBytes);
    const verifier: string = await this.cryptoService.generateSrpVerifier(email, password, saltBytes);

    return await this.api.register(email, salt, verifier);
  }

  async login(email: string, password: string): Promise<void> {
    const clientChallenge: srp.Ephemeral = srp.generateEphemeral();
    const serverChallengeResponse: {
      salt: string;
      serverChallenge: string;
    } = await this.api.challenge(email, clientChallenge.public);

    const saltBytes: Uint8Array = Convert.base64ToBytes(serverChallengeResponse.salt);
    const privateKey: string = await this.cryptoService.deriveSrpPrivateKey(email, password, saltBytes);
    const clientSession: srp.Session = srp.deriveSession(
      clientChallenge.secret,
      serverChallengeResponse.serverChallenge,
      serverChallengeResponse.salt,
      email,
      privateKey,
    );

    const serverAuthenticateResponse: {
      serverProof: string;
      sessionId: string;
    } = await this.api.authenticate(email, clientSession.proof);

    srp.verifySession(clientChallenge.public, clientSession, serverAuthenticateResponse.serverProof);
  }

  async logout(): Promise<void> {
    try {
      if (this.isLoggedIn()) {
        await this.api.logout(this.sessionId!);
      }
    } catch (e) {
      // do not handle, the sessionId will be cleared anyways
    } finally {
      sessionStorage.clear();
      await this.router.navigate(['/login']);
    }
  }

}
