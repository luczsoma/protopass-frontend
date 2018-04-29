import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '../../services/user-profile.service';
import { AlertService } from 'ngx-alerts';
import { ContainerPasswordStorageService } from '../../services/container-password-storage.service';
import { ServerApiError } from '../../models/serverApiError.model';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  public passwordEntries: Map<string, string>;
  public containerPasswordInputNeeded = false;
  public initialUserProfileSetup = false;
  public containerPasswordInput = '';

  public get userProfileLocked(): boolean {
    return this.userProfileService.locked;
  }

  constructor(
    private userProfileService: UserProfileService,
    private alertService: AlertService,
    private containerPasswordStorageService: ContainerPasswordStorageService,
    private sessionService: SessionService,
  ) { }

  public async ngOnInit() {
    try {
      await this.refreshData();
    } catch (e) {
      this.handleUserProfileErrors(e);
    }
  }

  private handleUserProfileErrors(e: ServerApiError) {
    switch (e.errorCode) {
      case 'InvalidSession':
        this.sessionService.logout();
        break;

      case 'UserProfileNotFound':
        this.containerPasswordInputNeeded = true;
        this.initialUserProfileSetup = true;
        break;

      case 'ContainerPasswordInputRequired':
        this.containerPasswordInputNeeded = true;
        break;
    }
  }

  public async refreshData(): Promise<void> {
    const keys = await this.userProfileService.getPasswordEntryKeysList();
    keys.forEach(k => this.passwordEntries.set(k, '*'.repeat(32)));
  }

  public async getPasswordOfKey(key: string): Promise<void> {
    if (this.userProfileLocked) {
      return;
    }

    try {
      const password = await this.userProfileService.getPasswordOfKey(key);
      this.passwordEntries.set(key, password);
    } catch (e) {
      this.handleUserProfileErrors(e);
    }
  }

  public async deletePasswordOfKey(key: string): Promise<void> {
    if (this.userProfileLocked) {
      return;
    }

    try {
      this.passwordEntries.delete(key);
      await this.userProfileService.deletePasswordOfKey(key);
      await this.refreshData();

      this.alertService.success('Successful deletion.');
    } catch (e) {
      this.handleUserProfileErrors(e);
    }
  }

  public async containerPasswordInputSubmit() {
    await this.containerPasswordStorageService.storeContainerPassword(this.containerPasswordInput);

    if (this.initialUserProfileSetup) {
      await this.userProfileService.initializeEmptyUserProfile();
    }

    try {
      await this.refreshData();
    } catch (e) {
      this.handleUserProfileErrors(e);
    }
  }

}
