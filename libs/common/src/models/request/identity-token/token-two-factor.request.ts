import { TwoFactorProviderType } from "../../../auth/enums/twoFactorProviderType";

export class TokenTwoFactorRequest {
  constructor(
    public provider: TwoFactorProviderType = null,
    public token: string = null,
    public remember: boolean = false
  ) {}
}
