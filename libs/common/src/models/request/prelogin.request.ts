// TODO: Should this be moved into auth request folder?
export class PreloginRequest {
  email: string;

  constructor(email: string) {
    this.email = email;
  }
}
