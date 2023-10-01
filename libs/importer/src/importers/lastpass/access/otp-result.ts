export class OtpResult {
  passcode: string;
  rememberMe: boolean;

  static cancel = new OtpResult("cancel", false);

  constructor(passcode: string, rememberMe: boolean) {
    this.passcode = passcode;
    this.rememberMe = rememberMe;
  }
}
