import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { Router } from '@angular/router';
import { CryptoService } from '../../services/crypto.service';
import { AlertService } from 'ngx-alerts';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public email = '';
  public password = '';
  private _passwordPlaceholder: string;

  constructor(
    private sessionService: SessionService,
    private router: Router,
    private cryptoService: CryptoService,
    private alertService: AlertService,
  ) { }

  public ngOnInit() {
    const alphabet = CryptoService.lower + CryptoService.upper + CryptoService.number + CryptoService.symbol;
    this._passwordPlaceholder = this.cryptoService.randomFromAlphabet(32, alphabet);
  }

  public get passwordPlaceholder(): string {
    return this._passwordPlaceholder;
  }

  public async login() {
    try {
      await this.sessionService.login(this.email, this.password);
      await this.router.navigate(['/dashboard']);
    } catch (e) {
      this.alertService.warning('We could not log you in. Please review your credentials.');
    } finally {
      this.password = '';
    }
  }

}
