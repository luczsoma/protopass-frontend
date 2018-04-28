import { Injectable } from '@angular/core';
import { CryptoService } from './crypto.service';

@Injectable()
export class UtilsService {

  constructor(
    private cryptoService: CryptoService,
  ) { }

  public isEmailValid(email: string): boolean {
    return /^[a-z0-9-_]+(?:[+&.][a-z0-9-_]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]+(?:[-][a-z0-9]+)*$/i.test(email);
  }

  public isPasswordStrongEnough(password: string): boolean {
    const lengthCheck = password.length >= 12;
    const lowerCheck = (password.match(/[a-z]/g) || []).length >= 2;
    const upperCheck = (password.match(/[A-Z]/g) || []).length >= 2;
    const numberCheck = (password.match(/[0-9]/g) || []).length >= 2;
    const symbolCheck = (password.match(/[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g) || []).length >= 2;

    return lengthCheck && lowerCheck && upperCheck && numberCheck && symbolCheck;
  }

}
