import { SsoComponentService } from "./sso-component.service";

export class DefaultSsoComponentService implements SsoComponentService {
  clientId: string | null;

  setDocumentCookies(): void {}
}
