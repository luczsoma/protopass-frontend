import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { NewPasswordComponent } from './components/new-password/new-password.component';
import { RegisterComponent } from './components/register/register.component';
import { ValidateComponent } from './components/validate/validate.component';

const routes: Routes = [
  { path: 'register',         component: RegisterComponent                              },
  { path: 'validate',         component: ValidateComponent                              },
  { path: 'login',            component: LoginComponent                                 },
  { path: 'dashboard',        component: DashboardComponent,   canActivate: [AuthGuard] },
  { path: 'add-new-password', component: NewPasswordComponent, canActivate: [AuthGuard] },

  { path: '**',               redirectTo: 'dashboard'                                   },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes),
  ],
  declarations: [],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
