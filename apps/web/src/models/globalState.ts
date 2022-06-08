import { ThemeType } from "@bitwarden/common/src/enums/themeType";
import { GlobalState as BaseGlobalState } from "@bitwarden/common/src/models/domain/globalState";

export class GlobalState extends BaseGlobalState {
  theme?: ThemeType = ThemeType.Light;
  rememberEmail = true;
}
