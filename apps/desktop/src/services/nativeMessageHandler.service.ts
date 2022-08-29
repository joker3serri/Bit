import { Injectable } from "@angular/core";
import { ipcRenderer } from "electron";

import { CipherService } from "@bitwarden/common/abstractions/cipher.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { CryptoFunctionService } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { AuthenticationStatus } from "@bitwarden/common/enums/authenticationStatus";
import { CipherType } from "@bitwarden/common/enums/cipherType";
import { NativeMessagingVersion } from "@bitwarden/common/enums/nativeMessagingVersion";
import { PolicyType } from "@bitwarden/common/enums/policyType";
import { Utils } from "@bitwarden/common/misc/utils";
import { EncString } from "@bitwarden/common/models/domain/encString";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetricCryptoKey";
import { CipherView } from "@bitwarden/common/models/view/cipherView";
import { LoginUriView } from "@bitwarden/common/models/view/loginUriView";
import { LoginView } from "@bitwarden/common/models/view/loginView";
import { AuthService } from "@bitwarden/common/services/auth.service";
import { StateService } from "@bitwarden/common/services/state.service";

import { CipherResponse } from "src/models/nativeMessaging/cipherResponse";
import { CredentialCreatePayload } from "src/models/nativeMessaging/credentialCreatePayload";
import { CredentialUpdatePayload } from "src/models/nativeMessaging/credentialUpdatePayload";
import { DecryptedCommandData } from "src/models/nativeMessaging/decryptedCommandData";
import { EncryptedMessage } from "src/models/nativeMessaging/encryptedMessage";
import { EncryptedMessageResponse } from "src/models/nativeMessaging/encryptedMessageResponse";
import { Message } from "src/models/nativeMessaging/message";
import { UnencryptedMessage } from "src/models/nativeMessaging/unencryptedMessage";
import { UnencryptedMessageResponse } from "src/models/nativeMessaging/unencryptedMessageResponse";

const EncryptionAlgorithm = "sha1";

@Injectable()
export class NativeMessageHandler {
  private ddgSharedSecret: SymmetricCryptoKey;

  constructor(
    private stateService: StateService,
    private authService: AuthService,
    private cryptoService: CryptoService,
    private cryptoFunctionService: CryptoFunctionService,
    private cipherService: CipherService,
    private policyService: PolicyService,
    private messagingService: MessagingService,

    private passwordGenerationService: PasswordGenerationService
  ) {}

  async handleMessage(message: Message) {
    const decryptedCommand = message as UnencryptedMessage;
    if (message.version != NativeMessagingVersion.Latest) {
      this.sendResponse({
        messageId: message.messageId,
        version: NativeMessagingVersion.Latest,
        payload: {
          error: "version-discrepancy",
        },
      });
    } else {
      if (decryptedCommand.command === "bw-handshake") {
        await this.handleDecryptedMessage(decryptedCommand);
      } else {
        await this.handleEncryptedMessage(message as EncryptedMessage);
      }
    }
  }

  private async handleDecryptedMessage(message: UnencryptedMessage) {
    let encryptedSecret: ArrayBuffer;
    const { messageId, payload } = message;
    const { publicKey } = payload;
    if (!publicKey) {
      this.sendResponse({
        messageId: messageId,
        version: NativeMessagingVersion.Latest,
        payload: {
          error: "cannot-decrypt",
        },
      });
      return;
    }

    try {
      const remotePublicKey = Utils.fromB64ToArray(publicKey).buffer;
      const ddgEnabled = await this.stateService.getEnableDuckDuckGoBrowserIntegration();

      if (!ddgEnabled) {
        this.sendResponse({
          messageId: messageId,
          version: NativeMessagingVersion.Latest,
          payload: {
            status: "canceled",
          },
        });

        return;
      }

      const secret = await this.cryptoFunctionService.randomBytes(64);
      this.ddgSharedSecret = new SymmetricCryptoKey(secret);
      encryptedSecret = await this.cryptoFunctionService.rsaEncrypt(
        secret,
        remotePublicKey,
        EncryptionAlgorithm
      );
    } catch (error) {
      this.sendResponse({
        messageId: messageId,
        version: NativeMessagingVersion.Latest,
        payload: {
          error: "cannot-decrypt",
        },
      });
    }

    await this.stateService.setDuckDuckGoSharedKey(Utils.fromBufferToB64(encryptedSecret));

    this.sendResponse({
      messageId: messageId,
      version: NativeMessagingVersion.Latest,
      payload: {
        status: "success",
        sharedKey: Utils.fromBufferToB64(encryptedSecret),
      },
    });
  }

  private async handleEncryptedMessage(message: EncryptedMessage) {
    message.encryptedCommand = EncString.fromJSON(message.encryptedCommand.toString());
    const decryptedCommandData = await this.decryptPayload(message);
    const { command } = decryptedCommandData;

    try {
      const responseData = await this.responseDataForCommand(decryptedCommandData);

      await this.sendEncryptedResponse(message, { command, payload: responseData });
    } catch (error) {
      this.sendEncryptedResponse(message, { command, payload: {} });
    }
  }

