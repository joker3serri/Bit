// @ts-strict-ignore
export abstract class AppIdService {
  getAppId: () => Promise<string>;
  getAnonymousAppId: () => Promise<string>;
}
