import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import * as srp from 'secure-remote-password/client';
import { AlertService } from 'ngx-alerts';

@Injectable()
export class SessionService {

  constructor(
    private router: Router,
    private api: ApiService,
    private alertService: AlertService,
  ) { }

  public get sessionId(): string | undefined {
    return sessionStorage.getItem('sessionId') || undefined;
  }

  isLoggedIn(): boolean {
    return !!this.sessionId;
  }

  public async register(email: string, password: string): Promise<void> {
    const salt: string = srp.generateSalt();
    const privateKey: string = srp.derivePrivateKey(salt, email, password);
    const verifier: string = srp.deriveVerifier(privateKey);

    return await this.api.register(email, salt, verifier);
  }

  public async login(email: string, password: string): Promise<void> {
    sessionStorage.clear();

    const clientChallenge: srp.Ephemeral = srp.generateEphemeral();
    const serverChallengeResponse: {
      salt: string;
      serverChallenge: string;
    } = await this.api.challenge(email, clientChallenge.public);

    const privateKey: string = srp.derivePrivateKey(serverChallengeResponse.salt, email, password);
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

    try {
      srp.verifySession(clientChallenge.public, clientSession, serverAuthenticateResponse.serverProof);
    } catch (e) {
      throw { type: 'LoginError', errorCode: 'ServerProofInvalid' };
    }

    sessionStorage.setItem('sessionId', serverAuthenticateResponse.sessionId);
    sessionStorage.setItem('email', email);
  }

  public async logout(): Promise<void> {
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

  public async changePassword(newPassword: string): Promise<void> {
    const currentEmail = sessionStorage.getItem('email');

    if (!currentEmail) {
      await this.logout();
      this.alertService.info('Please log in again to change your login password.');
      return;
    }

    const salt: string = srp.generateSalt();
    const privateKey: string = srp.derivePrivateKey(salt, currentEmail, newPassword);
    const verifier: string = srp.deriveVerifier(privateKey);

    return await this.api.changePassword(salt, verifier, this.sessionId!);
  }

  public async sendPasswordResetEmail(email: string): Promise<void> {
    await this.api.resetPasswordRequest(email);
  }

  public async resetPassword(id: string, email: string, newPassword: string): Promise<void> {
    const salt: string = srp.generateSalt();
    const privateKey: string = srp.derivePrivateKey(salt, email, newPassword);
    const verifier: string = srp.deriveVerifier(privateKey);
    await this.api.resetPassword(id, email, salt, verifier);
  }

}
