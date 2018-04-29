/**
 * Wrapping these in a function is necessary, because atob fails
 * if the calling context (this) is neither 'undefined' nor the
 * global scope (window or self).
 */
import { Utf8 } from './utf8';

export class Convert {

  private static readonly HEX = '0123456789abcdef';

  public static stringToBase64(str: string): string {
    return btoa(str);
  }

  public static base64ToString(b64: string): string {
    return atob(b64);
  }

  public static bytesToString(bytes: Uint8Array): string {
    return Utf8.decode(bytes);
  }

  public static bytesToAscii(bytes: Uint8Array): string {
    let s = '';
    for (let i = 0, mi = bytes.length; i < mi; i++) {
      s += String.fromCharCode(bytes[i]);
    }
    return s;
  }

  public static bytesToBase64(bytes: Uint8Array): string {
    return btoa(Convert.bytesToAscii(bytes));
  }

  public static bytesToHex(bytes: Uint8Array): string {
    return Convert.bytesToHexInternal(bytes, 0, bytes.length);
  }

  private static bytesToHexInternal(bytes: Uint8Array, start: number, end: number): string {
    if (end - start > 1000) {
      const mid = Math.floor((start + end) / 2);
      return Convert.bytesToHexInternal(bytes, start, mid) + Convert.bytesToHexInternal(bytes, mid, end);
    }

    let s = '';
    for (let i = start; i < end; i++) {
      const byte = bytes[i];
      s += Convert.HEX[byte >>> 4] + Convert.HEX[byte & 0x0f];
    }
    return s as any;
  }

  public static hexToBytes(hex: string): Uint8Array {
    const hexLen = (((hex as any) as string)).length;
    const isOdd = hexLen & 1;

    const paddedHex = isOdd ? '0' + hex : hex;
    const bytesLen = (isOdd ? hexLen + 1 : hexLen) / 2;

    const bytes = new Uint8Array(bytesLen);
    for (let i = 0, si = 0; i < bytesLen; i++, si += 2) {
      bytes[i] = parseInt(((paddedHex as any) as string).substr(si, 2), 16);
    }
    return bytes;
  }

  public static stringToBytes(str: string): Uint8Array {
    if (str === '') { return new Uint8Array([]); }
    return Utf8.encode(str);
  }

  public static asciiToBytes(str: string): Uint8Array {
    const bytes = new Uint8Array(str.length);
    let temp;
    for (let i = 0; i < bytes.length; i++) {
      temp = str.charCodeAt(i);
      if (temp >>> 8 !== 0) { throw new Error('Converting non-ascii string'); }
      bytes[i] = temp;
    }
    return bytes;
  }

  private static asciiToBytesUnchecked(str: string): Uint8Array {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    return bytes;
  }

  public static base64ToBytes(b64: string): Uint8Array {
    return Convert.asciiToBytesUnchecked(atob(b64));
  }

}
