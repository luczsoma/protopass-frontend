import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './components/app.component';
import { AppRoutingModule } from './app-routing.module';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { SessionService } from './services/session.service';
import { AuthGuard } from './guards/auth.guard';
import { RegisterComponent } from './components/register/register.component';
import { ValidateEmailOnInputDirective } from './directives/validate-email-on-input.directive';
import { FormsModule } from '@angular/forms';
import { UtilsService } from './services/utils.service';
import { ValidatePasswordStrengthOnInputDirective } from './directives/validate-password-strength-on-input.directive';
import { CryptoService } from './services/crypto.service';
import { ValidateComponent } from './components/validate/validate.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AlertModule } from 'ngx-alerts';
import { ApiService } from './services/api.service';
import { UserProfileService } from './services/user-profile.service';
import { ContainerPasswordStorageService } from './services/container-password-storage.service';
import { ChangeLoginPasswordComponent } from './change-login-password/change-login-password.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    DashboardComponent,
    LoginComponent,
    RegisterComponent,
    ValidateEmailOnInputDirective,
    ValidatePasswordStrengthOnInputDirective,
    ValidateComponent,
    ChangeLoginPasswordComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbModule.forRoot(),
    FormsModule,
    AlertModule.forRoot({ maxMessages: 5, timeout: 5000 }),
  ],
  providers: [
    { provide: SessionService, useClass: SessionService },
    { provide: UtilsService, useClass: UtilsService },
    { provide: AuthGuard, useClass: AuthGuard },
    { provide: CryptoService, useClass: CryptoService },
    { provide: ApiService, useClass: ApiService },
    { provide: UserProfileService, useClass: UserProfileService },
    { provide: ContainerPasswordStorageService, useClass: ContainerPasswordStorageService },
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
