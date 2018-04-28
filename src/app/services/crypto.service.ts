import { Injectable } from '@angular/core';
import * as srp from 'secure-remote-password/client';
import * as scrypt from 'scrypt-async';
import { Utf8 } from '../utils/utf8';
import { Convert } from '../utils/convert';

@Injectable()
export class CryptoService {

  public static readonly lower: string = 'abcdefghijklmnopqrstuvwxyz';
  public static readonly upper: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  public static readonly number: string = '0123456789';
  public static readonly symbol: string = ' !"#$%&\'()*+,-./:;<=>?@[\]^_`{|}~';

  public cryptoRandomBytes(bytesCount: number): Uint8Array {
    const bytes = new Uint8Array(bytesCount);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  public randomFromAlphabet(length: number, alphabet: string) {
    const bytes = this.cryptoRandomBytes(length * 2);
    let result = '';
    for (let i = 1; i < bytes.length; i += 2) {
      const uint16 = bytes[i - 1] + bytes[i] * 256;
      const charIndex = Math.floor(uint16 * alphabet.length / 0x10000);
      result += alphabet.charAt(charIndex);
    }
    return result;
  }

  public async scrypt(keyBytes: Uint8Array, saltBytes: Uint8Array): Promise<Uint8Array> {
    const options: scrypt.Options = {
      logN: 16,
      r: 8,
      p: 4,
      dkLen: 32,
      encoding: 'binary',
    };

    return new Promise<Uint8Array>(resolve => {
      scrypt(Array.from(keyBytes), Array.from(saltBytes), options, (derivedKey: string | number[]) => {
        resolve(Uint8Array.from(derivedKey as number[]));
      });
    });
  }

  private async deriveSrpPrivateKey(email: string, password: string, salt: Uint8Array): Promise<string> {
    const key: Uint8Array = Utf8.encode(`${email}:${password}`);
    const derivedKey: Uint8Array = await this.scrypt(key, salt);
    return Convert.bytesToHex(derivedKey);
  }

  public async generateSrpVerifier(email: string, password: string, salt: Uint8Array): Promise<string> {
    const privateKey: string = await this.deriveSrpPrivateKey(email, password, salt);
    return srp.deriveVerifier(privateKey);
  }

}
