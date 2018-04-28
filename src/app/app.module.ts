import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './components/app.component';
import { AppRoutingModule } from './app-routing.module';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NewPasswordComponent } from './components/new-password/new-password.component';
import { LoginComponent } from './components/login/login.component';
import { SessionService } from './services/session.service';
import { AuthGuard } from './guards/auth.guard';
import { RegisterComponent } from './components/register/register.component';
import { ValidateEmailOnInputDirective } from './directives/validate-email-on-input.directive';
import { FormsModule } from '@angular/forms';
import { UtilsService } from './services/utils.service';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    DashboardComponent,
    NewPasswordComponent,
    LoginComponent,
    RegisterComponent,
    ValidateEmailOnInputDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule.forRoot(),
    FormsModule,
  ],
  providers: [
    { provide: SessionService, useClass: SessionService },
    { provide: UtilsService, useClass: UtilsService },
    { provide: AuthGuard, useClass: AuthGuard },
    { provide: ValidateEmailOnInputDirective, useClass: ValidateEmailOnInputDirective },
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
