import { firstValueFrom } from "rxjs";

import {
  GlobalState,
  KeyDefinition,
  REMEMBER_EMAIL_DISK,
  StateProvider,
} from "../../platform/state";
import { RememberEmailService as RememberEmailServiceAbstraction } from "../abstractions/remember-email.service";

const STORED_EMAIL = new KeyDefinition<string>(REMEMBER_EMAIL_DISK, "storedEmail", {
  deserializer: (value: string) => value,
});

export class RememberEmailService implements RememberEmailServiceAbstraction {
  private email: string;
  private rememberEmail: boolean;
  private storedEmail: GlobalState<string>;

  constructor(private stateProvider: StateProvider) {
    this.storedEmail = this.stateProvider.getGlobal(STORED_EMAIL);
  }

  getEmail() {
    return this.email;
  }

  getRememberEmail() {
    return this.rememberEmail;
  }

  setEmail(value: string) {
    this.email = value;
  }

  setRememberEmail(value: boolean) {
    this.rememberEmail = value;
  }

  clearValues() {
    this.email = null;
    this.rememberEmail = null;
  }

  getStoredEmail(): Promise<string> {
    return firstValueFrom(this.storedEmail.state$);
  }

  async setStoredEmail(value: string): Promise<void> {
    await this.storedEmail.update((_) => value);
  }

  async saveEmailSettings() {
    await this.setStoredEmail(this.rememberEmail ? this.email : null);
    this.clearValues();
  }
}
