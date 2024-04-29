import { Decryptable } from "@bitwarden/common/platform/interfaces/decryptable.interface";
import { InitializerMetadata } from "@bitwarden/common/platform/interfaces/initializer-metadata.interface";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";
import { getClassInitializer } from "@bitwarden/common/platform/services/cryptography/get-class-initializer";
import { MultithreadEncryptServiceImplementation } from "@bitwarden/common/platform/services/cryptography/multithread-encrypt.service.implementation";

import { BrowserApi } from "../browser/browser-api";

export class BrowserMultithreadEncryptServiceImplementation extends MultithreadEncryptServiceImplementation {
  async decryptItems<T extends InitializerMetadata>(
    items: Decryptable<T>[],
    key: SymmetricCryptoKey,
  ): Promise<T[]> {
    if (!this.isOffscreenDocumentSupported()) {
      return await super.decryptItems(items, key);
    }

    return await this.decryptItemsInOffscreenDocument(items, key);
  }

  private async decryptItemsInOffscreenDocument<T extends InitializerMetadata>(
    items: Decryptable<T>[],
    key: SymmetricCryptoKey,
  ): Promise<T[]> {
    if (items == null || items.length < 1) {
      return [];
    }

    const request = {
      id: Utils.newGuid(),
      items: items,
      key: key,
    };

    await BrowserApi.createOffscreenDocument(
      [chrome.offscreen.Reason.WORKERS],
      "Use web worker to decrypt items.",
    );
    const response = (await BrowserApi.sendMessageWithResponse("offscreenDecryptItems", {
      decryptRequestId: request.id,
      decryptRequest: JSON.stringify(request),
    })) as string;
    BrowserApi.closeOffscreenDocument();

    if (!response) {
      return [];
    }

    const responseItems = JSON.parse(response);
    if (responseItems?.length < 1) {
      return [];
    }

    return responseItems.map((jsonItem: any) => {
      const initializer = getClassInitializer<T>(jsonItem.initializerKey);
      return initializer(jsonItem);
    });
  }

  private isOffscreenDocumentSupported() {
    return (
      BrowserApi.isManifestVersion(3) &&
      typeof chrome !== "undefined" &&
      typeof chrome.offscreen !== "undefined"
    );
  }
}
