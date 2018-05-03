import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '../../services/user-profile.service';
import { AlertService } from 'ngx-alerts';
import { ContainerPasswordStorageService } from '../../services/container-password-storage.service';
import { SessionService } from '../../services/session.service';
import { CryptoService } from '../../services/crypto.service';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  public loaded = false;

  public readonly hiddenPasswordString = '*'.repeat(32);

  public passwordEntries: Map<string, string> = new Map();
  public get passwordEntriesArray() {
    return Array.from(this.passwordEntries);
  }

  public containerPasswordInputNeeded = false;
  public initialUserProfileSetup = false;

  public setupContainerPasswordInput1 = '';
  public setupContainerPasswordInput2 = '';
  public get setupContainerPasswordsMatch(): boolean {
    return this.setupContainerPasswordInput1 === this.setupContainerPasswordInput2;
  }

  public openUserProfileContainerPasswordInput = '';

  public changeContainerPasswordInput1 = '';
  public changeContainerPasswordInput2 = '';
  public get changeContainerPasswordsMatch(): boolean {
    return this.changeContainerPasswordInput1 === this.changeContainerPasswordInput2;
  }

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
    private utils: UtilsService,
  ) { }

  public async ngOnInit() {
    try {
      if (!(await this.userProfileService.userProfileExists())) {
        this.containerPasswordInputNeeded = true;
        this.initialUserProfileSetup = true;
        return;
      }

      await this.refreshData();
    } catch (e) {
      this.handleUserProfileErrors(e);
      this.passwordEntries.clear();
    } finally {
      this.loaded = true;
    }
  }

  private async refreshData(): Promise<void> {
    const keys = await this.userProfileService.getPasswordEntryKeysList();
    keys.forEach(k => this.passwordEntries.set(k, this.hiddenPasswordString));
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
        // validation rule => not handled, user shouldn't hack
        break;

      default:
        this.alertService.danger('An unknown error happened. Please try again a bit later.');
        break;
    }
  }

  public async setupUserProfile() {
    this.loaded = false;

    if (!this.setupUserProfileAllValid) {
      return;
    }

    await this.containerPasswordStorageService.storeContainerPassword(this.setupContainerPasswordInput1);
    this.setupContainerPasswordInput1 = '';
    this.setupContainerPasswordInput2 = '';

    try {
      await this.userProfileService.initializeEmptyUserProfile();

      this.containerPasswordInputNeeded = false;
      this.initialUserProfileSetup = false;

      await this.refreshData();
    } catch (e) {
      this.handleUserProfileErrors(e);
    } finally {
      this.loaded = true;
    }
  }

  public get setupUserProfileAllValid(): boolean {
    return this.utils.isPasswordStrongEnough(this.setupContainerPasswordInput1) &&
    this.setupContainerPasswordsMatch;
  }

  public async openUserProfile() {
    if (!this.openUserProfileContainerPasswordInput) {
      return;
    }

    this.loaded = false;

    await this.containerPasswordStorageService.storeContainerPassword(this.openUserProfileContainerPasswordInput);
    this.openUserProfileContainerPasswordInput = '';

    this.containerPasswordInputNeeded = false;

    try {
      await this.refreshData();
    } catch (e) {
      if (e.errorCode === 'ContainerPasswordInputRequired') {
        this.alertService.danger('Invalid password.');
      }

      this.handleUserProfileErrors(e);
    } finally {
      this.loaded = true;
    }
  }

  public async changeUserProfilePassword() {
    if (!this.changeUserProfilePasswordAllValid) {
      return;
    }

    const newContainerPassword = this.changeContainerPasswordInput1;
    this.changeContainerPasswordInput1 = '';
    this.changeContainerPasswordInput2 = '';

    if (this.userProfileLocked) {
      return;
    }

    this.loaded = false;

    try {
      await this.userProfileService.changeContainerPassword(newContainerPassword);
      await this.refreshData();
      this.alertService.success('Your profile password was successfully changed.');
    } catch (e) {
      this.handleUserProfileErrors(e);
    } finally {
      this.loaded = true;
    }
  }

  public get changeUserProfilePasswordAllValid(): boolean {
    return this.utils.isPasswordStrongEnough(this.changeContainerPasswordInput1) &&
      this.changeContainerPasswordsMatch;
  }

  public async getPasswordOfKey(key: string): Promise<void> {
    if (this.userProfileLocked) {
      return;
    }

    this.loaded = false;

    try {
      const password = await this.userProfileService.getPasswordOfKey(key);
      this.passwordEntries.set(key, password);
    } catch (e) {
      this.handleUserProfileErrors(e);
    } finally {
      this.loaded = true;
    }
  }

  public hidePasswordOfKey(key: string): void {
    this.passwordEntries.set(key, this.hiddenPasswordString);
  }

  public async deletePasswordOfKey(key: string): Promise<void> {
    if (this.userProfileLocked) {
      return;
    }

    if (!confirm('Are you sure?')) {
      return;
    }

    this.loaded = false;

    try {
      this.passwordEntries.delete(key);
      await this.userProfileService.deletePasswordOfKey(key);
      await this.refreshData();

      this.alertService.success('Successful deletion.');
    } catch (e) {
      this.handleUserProfileErrors(e);
    } finally {
      this.loaded = true;
    }
  }

  public async addNewPassword() {
    if (!this.newPasswordKey) {
      this.alertService.warning('Please enter what is this password for.');
      return;
    }

    if (!this.newPasswordValue || this.newPasswordValue === this.hiddenPasswordString) {
      this.alertService.warning('You can\'t store empty passwords here. You just can\'t.');
      return;
    }

    if (this.userProfileLocked) {
      return;
    }

    this.loaded = false;

    try {
      await this.userProfileService.storePasswordOfKey(this.newPasswordKey, this.newPasswordValue);
      await this.refreshData();

      this.alertService.success('Your password was successfully stored.');
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
      this.loaded = true;
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

  public passwordIsCurrentlyVisible(password: string): boolean {
    return password !== this.hiddenPasswordString;
  }

}
