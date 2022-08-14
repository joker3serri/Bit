export enum AuthenticationStatus {
  LoggedOut = 0,
  Locked = 1,
  Unlocked = 2,
}

export const lockedUnlockedStatusString = (status: AuthenticationStatus): string => {
  switch (status) {
    case AuthenticationStatus.LoggedOut:
    case AuthenticationStatus.Locked:
      return "locked";
    case AuthenticationStatus.Unlocked:
      return "unlocked";
  }
};
