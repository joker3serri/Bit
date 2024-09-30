import * as sdk from "@bitwarden/sdk-internal";
import * as module from "@bitwarden/sdk-internal/bitwarden_wasm_internal_bg.wasm";

import { SdkClientFactory } from "../../abstractions/sdk/sdk-client-factory";

export class DefaultSdkClientFactory implements SdkClientFactory {
  async createSdkClient(
    ...args: ConstructorParameters<typeof sdk.BitwardenClient>
  ): Promise<sdk.BitwardenClient> {
    (sdk as any).init(module);

    return Promise.resolve(new sdk.BitwardenClient(...args));
  }
}
