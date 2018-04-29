import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { SessionService } from './session.service';
import { ContainerPasswordStorageService } from './container-password-storage.service';
import { Convert } from '../utils/convert';
import { CryptoService } from './crypto.service';
import { UtilsService } from './utils.service';

@Injectable()
export class UserProfileService {

  private _locked = false;
  public get locked(): boolean {
    return this._locked;
  }

  constructor(
    private sessionService: SessionService,
    private containerPasswordStorageService: ContainerPasswordStorageService,
    private api: ApiService,
    private cryptoService: CryptoService,
    private utilsService: UtilsService,
  ) { }

  private async decryptUserProfile(userProfileResponse: {
    encryptedUserProfile: string;
    containerKeySalt: string;
    initializationVector: string;
  }, containerPassword: string): Promise<{ PasswordEntries: { [key: string]: string } }> {
    try {
      const containerPasswordBytes: Uint8Array = Convert.stringToBytes(containerPassword);
      const saltBytes: Uint8Array = Convert.base64ToBytes(userProfileResponse.containerKeySalt);
      const derivedKey: Uint8Array = await this.cryptoService.scrypt(containerPasswordBytes, saltBytes);

      const ivBytes: Uint8Array = Convert.base64ToBytes(userProfileResponse.initializationVector);

      const asBytes: Uint8Array = Convert.base64ToBytes(userProfileResponse.encryptedUserProfile);
      const decrypted: Uint8Array = await this.cryptoService.decryptAesGcm(asBytes, derivedKey, ivBytes);
      const asString: string = Convert.bytesToString(decrypted);

      return JSON.parse(asString);
    } catch (e) {
      return this.utilsService.throwContainerPasswordInputRequired();
    }
  }

  private async encryptUserProfile(userProfile: {
    PasswordEntries: { [key: string]: string }
  }, containerPassword: string): Promise<{
    encryptedUserProfile: Uint8Array;
    containerKeySalt: Uint8Array;
    initializationVector: Uint8Array;
  }> {
    const containerPasswordBytes: Uint8Array = Convert.stringToBytes(containerPassword);
    const saltBytes: Uint8Array = await this.cryptoService.cryptoRandomBytes(32);
    const derivedKey: Uint8Array = await this.cryptoService.scrypt(containerPasswordBytes, saltBytes);

    const ivBytes: Uint8Array = await this.cryptoService.cryptoRandomBytes(32);

    const asString: string = JSON.stringify(userProfile);
    const asBytes: Uint8Array = Convert.stringToBytes(asString);
    const encrypted: Uint8Array = await this.cryptoService.encryptAesGcm(asBytes, derivedKey, ivBytes);

    return {
      encryptedUserProfile: encrypted,
      containerKeySalt: saltBytes,
      initializationVector: ivBytes,
    };
  }

  private async mutexCall(fn: () => any) {
    if (this._locked) {
      throw { errorCode: 'ConcurrentCallNotAllowed' };
    }

    try {
      this._locked = true;
      return await fn();
    } finally {
      this._locked = false;
    }
  }

  public async initializeEmptyUserProfile(): Promise<void> {
    return await this.mutexCall(async () => {
      const containerPassword = await this.containerPasswordStorageService.getContainerPassword();
      const userProfile = { PasswordEntries: {} };
      const encryptedWithSaltAndIv = await this.encryptUserProfile(userProfile, containerPassword);

      await this.api.uploadUserProfile(
        Convert.bytesToBase64(encryptedWithSaltAndIv.encryptedUserProfile),
        Convert.bytesToBase64(encryptedWithSaltAndIv.containerKeySalt),
        Convert.bytesToBase64(encryptedWithSaltAndIv.initializationVector),
        this.sessionService.sessionId!,
      );
    });
  }

  public async getPasswordEntryKeysList(): Promise<string[]> {
    return await this.mutexCall(async () => {
      const userProfileResponse = await this.api.downloadUserProfile(this.sessionService.sessionId!);
      const containerPassword = await this.containerPasswordStorageService.getContainerPassword();

      const userProfile = await this.decryptUserProfile(userProfileResponse, containerPassword);

      return Object.keys(userProfile.PasswordEntries).sort((a: string, b: string) => a.localeCompare(b));
    });
  }

  public async getPasswordOfKey(key: string): Promise<string> {
    return await this.mutexCall(async () => {
      const userProfileResponse = await this.api.downloadUserProfile(this.sessionService.sessionId!);
      const containerPassword = await this.containerPasswordStorageService.getContainerPassword();

      const userProfile = await this.decryptUserProfile(userProfileResponse, containerPassword);

      return userProfile.PasswordEntries[key];
    });
  }

  public async storePasswordOfKey(key: string, password: string): Promise<void> {
    return await this.mutexCall(async () => {
      const userProfileResponse = await this.api.downloadUserProfile(this.sessionService.sessionId!);
      const containerPassword = await this.containerPasswordStorageService.getContainerPassword();

      const userProfile = await this.decryptUserProfile(userProfileResponse, containerPassword);

      if (userProfile.PasswordEntries[key]) {
        throw { errorCode: 'KeyExists' };
      }

      userProfile.PasswordEntries[key] = password;
      const encryptedWithSaltAndIv = await this.encryptUserProfile(userProfile, containerPassword);

      await this.api.uploadUserProfile(
        Convert.bytesToBase64(encryptedWithSaltAndIv.encryptedUserProfile),
        Convert.bytesToBase64(encryptedWithSaltAndIv.containerKeySalt),
        Convert.bytesToBase64(encryptedWithSaltAndIv.initializationVector),
        this.sessionService.sessionId!,
      );
    });
  }

  public async deletePasswordOfKey(key: string): Promise<void> {
    return await this.mutexCall(async () => {
      const userProfileResponse = await this.api.downloadUserProfile(this.sessionService.sessionId!);
      const containerPassword = await this.containerPasswordStorageService.getContainerPassword();

      const userProfile = await this.decryptUserProfile(userProfileResponse, containerPassword);
      delete userProfile.PasswordEntries[key];
      const encryptedWithSaltAndIv = await this.encryptUserProfile(userProfile, containerPassword);

      await this.api.uploadUserProfile(
        Convert.bytesToBase64(encryptedWithSaltAndIv.encryptedUserProfile),
        Convert.bytesToBase64(encryptedWithSaltAndIv.containerKeySalt),
        Convert.bytesToBase64(encryptedWithSaltAndIv.initializationVector),
        this.sessionService.sessionId!,
      );
    });
  }

}
