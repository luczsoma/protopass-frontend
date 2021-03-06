import { Component } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { UtilsService } from '../../services/utils.service';
import { AlertService } from 'ngx-alerts';
import { Router } from '@angular/router';

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
    private alertService: AlertService,
    private router: Router,
  ) { }

  public get allFieldsValid() {
    return this.utils.isEmailValid(this.email) &&
      this.utils.isPasswordStrongEnough(this.loginPassword1) &&
      this.loginPasswordsMatch;
  }

  public async register() {
    try {
      await this.sessionService.register(this.email, this.loginPassword1);
      await this.router.navigate(['/login']);
      this.alertService.success('Successful registration. Please visit your email address to validate yourself.');
    } catch (e) {
      switch (e.errorCode) {
        case 'UserAlreadyExists':
          this.alertService.warning('This email is already registered.');
          break;

        default:
          this.alertService.danger('An unknown error happened. Please try again a bit later.');
          break;
      }
    }
  }

}
