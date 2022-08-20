// @ts-strict-ignore
import { ScimProviderType } from "@bitwarden/common/enums/scimProviderType";

export class ScimConfigRequest {
  constructor(private enabled: boolean, private scimProvider: ScimProviderType = null) {}
}
