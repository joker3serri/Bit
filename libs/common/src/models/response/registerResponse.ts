import { BaseResponse } from "./baseResponse";

export class RegisterResponse extends BaseResponse {
  captchaBypassToken: string;

  constructor(response: any) {
    super(response);
    this.captchaBypassToken = this.getResponseProperty("CaptchaBypassToken");
  }
}
