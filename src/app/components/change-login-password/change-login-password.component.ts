import { Component } from '@angular/core';
import { UtilsService } from '../../services/utils.service';
import { SessionService } from '../../services/session.service';
import { Router } from '@angular/router';
import { AlertService } from 'ngx-alerts';

@Component({
  selector: 'app-change-login-password',
  templateUrl: './change-login-password.component.html',
  styleUrls: ['./change-login-password.component.css']
})
export class ChangeLoginPasswordComponent {

  public loginPassword1 = '';
  public loginPassword2 = '';
  public loginPasswordsMatch(): boolean {
    return this.loginPassword1 === this.loginPassword2;
  }

  constructor(
    private utils: UtilsService,
    private sessionService: SessionService,
    private router: Router,
    private alertService: AlertService,
  ) { }

  public get allFieldsValid() {
    return this.utils.isPasswordStrongEnough(this.loginPassword1) &&
      this.loginPasswordsMatch;
  }

  public async changeLoginPassword(): Promise<void> {
    if (!this.allFieldsValid) {
      return;
    }

    await this.sessionService.changePassword(this.loginPassword1);

    this.router.navigate(['/dashboard']);
    this.alertService.success('Your login password was successfully changed.');
  }

}
