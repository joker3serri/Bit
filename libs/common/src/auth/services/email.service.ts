import { firstValueFrom } from "rxjs";

import { GlobalState, KeyDefinition, EMAIL_DISK, StateProvider } from "../../platform/state";
import { EmailService as EmailServiceAbstraction } from "../abstractions/email.service";

const STORED_EMAIL = new KeyDefinition<string>(EMAIL_DISK, "storedEmail", {
  deserializer: (value: string) => value,
});

export class EmailService implements EmailServiceAbstraction {
  private email: string;
  private rememberEmail: boolean;
  private storedEmail: GlobalState<string>;

  constructor(private stateProvider: StateProvider) {
    this.storedEmail = this.stateProvider.getGlobal(STORED_EMAIL);
  }

  getEmail() {
    return this.email;
  }

  setEmail(email: string) {
    this.email = email;
  }

  getRememberEmail() {
    return this.rememberEmail;
  }

  setRememberEmail(value: boolean) {
    this.rememberEmail = value;
  }

  getStoredEmail(): Promise<string> {
    return firstValueFrom(this.storedEmail.state$);
  }

  async setStoredEmail(value: string): Promise<void> {
    await this.storedEmail.update((_) => value);
  }

  clearValues() {
    this.email = null;
    this.rememberEmail = null;
  }

  async saveEmailSettings() {
    await this.setStoredEmail(this.rememberEmail ? this.email : null);
    this.clearValues();
  }
}
