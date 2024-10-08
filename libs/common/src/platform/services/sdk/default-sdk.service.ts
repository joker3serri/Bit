import {
  combineLatest,
  concatMap,
  firstValueFrom,
  Observable,
  shareReplay,
  tap,
  map,
  filter,
} from "rxjs";

import {
  BitwardenClient,
  ClientSettings,
  LogLevel,
  DeviceType as SdkDeviceType,
} from "@bitwarden/sdk-internal";

import { ApiService } from "../../../abstractions/api.service";
import { AccountService } from "../../../auth/abstractions/account.service";
import { TokenService } from "../../../auth/abstractions/token.service";
import { DeviceType } from "../../../enums/device-type.enum";
import { UserId } from "../../../types/guid";
import { Environment, EnvironmentService } from "../../abstractions/environment.service";
import { PlatformUtilsService } from "../../abstractions/platform-utils.service";
import { SdkClientFactory } from "../../abstractions/sdk/sdk-client-factory";
import { SdkService } from "../../abstractions/sdk/sdk.service";

export class DefaultSdkService implements SdkService {
  private sdkClientCache = new Map<UserId, Observable<BitwardenClient>>();

  client$ = this.environmentService.environment$.pipe(
    concatMap(async (env) => {
      const settings = this.toSettings(env);
      return await this.sdkClientFactory.createSdkClient(settings, LogLevel.Info);
    }),
    shareReplay({ refCount: true, bufferSize: 1 }),
    tap((client) => {
      (window as any).client = client;
    }),
  );

  supported$ = this.client$.pipe(
    concatMap(async (client) => {
      return client.echo("bitwarden wasm!") === "bitwarden wasm!";
    }),
  );

  constructor(
    private sdkClientFactory: SdkClientFactory,
    private environmentService: EnvironmentService,
    private platformUtilsService: PlatformUtilsService,
    private accountService: AccountService,
    private tokenService: TokenService,
    private apiService: ApiService, // Yes we shouldn't import ApiService, but it's temporary
    private userAgent: string = null,
  ) {}

  userClient$(userId: UserId): Observable<BitwardenClient> {
    // TODO: Figure out what happens when the user logs out
    if (this.sdkClientCache.has(userId)) {
      return this.sdkClientCache.get(userId);
    }

    const account$ = this.accountService.accounts$.pipe(map((accounts) => accounts[userId]));
    const token$ = this.tokenService.hasAccessToken$(userId).pipe(
      filter((hasToken) => hasToken),
      concatMap(() => this.tokenService.getAccessToken(userId)),
    );

    const client$ = combineLatest([this.environmentService.environment$, account$, token$]).pipe(
      concatMap(async ([env, account, token]) => {
        const settings = this.toSettings(env);
        const client = await this.sdkClientFactory.createSdkClient(settings, LogLevel.Info);

        // TODO: Init client crypto

        return client;
      }),
    );

    this.sdkClientCache.set(userId, client$);
    return client$;
  }

  async failedToInitialize(): Promise<void> {
    // Only log on cloud instances
    if (
      this.platformUtilsService.isDev() ||
      !(await firstValueFrom(this.environmentService.environment$)).isCloud
    ) {
      return;
    }

    return this.apiService.send("POST", "/wasm-debug", null, false, false, null, (headers) => {
      headers.append("SDK-Version", "1.0.0");
    });
  }

  private toSettings(env: Environment): ClientSettings {
    return {
      apiUrl: env.getApiUrl(),
      identityUrl: env.getIdentityUrl(),
      deviceType: this.toDevice(this.platformUtilsService.getDevice()),
      userAgent: this.userAgent ?? navigator.userAgent,
    };
  }

  private toDevice(device: DeviceType): SdkDeviceType {
    switch (device) {
      case DeviceType.Android:
        return "Android";
      case DeviceType.iOS:
        return "iOS";
      case DeviceType.ChromeExtension:
        return "ChromeExtension";
      case DeviceType.FirefoxExtension:
        return "FirefoxExtension";
      case DeviceType.OperaExtension:
        return "OperaExtension";
      case DeviceType.EdgeExtension:
        return "EdgeExtension";
      case DeviceType.WindowsDesktop:
        return "WindowsDesktop";
      case DeviceType.MacOsDesktop:
        return "MacOsDesktop";
      case DeviceType.LinuxDesktop:
        return "LinuxDesktop";
      case DeviceType.ChromeBrowser:
        return "ChromeBrowser";
      case DeviceType.FirefoxBrowser:
        return "FirefoxBrowser";
      case DeviceType.OperaBrowser:
        return "OperaBrowser";
      case DeviceType.EdgeBrowser:
        return "EdgeBrowser";
      case DeviceType.IEBrowser:
        return "IEBrowser";
      case DeviceType.UnknownBrowser:
        return "UnknownBrowser";
      case DeviceType.AndroidAmazon:
        return "AndroidAmazon";
      case DeviceType.UWP:
        return "UWP";
      case DeviceType.SafariBrowser:
        return "SafariBrowser";
      case DeviceType.VivaldiBrowser:
        return "VivaldiBrowser";
      case DeviceType.VivaldiExtension:
        return "VivaldiExtension";
      case DeviceType.SafariExtension:
        return "SafariExtension";
      case DeviceType.Server:
        return "Server";
      case DeviceType.WindowsCLI:
        return "WindowsCLI";
      case DeviceType.MacOsCLI:
        return "MacOsCLI";
      case DeviceType.LinuxCLI:
        return "LinuxCLI";
      default:
        return "SDK";
    }
  }
}
