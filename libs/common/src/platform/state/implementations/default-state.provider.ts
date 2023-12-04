import { GlobalStateProvider } from "../global-state.provider";
import { StateProvider } from "../state.provider";
import { ActiveUserStateProvider, SingleUserStateProvider } from "../user-state.provider";

export class DefaultStateProvider implements StateProvider {
  constructor(
    private readonly activeUserStateProvider: ActiveUserStateProvider,
    private readonly singleUserStateProvider: SingleUserStateProvider,
    private readonly globalStateProvider: GlobalStateProvider,
  ) {}

  getActive = this.activeUserStateProvider.get;
  getUser = this.singleUserStateProvider.get;
  getGlobal = this.globalStateProvider.get;
}