  private async responseDataForCommand(commandData: DecryptedCommandData): Promise<any> {
    const { command, payload } = commandData;

    switch (command) {
      case "bw-status": {
        const accounts = this.stateService.accounts.getValue();
        const activeUserId = await this.stateService.getUserId();

        if (!accounts || !Object.keys(accounts)) {
          return [];
        }

        return Promise.all(
          Object.keys(accounts).map(async (userId) => {
            const authStatus = await this.authService.getAuthStatus(userId);
            const email = await this.stateService.getEmail({ userId });

            return {
              id: userId,
              email,
              status: authStatus === AuthenticationStatus.Unlocked ? "unlocked" : "locked",
              active: userId === activeUserId,
            };
          })
        );
      }
      case "bw-credential-retrieval": {
        if (payload.uri == null) {
          return;
        }

        const ciphersResponse: CipherResponse[] = [];
        const activeUserId = await this.stateService.getUserId();
        const authStatus = await this.authService.getAuthStatus(activeUserId);

        if (authStatus !== AuthenticationStatus.Unlocked) {
          return { error: "locked" };
        }

        const ciphers = await this.cipherService.getAllDecryptedForUrl(payload.uri);
        ciphers.sort((a, b) => this.cipherService.sortCiphersByLastUsedThenName(a, b));

        ciphers.forEach((c) => {
          ciphersResponse.push({
            userId: activeUserId,
            credentialId: c.id,
            userName: c.login.username,
            password: c.login.password,
            name: c.name,
          } as CipherResponse);
        });

        return ciphersResponse;
      }
      case "bw-credential-create": {
        const activeUserId = await this.stateService.getUserId();
        if (payload.userId !== activeUserId) {
          return { error: "not-active-user" };
        }

        const authStatus = await this.authService.getAuthStatus(activeUserId);
        if (authStatus !== AuthenticationStatus.Unlocked) {
          return { error: "locked" };
        }

        const credentialCreatePayload = payload as CredentialCreatePayload;

        if (
          credentialCreatePayload.name == null ||
          (await this.policyService.policyAppliesToUser(PolicyType.PersonalOwnership))
        ) {
          return { status: "failure" };
        }

        const cipherView = new CipherView();
        cipherView.type = CipherType.Login;
        cipherView.name = payload.name;
        cipherView.login = new LoginView();
        cipherView.login.password = credentialCreatePayload.password;
        cipherView.login.username = credentialCreatePayload.userName;
        cipherView.login.uris = [new LoginUriView()];
        cipherView.login.uris[0].uri = credentialCreatePayload.uri;

        try {
          const encrypted = await this.cipherService.encrypt(cipherView);
          await this.cipherService.saveWithServer(encrypted);

          // Notify other clients of new login
          await this.messagingService.send("addedCipher");
          // Refresh Desktop ciphers list
          await this.messagingService.send("refreshCiphers");

          return { status: "success" };
        } catch (error) {
          return { status: "failure" };
        }
      }
      case "bw-credential-update": {
        const activeUserId = await this.stateService.getUserId();
        if (payload.userId !== activeUserId) {
          return { error: "not-active-user" };
        }

        const authStatus = await this.authService.getAuthStatus(activeUserId);
        if (authStatus !== AuthenticationStatus.Unlocked) {
          return { error: "locked" };
        }

        const credentialUpdatePayload = payload as CredentialUpdatePayload;

        if (credentialUpdatePayload.name == null) {
          return { status: "failure" };
        }

        try {
          const cipher = await this.cipherService.get(credentialUpdatePayload.credentialId);
          if (cipher === null) {
            return { status: "failure" };
          }
          const cipherView = await cipher.decrypt();
          cipherView.name = credentialUpdatePayload.name;
          cipherView.login.password = credentialUpdatePayload.password;
          cipherView.login.username = credentialUpdatePayload.userName;
          cipherView.login.uris[0].uri = credentialUpdatePayload.uri;
          const encrypted = await this.cipherService.encrypt(cipherView);

          await this.cipherService.saveWithServer(encrypted);

          // Notify other clients of update
          await this.messagingService.send("editedCipher");
          // Refresh Desktop ciphers list
          await this.messagingService.send("refreshCiphers");

          return { status: "success" };
        } catch (error) {
          return { status: "failure" };
        }
      }
      case "bw-generate-password": {
        const activeUserId = await this.stateService.getUserId();

        if (payload.userId !== activeUserId) {
          return { error: "not-active-user" };
        }

        const options = (await this.passwordGenerationService.getOptions())[0];
        const generatedValue = await this.passwordGenerationService.generatePassword(options);

        return { password: generatedValue };
      }
      default:
        return {
          error: "cannot-decrypt",
        };
    }
  }

  private async encyptPayload(payload: any, key: SymmetricCryptoKey): Promise<EncString> {
    return await this.cryptoService.encrypt(JSON.stringify(payload), key);
  }

  private async decryptPayload(message: EncryptedMessage): Promise<DecryptedCommandData> {
    if (!this.ddgSharedSecret) {
      this.sendResponse({
        messageId: message.messageId,
        version: NativeMessagingVersion.Latest,
        payload: {
          error: "cannot-decrypt",
        },
      });
      return;
    }

    return JSON.parse(
      await this.cryptoService.decryptToUtf8(
        message.encryptedCommand as EncString,
        this.ddgSharedSecret
      )
    );
  }

  private async sendEncryptedResponse(
    originalMessage: EncryptedMessage,
    response: DecryptedCommandData
  ) {
    if (!this.ddgSharedSecret) {
      this.sendResponse({
        messageId: originalMessage.messageId,
        version: NativeMessagingVersion.Latest,
        payload: {
          error: "cannot-decrypt",
        },
      });

      return;
    }

    const encryptedPayload = await this.encyptPayload(response, this.ddgSharedSecret);

    this.sendResponse({
      messageId: originalMessage.messageId,
      version: NativeMessagingVersion.Latest,
      encryptedPayload,
    });
  }

  private sendResponse(response: EncryptedMessageResponse | UnencryptedMessageResponse) {
    ipcRenderer.send("nativeMessagingReply", response);
  }
}
