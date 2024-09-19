import { Injectable, OnDestroy } from "@angular/core";
import {
  catchError,
  combineLatest,
  concatMap,
  filter,
  from,
  map,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
  timeout,
  TimeoutError,
  timer,
  withLatestFrom,
} from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { CommandDefinition, MessageListener } from "@bitwarden/common/platform/messaging";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CipherType } from "@bitwarden/common/vault/enums";
import { DialogService, ToastService } from "@bitwarden/components";

import { ApproveSshRequestComponent } from "../components/approve-ssh-request";

import { DesktopSettingsService } from "./desktop-settings.service";

// type SshRequest = {
//   cipherId: string;
//   requestId: number;
//   timeout: boolean;
// };

@Injectable({
  providedIn: "root",
})
export class SshAgentService implements OnDestroy {
  SSH_REFRESH_INTERVAL = 1000;
  SSH_VAULT_UNLOCK_REQUEST_TIMEOUT = 1000 * 10;
  SSH_REQUEST_UNLOCK_POLLING_INTERVAL = 100;

  private destroy$ = new Subject<void>();

  constructor(
    private cipherService: CipherService,
    private logService: LogService,
    private dialogService: DialogService,
    private messageListener: MessageListener,
    private authService: AuthService,
    private accountService: AccountService,
    private toastService: ToastService,
    private i18nService: I18nService,
    private desktopSettingsService: DesktopSettingsService,
  ) {
    this.messageListener
      .messages$(new CommandDefinition("sshagent.signrequest"))
      .pipe(
        withLatestFrom(this.authService.activeAccountStatus$),
        // switchMap will stop waiting for an unlock if a new request comes in
        switchMap(([message, status]) => {
          ipc.platform.focusWindow();
          if (status !== AuthenticationStatus.Unlocked) {
            this.toastService.showToast({
              variant: "info",
              title: null,
              message: this.i18nService.t("sshAgentUnlockRequired"),
            });
            return this.authService.activeAccountStatus$.pipe(
              filter((status) => status === AuthenticationStatus.Unlocked),
              timeout(this.SSH_VAULT_UNLOCK_REQUEST_TIMEOUT),
              catchError((error: unknown) => {
                if (error instanceof TimeoutError) {
                  this.toastService.showToast({
                    variant: "error",
                    title: null,
                    message: this.i18nService.t("sshAgentUnlockTimeout"),
                  });
                  return of();
                }

                throw error;
              }),
              map(() => message),
            );
          }

          return of(message);
        }),
        switchMap((message) =>
          from(this.cipherService.getAllDecrypted()).pipe(
            map((ciphers) => [message, ciphers] as const),
          ),
        ),
        concatMap(([message, decryptedCiphers]) => {
          const cipherId = message.cipherId as string;
          const requestId = message.requestId as number;
          const cipher = decryptedCiphers.find((cipher) => cipher.id == cipherId);

          const dialogRef = ApproveSshRequestComponent.open(
            this.dialogService,
            cipher.name,
            this.i18nService.t("unknownApplication"),
          );

          return dialogRef.closed.pipe(
            switchMap((result) => ipc.platform.sshAgent.signRequestResponse(requestId, result)),
            tap(() => ipc.platform.hideWindow()),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        // Please not that any error here will have cause the whole stream to
        error: (error: unknown) => {
          this.logService.error("Error processing sshagent.signrequest", error);
        },
      });

    // this.messageListener
    //   .messages$(new CommandDefinition("sshagent.signrequest"))
    //   .pipe(
    //     tap(() => ipc.platform.focusWindow()),
    //     concatMap(async (message: any) => {
    //       if (
    //         (await firstValueFrom(this.authService.activeAccountStatus$)) !==
    //         AuthenticationStatus.Unlocked
    //       ) {
    //         this.toastService.showToast({
    //           variant: "info",
    //           title: null,
    //           message: this.i18nService.t("sshAgentUnlockRequired"),
    //         });
    //       }
    //       return message;
    //     }),
    //     switchMap(async (message: any) => {
    //       const cipherId = message.cipherId;
    //       const requestId = message.requestId;

    //       const ret = race([
    //         of({ cipherId, requestId, timeout: true } as SshRequest).pipe(
    //           delay(this.SSH_VAULT_UNLOCK_REQUEST_TIMEOUT),
    //         ),
    //         this.authService.activeAccountStatus$.pipe(
    //           map((status) => {
    //             return status;
    //           }),
    //           filter((status) => status === AuthenticationStatus.Unlocked),
    //           map(() => {
    //             return {
    //               cipherId,
    //               requestId,
    //               timeout: false,
    //             } as SshRequest;
    //           }),
    //         ),
    //       ]);
    //       return await firstValueFrom(ret);
    //     }),
    //     concatMap(async (request: SshRequest) => {
    //       if (request.timeout) {
    //         this.toastService.showToast({
    //           variant: "error",
    //           title: null,
    //           message: this.i18nService.t("sshAgentUnlockTimeout"),
    //         });
    //       } else {
    //         const decryptedCiphers = await this.cipherService.getAllDecrypted();
    //         const cipher = decryptedCiphers.find((cipher) => cipher.id == request.cipherId);

    //         const dialogRef = ApproveSshRequestComponent.open(
    //           this.dialogService,
    //           cipher.name,
    //           this.i18nService.t("unknownApplication"),
    //         );

    //         const result = await firstValueFrom(dialogRef.closed);
    //         await ipc.platform.sshAgent.signRequestResponse(request.requestId, result);
    //         ipc.platform.hideWindow();
    //       }
    //     }),
    //     takeUntil(this.destroy$),
    //   )
    //   .subscribe();

    combineLatest([
      timer(0, this.SSH_REFRESH_INTERVAL),
      this.desktopSettingsService.sshAgentEnabled$,
    ])
      .pipe(
        concatMap(async ([, enabled]) => {
          if (!enabled) {
            await ipc.platform.sshAgent.setKeys([]);
            return;
          }

          const ciphers = await this.cipherService.getAllDecrypted();
          if (ciphers == null) {
            await ipc.platform.sshAgent.lock();
            return;
          }

          const sshCiphers = ciphers.filter(
            (cipher) => cipher.type === CipherType.SshKey && !cipher.isDeleted,
          );
          const keys = sshCiphers.map((cipher) => {
            return {
              name: cipher.name,
              privateKey: cipher.sshKey.privateKey,
              cipherId: cipher.id,
            };
          });
          await ipc.platform.sshAgent.setKeys(keys);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
