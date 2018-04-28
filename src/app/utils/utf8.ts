class Utf8Error {
  public readonly name: string;
  public readonly message: string;

  constructor(message: string) {
    this.name = 'Utf8Error';
    this.message = message;
  }
}

export class Utf8 {
  private static decodeError() {
    throw new Utf8Error('Decode error, utf8 data truncated, or incorrect');
  }

  private static encodeError(cp: number) {
    throw new Utf8Error(`Encode error, can't encode codepoint: ${cp}`);
  }

  /**
   * Creates a string containing a single virtual character with the given codepoint.
   * This virtual character might correspond to two physical characters as a surrogate pair.
   * This method differs from the standard String.fromCodePoint in that this only accepts a single
   * codePoint.
   */
  private static charFromCodePoint(codePoint: number): string {
    if (codePoint <= 0xffff) {
      return String.fromCharCode(codePoint);
    }
    // generate surrogate pair for x > 0xffff values
    const newCodePoint = codePoint - 0x10000;
    const h = 0xd800 + (newCodePoint >>> 10);
    const l = 0xdc00 + (newCodePoint & 0x3ff);
    return String.fromCharCode(h, l);
  }

  /**
   * Reads one or two physical characters (they might be a surrogate pair) from the string to
   * build a virtual character and returns the codePoint of it.
   *
   * The result is > 0xffff if and only if the character at the given
   * index is a surrogate pair.
   * Thus one can iterate through a string as:
   * for (var i = 0; i < s.length;) {
   *   var codePoint = codePointAt(s, i);
   *   i += codePoint > 0xffff ? 2 : 1;
   * }
   *
   * or, equvivalently:
   * for (var i = 0, cp; i < s.length; i += codePointCharCount(cp)) {
   *   cp = codePointAt(s, i);
   *   ...
   * }
   */
  private static codePointAt(str: string, index: number): number {
    const length = str.length;
    const first = str.charCodeAt(index);
    if (first >= 0xd800 && first <= 0xdbff && index + 1 < length) {
      // first is high surrogate
      const second = str.charCodeAt(index + 1);
      if (second >= 0xdc00 && second <= 0xdfff) {
        // second is low surrogate
        // result is strictly > 0xffff
        return ((first - 0xd800) << 10) + second - 0xdc00 + 0x10000;
      }
    }
    return first;
  }

  /**
   * Encode javascript string as utf8 byte array.
   */
  public static encode(str: string): Uint8Array {
    if (str === '') { return new Uint8Array([]); }

    // the resulting byte count is at least the length of the string
    const length = str.length;
    let i: number;
    let cp: number;
    let cursor = 0;
    // First, we count the needed number of bytes, by iterating through once
    for (i = 0; i < length; i += cp > 0xffff ? 2 : 1) {
      cp = Utf8.codePointAt(str, i);
      // Expecting most common codepoints below 0x80, so checking for that first
      if (cp < 0x80) {
        cursor += 1;
      } else if (cp < 0x800) {
        cursor += 2;
      } else if (cp < 0x10000) {
        cursor += 3;
      } else if (cp < 0x200000) {
        cursor += 4;
      } else {
        Utf8.encodeError(cp);
      }
    }
    // Allocate the buffer of suitable size
    const bytes = new Uint8Array(cursor);
    // Fill the right sized buffer with utf8 data
    for (i = 0, cursor = 0; i < length; i += cp > 0xffff ? 2 : 1) {
      cp = Utf8.codePointAt(str, i);
      if (cp < 0x80) {
        bytes[cursor++] = cp;
      } else if (cp < 0x800) {
        bytes[cursor++] = (cp >>> 6) | 0xc0;
        bytes[cursor++] = (cp & 0x3f) | 0x80;
      } else if (cp < 0x10000) {
        bytes[cursor++] = (cp >>> 12) | 0xe0;
        bytes[cursor++] = ((cp >>> 6) & 0x3f) | 0x80;
        bytes[cursor++] = (cp & 0x3f) | 0x80;
      } else {
        bytes[cursor++] = (cp >>> 18) | 0xf0;
        bytes[cursor++] = ((cp >>> 12) & 0x3f) | 0x80;
        bytes[cursor++] = ((cp >>> 6) & 0x3f) | 0x80;
        bytes[cursor++] = (cp & 0x3f) | 0x80;
      }
    }
    return bytes;
  }

  /**
   * Decode utf8 byte array to javascript string.
   */
  public static decode(bytes: Uint8Array): string {
    const length = bytes.length;
    let i = 0,
      c1: number,
      c2: number,
      c3: number,
      c4: number,
      cp: number,
      str = '';
    while (i < length) {
      c1 = bytes[i++];
      if (c1 < 0x80) {
        str += String.fromCharCode(c1);
      } else if (c1 < 0xc0) {
        Utf8.decodeError();
      } else if (c1 < 0xe0) {
        if (i >= length) {
          Utf8.decodeError();
        }
        c2 = bytes[i++];
        cp = ((c1 & 0x1f) << 6) | (c2 & 0x3f);
        str += Utf8.charFromCodePoint(cp);
      } else if (c1 < 0xf0) {
        if (i + 1 >= length) {
          Utf8.decodeError();
        }
        c2 = bytes[i++];
        c3 = bytes[i++];
        cp = ((c1 & 0x0f) << 12) | ((c2 & 0x3f) << 6) | (c3 & 0x3f);
        str += Utf8.charFromCodePoint(cp);
      } else if (c1 < 0xf8) {
        if (i + 2 >= length) {
          Utf8.decodeError();
        }
        c2 = bytes[i++];
        c3 = bytes[i++];
        c4 = bytes[i++];
        cp = ((c1 & 0x07) << 18) | ((c2 & 0x3f) << 12) | ((c3 & 0x3f) << 6) | (c4 & 0x3f);
        str += Utf8.charFromCodePoint(cp);
      } else {
        Utf8.decodeError();
      }
    }
    // String building in javascript should be done by concatenation.
    // Most JS engines uses 'ropes' to represent strings in memory, and
    // rope concatenation is done in O(1) time. Array.join('') is much slower
    // on chrome and firefox.
    // Note that in other languages, like java or c#, there is a StringBuilder
    // class, and that should be used, but in javascript the += operator just
    // works fine and fast.
    return str;
  }
}
