import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { UtilsService } from '../../services/utils.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'ngx-alerts';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  public id: string;
  public email: string;

  public loginPassword1 = '';
  public loginPassword2 = '';
  public get loginPasswordsMatch() {
    return this.loginPassword1 === this.loginPassword2;
  }

  constructor(
    private sessionService: SessionService,
    private utils: UtilsService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
  ) { }

  public async ngOnInit(): Promise<void> {
    const queryParams: any = this.route.snapshot.queryParams;
    if (!queryParams.id || !queryParams.email) {
      await this.router.navigate(['/login']);
      this.alertService.danger('The password reset link you entered is not valid.');
      return;
    }

    this.id = queryParams.id;
    this.email = queryParams.email;
  }

  public async resetPassword(): Promise<void> {
    if (!this.utils.isPasswordStrongEnough(this.loginPassword1) || !this.loginPasswordsMatch) {
      return;
    }

    try {
      await this.sessionService.resetPassword(this.id, this.email, this.loginPassword1);
      this.router.navigate(['/login']);
      this.alertService.success('Your password has been successfully reset. You can log in now.');
    } catch (e) {
      switch (e.errorCode) {
        case 'InvalidId':
        case 'BadInput':
          await this.router.navigate(['/login']);
          this.alertService.danger('The password reset link you entered is not valid.');
          return;

        default:
          this.alertService.danger('An unknown error happened. Please try again a bit later.');
          break;
      }
    } finally {
      this.loginPassword1 = '';
      this.loginPassword2 = '';
    }
  }

}
