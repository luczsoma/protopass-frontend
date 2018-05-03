import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'ngx-alerts';

@Component({
  selector: 'app-validate',
  template: '',
  styles: ['']
})
export class ValidateComponent implements OnInit {

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
  ) {}

  public async ngOnInit() {
    const queryParams: any = this.route.snapshot.queryParams;
    if (!queryParams.email || !queryParams.id) {
      await this.router.navigate(['/login']);
      this.alertService.danger('The validation link you entered is not valid.');
      return;
    }

    try {
      await this.api.validate(queryParams.email, queryParams.id);
      this.alertService.success('You have successfully validated your email. Please log in.');
    } catch (e) {
      switch (e.errorCode) {
        case 'UserInWrongState':
          this.alertService.warning('This user is already validated.');
          break;

        default:
          this.alertService.danger('The validation link you entered is not valid.');
          break;
      }
    } finally {
      await this.router.navigate(['/login']);
    }
  }

}
