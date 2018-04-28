import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { AlertService } from 'ngx-alerts';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(
    private sessionService: SessionService,
    private alertService: AlertService,
  ) { }

  async logout() {
    await this.sessionService.logout();
    this.alertService.success('Successfully logged out.');
  }

}
