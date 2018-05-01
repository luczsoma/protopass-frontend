import { Component } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { UtilsService } from '../../services/utils.service';
import { AlertService } from 'ngx-alerts';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  public email = '';

  constructor(
    private sessionService: SessionService,
    private utils: UtilsService,
    private alertService: AlertService,
  ) { }

  public async sendPasswordResetEmail() {
    if (!this.utils.isEmailValid(this.email)) {
      return;
    }

    try {
      await this.sessionService.sendPasswordResetEmail(this.email);
      this.alertService.success('The password reset email was successfully sent.');
    } catch (e) {
      this.alertService.danger('An unknown error happened. Please try again a bit later.');
    } finally {
      this.email = '';
    }
  }

}
