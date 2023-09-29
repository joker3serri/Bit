export enum BiometricStorageAction {
  EnabledForUser = "enabled",
  OsSupported = "osSupported",
  Authenticate = "authenticate",
}

export type BiometricMessage = {
  action: BiometricStorageAction;
  keySuffix?: string;
  key?: string;
  userId?: string;
};
