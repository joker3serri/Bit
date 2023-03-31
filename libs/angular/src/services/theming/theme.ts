import { ThemeType } from "@bitwarden/common/enums/theme-type";

export interface Theme {
  configuredTheme: ThemeType;
  effectiveTheme: ThemeType;
}
