import { Component } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { UtilsService } from '../../services/utils.service';
import { AlertService } from 'ngx-alerts';
import { Router } from '@angular/router';

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
    private router: Router,
  ) { }

  public async sendPasswordResetEmail() {
    if (!this.utils.isEmailValid(this.email)) {
      return;
    }

    try {
      await this.sessionService.sendPasswordResetEmail(this.email);
      this.router.navigate(['/login']);
      this.alertService.success('The password reset email was successfully sent.');
    } catch (e) {
      switch (e.errorCode) {
        case 'UserNotExists':
          this.alertService.warning('This user does not exists. Telling this is a big security mistake, we know. :(');
          break;

        default:
          this.alertService.danger('An unknown error happened. Please try again a bit later.');
          break;
      }
    } finally {
      this.email = '';
    }
  }

}
