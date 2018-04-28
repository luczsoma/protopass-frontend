import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors } from '@angular/forms';
import { UtilsService } from '../services/utils.service';

@Directive({
  selector: '[appValidatePasswordStrengthOnInput]',
  providers: [{ provide: NG_VALIDATORS, useExisting: ValidatePasswordStrengthOnInputDirective, multi: true }],
})
export class ValidatePasswordStrengthOnInputDirective {

  constructor(
    private utils: UtilsService,
  ) { }

  public validate(control: AbstractControl): ValidationErrors | null {
    const password: string = control.value || '';
    const isValid = this.utils.isPasswordStrongEnough(password);

    return isValid ? null : { 'invalidPassword': null };
  }

}
