import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '../../services/user-profile.service';
import { AlertService } from 'ngx-alerts';
import { ContainerPasswordStorageService } from '../../services/container-password-storage.service';
import { ServerApiError } from '../../models/serverApiError.model';
import { SessionService } from '../../services/session.service';
import { CryptoService } from '../../services/crypto.service';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private readonly hiddenPasswordString = '*'.repeat(32);

  public passwordEntries: Map<string, string> = new Map();

  public containerPasswordInputNeeded = false;
  public initialUserProfileSetup = false;

  public containerPasswordInput = '';

  public newPasswordKey = '';
  public newPasswordValue = '';
  public generatedPasswordLower = true;
  public generatedPasswordUpper = true;
  public generatedPasswordNumber = true;
  public generatedPasswordSymbol = true;
  public generatedPasswordLength = 32;

  public get userProfileLocked(): boolean {
    return this.userProfileService.locked;
  }

  constructor(
    private userProfileService: UserProfileService,
    private alertService: AlertService,
    private containerPasswordStorageService: ContainerPasswordStorageService,
    private sessionService: SessionService,
    private cryptoService: CryptoService,
    private utilsService: UtilsService,
  ) { }

  public async ngOnInit() {
    try {
      await this.refreshData();
    } catch (e) {
      this.handleUserProfileErrors(e);
      this.passwordEntries.clear();
    }
  }

  private handleUserProfileErrors(e: { errorCode: string }) {
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

      case 'KeyExists':
        this.alertService.warning('This service already exists in your profile. Please choose another name.');
        break;

      case 'ConcurrentCallNotAllowed':
        // not handled, not needed
        break;

      default:
        this.alertService.danger('An unknown error happened. Please try again a bit later.');
        break;
    }
  }

  private async refreshData(): Promise<void> {
    const keys = await this.userProfileService.getPasswordEntryKeysList();
    keys.forEach(k => this.passwordEntries.set(k, this.hiddenPasswordString));
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
    this.containerPasswordInput = '';

    if (this.initialUserProfileSetup) {
      await this.userProfileService.initializeEmptyUserProfile();
    }

    try {
      await this.refreshData();
    } catch (e) {
      this.handleUserProfileErrors(e);
    }
  }

  public generateRandomPassword(): void {
    let alphabet = '';
    if (this.generatedPasswordLower) { alphabet += CryptoService.lower; }
    if (this.generatedPasswordUpper) { alphabet += CryptoService.upper; }
    if (this.generatedPasswordNumber) { alphabet += CryptoService.number; }
    if (this.generatedPasswordSymbol) { alphabet += CryptoService.symbol; }

    const length = this.generatedPasswordLength || 0;

    this.newPasswordValue = this.cryptoService.randomFromAlphabet(length, alphabet);
  }

  public async addNewPassword() {
    if (this.userProfileLocked) {
      return;
    }

    if (!this.newPasswordKey) {
      this.alertService.warning('Please enter what is this password for.');
      return;
    }

    if (!this.newPasswordValue) {
      this.alertService.warning('You can\'t store empty passwords here. You just can\'t.');
      return;
    }

    try {
      await this.userProfileService.storePasswordOfKey(this.newPasswordKey, this.newPasswordValue);
      await this.refreshData();

      this.alertService.success('Your password is successfully stored.');
    } catch (e) {
      this.handleUserProfileErrors(e);
    } finally {
      this.newPasswordKey = '';
      this.newPasswordValue = '';
      this.generatedPasswordLower = true;
      this.generatedPasswordUpper = true;
      this.generatedPasswordNumber = true;
      this.generatedPasswordSymbol = true;
      this.generatedPasswordLength = 32;
    }
  }

}
