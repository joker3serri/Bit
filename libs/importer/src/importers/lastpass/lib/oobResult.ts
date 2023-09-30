export class OobResult {
  waitForOutOfBand: boolean;
  passcode: string;
  rememberMe: boolean;

  static cancel = new OobResult(false, "cancel", false);

  constructor(waitForOutOfBand: boolean, passcode: string, rememberMe: boolean) {
    this.waitForOutOfBand = waitForOutOfBand;
    this.passcode = passcode;
    this.rememberMe = rememberMe;
  }

  waitForApproval(rememberMe: boolean) {
    return new OobResult(true, "", rememberMe);
  }

  continueWithPasscode(passcode: string, rememberMe: boolean) {
    return new OobResult(false, passcode, rememberMe);
  }
}
