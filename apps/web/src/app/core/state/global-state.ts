import { ThemeType } from "@bitwarden/common/enums/theme-type";
import { GlobalState as BaseGlobalState } from "@bitwarden/common/models/domain/global-state";

export class GlobalState extends BaseGlobalState {
  theme?: ThemeType = ThemeType.Light;
  rememberEmail = true;
}
