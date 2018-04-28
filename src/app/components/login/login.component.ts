import { Component } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { Router } from '@angular/router';
import { CryptoService } from '../../services/crypto.service';

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
    private cryptoService: CryptoService,
  ) { }

  public get passwordPlaceholder(): string {
    const alphabet = CryptoService.lower + CryptoService.upper + CryptoService.number + CryptoService.symbol;
    return this.cryptoService.randomFromAlphabet(32, alphabet);
  }

  public async login() {
    try {
      await this.sessionService.login(this.email, this.password);
      await this.router.navigate(['/dashboard']);
    } catch (e) {
      this.loginError = true;
    } finally {
      this.password = '';
    }
  }

}
