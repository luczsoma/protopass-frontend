import { Injectable } from '@angular/core';
import { ServerApiError } from '../models/serverApiError.model';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

declare type ServerApiRequestMethod = 'GET' | 'POST' | 'PUT';

@Injectable()
export class ApiService {

  private static readonly baseUrl = 'https://protopass-backend.azurewebsites.net';

  constructor(
    private httpClient: HttpClient,
  ) { }

  private async call<T>(
    endpointName: USVString,
    queryParams: Map<string, any>,
    method: ServerApiRequestMethod,
    body: any,
    headers: Map<string, string>,
  ): Promise<T> {
    const queryParamsString: USVString = this.getQueryParamsString(queryParams);
    const requestUri: USVString = `${ApiService.baseUrl}/${endpointName}${queryParamsString}`;

    const allHeaders: HttpHeaders = new HttpHeaders();
    headers.forEach((v, k) => allHeaders.set(k, v.toString()));

    try {
      switch (method) {
        default:
        case 'GET':
          return await this.httpClient.get<T>(requestUri, { headers: allHeaders }).toPromise();

        case 'POST':
          return await this.httpClient.post<T>(requestUri, body, { headers: allHeaders }).toPromise();

        case 'PUT':
          return await this.httpClient.put<T>(requestUri, body, { headers: allHeaders }).toPromise();
      }
    } catch (e) {
      const errorCode = e instanceof HttpErrorResponse
        ? e.error.error || 'UnknownError'
        : 'NetworkError';
      throw new ServerApiError(endpointName, errorCode);
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
    const body = {
      email,
      salt,
      verifier,
    };
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
    const body: any = undefined;
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
    const body: any = {
      email: email,
      clientChallenge: clientChallenge,
    };
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
    const body: any = {
      email: email,
      clientProof: clientProof,
    };
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
    const body: any = undefined;
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
    const body: any = undefined;
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
    const body: any = {
      encryptedUserProfile: encryptedUserProfile,
      containerKeySalt: containerKeySalt,
      initializationVector: initializationVector,
    };
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
    const body: any = undefined;
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
    const body: any = {
      salt: salt,
      verifier: verifier,
    };
    const headers: Map<string, string> = new Map<string, string>([
      ['Authorization', `LoginSession ${sessionId}`],
    ]);

    return await this.call<void>(endpointName, queryParams, method, body, headers);
  }

  public async resetPasswordRequest(email: string): Promise<void> {
    const endpointName: USVString = 'resetPasswordRequest';
    const queryParams: Map<string, any> = new Map<string, any>([
      ['email', email],
    ]);
    const method: ServerApiRequestMethod = 'GET';
    const body: any = undefined;
    const headers: Map<string, string> = new Map<string, string>([]);

    return await this.call<void>(endpointName, queryParams, method, body, headers);
  }

  public async resetPassword(id: string, salt: string, verifier: string): Promise<void> {
    const endpointName: USVString = 'resetPassword';
    const queryParams: Map<string, any> = new Map<string, any>([
      ['id', id],
    ]);
    const method: ServerApiRequestMethod = 'POST';
    const body: any = {
      salt: salt,
      verifier: verifier,
    };
    const headers: Map<string, string> = new Map<string, string>([]);

    return await this.call<void>(endpointName, queryParams, method, body, headers);
  }

}
