import { Injectable } from '@angular/core';

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

}
