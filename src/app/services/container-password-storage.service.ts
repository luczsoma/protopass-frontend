import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { SessionService } from './session.service';
import { Convert } from '../utils/convert';
import { CryptoService } from './crypto.service';
import { UtilsService } from './utils.service';

@Injectable()
export class ContainerPasswordStorageService {

  private encryptedContainerPassword: Uint8Array | undefined = undefined;
  private salt: Uint8Array | undefined = undefined;
  private iv: Uint8Array | undefined = undefined;

  constructor(
    private api: ApiService,
    private sessionService: SessionService,
    private cryptoService: CryptoService,
    private utils: UtilsService,
  ) { }

  public clear(): void {
    this.encryptedContainerPassword = undefined;
    this.salt = undefined;
    this.iv = undefined;
  }

  private clearAndThrow(): never {
    this.clear();
    return this.utils.throwContainerPasswordInputRequired();
  }

  private async getContainerPasswordStorageKey(forceFresh = false): Promise<Uint8Array> {
    const response: {
      containerPasswordStorageKey: string
    } = await this.api.getStorageKey(forceFresh, this.sessionService.sessionId!);

    return Convert.base64ToBytes(response.containerPasswordStorageKey);
  }

  public async storeContainerPassword(containerPassword: string): Promise<void> {
    const storageKey: Uint8Array = await this.getContainerPasswordStorageKey(true);

    this.salt = await this.cryptoService.cryptoRandomBytes(32);
    const derivedKey: Uint8Array = await this.cryptoService.scrypt(storageKey, this.salt);

    const containerPasswordBytes: Uint8Array = Convert.stringToBytes(containerPassword);
    this.iv = this.cryptoService.cryptoRandomBytes(32);
    this.encryptedContainerPassword = await this.cryptoService.encryptAesGcm(containerPasswordBytes, derivedKey, this.iv);
  }

  public async getContainerPassword(): Promise<string> {
    if (!this.encryptedContainerPassword || !this.salt || !this.iv) {
      return this.clearAndThrow();
    }

    const storageKey: Uint8Array = await this.getContainerPasswordStorageKey();
    const derivedKey: Uint8Array = await this.cryptoService.scrypt(storageKey, this.salt);

    try {
      const containerPasswordBytes: Uint8Array = await this.cryptoService.decryptAesGcm(this.encryptedContainerPassword,
        derivedKey, this.iv);
      return Convert.bytesToString(containerPasswordBytes);
    } catch (e) {
      return this.clearAndThrow();
    }
  }

}
