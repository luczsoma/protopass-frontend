import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService {

  constructor() { }

  public isEmailValid(email: string): boolean {
    return /^[a-z0-9-_]+(?:[+&.][a-z0-9-_]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]+(?:[-][a-z0-9]+)*$/i.test(email);
  }

}
