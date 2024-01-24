import { firstValueFrom } from "rxjs";

// import { StateService } from "../../platform/abstractions/state.service";
import { GlobalState, KeyDefinition, LOGIN_DISK, StateProvider } from "../../platform/state";
import { LoginService as LoginServiceAbstraction } from "../abstractions/login.service";

const REMEMBERED_EMAIL = new KeyDefinition<string>(LOGIN_DISK, "rememberedEmail", {
  deserializer: (rememberedEmail) => rememberedEmail,
});

export class LoginService implements LoginServiceAbstraction {
  private email: string;
  private rememberEmail: boolean;
  private rememberedEmailState: GlobalState<string>;

  // private stateService: StateService,
  constructor(private stateProvider: StateProvider) {
    console.log("STATE PROVIDER");
    console.log(stateProvider);
    this.rememberedEmailState = this.stateProvider.getGlobal(REMEMBERED_EMAIL);
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

  getRememberedEmail(): Promise<string> {
    return firstValueFrom(this.rememberedEmailState.state$);
  }

  async setRememberedEmail(value: string): Promise<void> {
    await this.rememberedEmailState.update((_) => value);
  }

  async saveEmailSettings() {
    await this.setRememberedEmail(this.rememberEmail ? this.email : null);
    // await this.stateService.setRememberedEmail(this.rememberEmail ? this.email : null);
    this.clearValues();
  }
}
