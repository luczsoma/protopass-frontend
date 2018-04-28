import { Component } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  public email = '';

  public loginPassword1 = '';
  public loginPassword2 = '';

  public get loginPasswordsMatch() {
    return this.loginPassword1 === this.loginPassword2;
  }

  constructor(
    private sessionService: SessionService,
    private utils: UtilsService,
  ) { }

  public get allFieldsValid() {
    return this.utils.isEmailValid(this.email) &&
      this.utils.isPasswordStrongEnough(this.loginPassword1) &&
      this.loginPasswordsMatch;
  }

  public async register() {
    await this.sessionService.register(this.email, this.loginPassword1);
  }

}
