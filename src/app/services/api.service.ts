import { Injectable } from '@angular/core';
import { ServerApiError } from '../models/serverApiError.model';

declare type ServerApiRequestMethod = 'GET' | 'POST' | 'PUT';

@Injectable()
export class ApiService {

  private static readonly baseUrl = 'https://protopass-backend.azurewebsites.net/api';

  constructor() { }

  private async call<T>(
    endpointName: USVString,
    queryParams: Map<string, any>,
    method: ServerApiRequestMethod,
    body: string | undefined,
    headers: Map<string, string>,
  ): Promise<T> {
    const requestInit: RequestInit = {
      body,
      headers: Array.from(headers),
      method,
      mode: 'cors',
    };
    const queryParamsString: USVString = this.getQueryParamsString(queryParams);
    const requestUri: USVString = `${ApiService.baseUrl}/${endpointName}${queryParamsString}`;
    const request = new Request(requestUri, requestInit);

    const response: Response = await fetch(request);
    if (response.ok) {
      return await response.json();
    } else {
      const errorResponse = await response.json();
      throw new ServerApiError(endpointName, errorResponse.error);
    }
  }

  private getQueryParamsString(queryParams: Map<string, any>): string {
    const urlSearchParams: URLSearchParams = new URLSearchParams();
    queryParams.forEach((v: any, k: string) => urlSearchParams.set(k, v.toString()));
    const asString: string = urlSearchParams.toString();
    return asString.length > 0 ? `?${asString}` : '';
  }

  public async register(email: string, salt: string, verifier: string): Promise<void> {
    const endpointName: USVString = 'register';
    const queryParams: Map<string, any> = new Map<string, any>();
    const method: ServerApiRequestMethod = 'POST';
    const body: string | undefined = JSON.stringify({
      email,
      salt,
      verifier,
    });
    const headers: Map<string, string> = new Map<string, string>();

    return await this.call<void>(endpointName, queryParams, method, body, headers);
  }

  public async validate(email: string, id: string): Promise<void> {
    const endpointName: USVString = 'validate';
    const queryParams: Map<string, any> = new Map<string, any>([
      ['email', email],
      ['id', id],
    ]);
    const method: ServerApiRequestMethod = 'GET';
    const body: string | undefined = undefined;
    const headers: Map<string, string> = new Map<string, string>();

    return await this.call<void>(endpointName, queryParams, method, body, headers);
  }

  public async challenge(email: string, clientChallenge: string): Promise<{
    salt: string;
    serverChallenge: string;
  }> {
    const endpointName: USVString = 'challenge';
    const queryParams: Map<string, any> = new Map<string, any>([]);
    const method: ServerApiRequestMethod = 'POST';
    const body: string | undefined = JSON.stringify({
      email: email,
      clientChallenge: clientChallenge,
    });
    const headers: Map<string, string> = new Map<string, string>();

    return await this.call<{
      salt: string,
      serverChallenge: string,
    }>(endpointName, queryParams, method, body, headers);
  }

  public async authenticate(email: string, clientProof: string): Promise<{
    serverProof: string;
    sessionId: string;
  }> {
    const endpointName: USVString = 'authenticate';
    const queryParams: Map<string, any> = new Map<string, any>([]);
    const method: ServerApiRequestMethod = 'POST';
    const body: string | undefined = JSON.stringify({
      email: email,
      clientProof: clientProof,
    });
    const headers: Map<string, string> = new Map<string, string>();

    return await this.call<{
      serverProof: string;
      sessionId: string;
    }>(endpointName, queryParams, method, body, headers);
  }

  public async logout(sessionId: string): Promise<void> {
    const endpointName: USVString = 'logout';
    const queryParams: Map<string, any> = new Map<string, any>([]);
    const method: ServerApiRequestMethod = 'GET';
    const body: string | undefined = undefined;
    const headers: Map<string, string> = new Map<string, string>([
      ['Authorization', `LoginSession ${sessionId}`],
    ]);

    return await this.call<void>(endpointName, queryParams, method, body, headers);
  }

  public async downloadUserProfile(sessionId: string): Promise<{
    encryptedUserProfile: string;
    containerKeySalt: string;
    initializationVector: string;
  }> {
    const endpointName: USVString = 'downloadUserProfile';
    const queryParams: Map<string, any> = new Map<string, any>([]);
    const method: ServerApiRequestMethod = 'GET';
    const body: string | undefined = undefined;
    const headers: Map<string, string> = new Map<string, string>([
      ['Authorization', `LoginSession ${sessionId}`],
    ]);

    return await this.call<{
      encryptedUserProfile: string,
      containerKeySalt: string,
      initializationVector: string,
    }>(endpointName, queryParams, method, body, headers);
  }

  public async uploadUserProfile(
    encryptedUserProfile: string,
    containerKeySalt: string,
    initializationVector: string,
    sessionId: string,
  ): Promise<void> {
    const endpointName: USVString = 'uploadUserProfile';
    const queryParams: Map<string, any> = new Map<string, any>([]);
    const method: ServerApiRequestMethod = 'PUT';
    const body: string | undefined = JSON.stringify({
      encryptedUserProfile: encryptedUserProfile,
      containerKeySalt: containerKeySalt,
      initializationVector: initializationVector,
    });
    const headers: Map<string, string> = new Map<string, string>([
      ['Authorization', `LoginSession ${sessionId}`],
    ]);

    return await this.call<void>(endpointName, queryParams, method, body, headers);
  }

  public async getStorageKey(forceFresh: boolean, sessionId: string): Promise<{
    containerPasswordStorageKey: string;
  }> {
    const endpointName: USVString = 'getStorageKey';
    const queryParams: Map<string, any> = new Map<string, any>([]);
    const method: ServerApiRequestMethod = 'GET';
    const body: string | undefined = undefined;
    const headers: Map<string, string> = new Map<string, string>([
      ['Authorization', `LoginSession ${sessionId}`],
    ]);

    return await this.call<{
      containerPasswordStorageKey: string,
    }>(endpointName, queryParams, method, body, headers);
  }

  public async changePassword(salt: string, verifier: string, sessionId: string): Promise<void> {
    const endpointName: USVString = 'changePassword';
    const queryParams: Map<string, any> = new Map<string, any>([]);
    const method: ServerApiRequestMethod = 'POST';
    const body: string | undefined = JSON.stringify({
      salt: salt,
      verifier: verifier,
    });
    const headers: Map<string, string> = new Map<string, string>([
      ['Authorization', `LoginSession ${sessionId}`],
    ]);

    return await this.call<void>(endpointName, queryParams, method, body, headers);
  }

  public async resetPasswordRequest(email: string): Promise<void> {
    const endpointName: USVString = 'resetPasswordRequest';
    const queryParams: Map<string, any> = new Map<string, any>([]);
    const method: ServerApiRequestMethod = 'GET';
    const body: string | undefined = undefined;
    const headers: Map<string, string> = new Map<string, string>([]);

    return await this.call<void>(endpointName, queryParams, method, body, headers);
  }

  public async resetPassword(id: string, salt: string, verifier: string): Promise<void> {
    const endpointName: USVString = 'resetPassword';
    const queryParams: Map<string, any> = new Map<string, any>([
      ['id', id],
    ]);
    const method: ServerApiRequestMethod = 'POST';
    const body: string | undefined = JSON.stringify({
      salt: salt,
      verifier: verifier,
    });
    const headers: Map<string, string> = new Map<string, string>([]);

    return await this.call<void>(endpointName, queryParams, method, body, headers);
  }

}
