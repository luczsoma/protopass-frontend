import { Component } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  public email = '';
  public password = '';
  public loginError = false;

  constructor(
    private sessionService: SessionService,
    private router: Router,
  ) { }

  public async login() {
    const success: boolean = await this.sessionService.login(this.email, this.password);

    this.email = '';
    this.password = '';

    if (success) {
      await this.router.navigate(['/dashboard']);
    } else {
      this.loginError = true;
    }
  }

}
