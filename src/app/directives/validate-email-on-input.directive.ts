import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors } from '@angular/forms';
import { UtilsService } from '../services/utils.service';

@Directive({
  selector: '[appValidateEmailOnInput]',
  providers: [{ provide: NG_VALIDATORS, useExisting: ValidateEmailOnInputDirective, multi: true }],
})
export class ValidateEmailOnInputDirective {

  constructor(
    private utils: UtilsService,
  ) { }

  public validate(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    const isValid = this.utils.isEmailValid(email);
    return isValid ? null : { 'invalidEmailAddress': { value: email } };
  }

}
