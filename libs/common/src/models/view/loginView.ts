import { LoginLinkedId as LinkedId } from "../../enums/linkedIdType";
import { ParsedObject, ToJsonObject, Storable } from "../../interfaces/storable";
import { linkedFieldOption } from "../../misc/linkedFieldOption.decorator";
import { Utils } from "../../misc/utils";
import { Login } from "../domain/login";

import { ItemView } from "./itemView";
import { LoginUriView } from "./loginUriView";

export class LoginView extends ItemView implements Storable<LoginView> {
  @linkedFieldOption(LinkedId.Username)
  username: string = null;
  @linkedFieldOption(LinkedId.Password)
  password: string = null;

  passwordRevisionDate?: Date = null;
  totp: string = null;
  uris: LoginUriView[] = null;
  autofillOnPageLoad: boolean = null;

  constructor(l?: Login) {
    super();
    if (!l) {
      return;
    }

    this.passwordRevisionDate = l.passwordRevisionDate;
    this.autofillOnPageLoad = l.autofillOnPageLoad;
  }

  get uri(): string {
    return this.hasUris ? this.uris[0].uri : null;
  }

  get maskedPassword(): string {
    return this.password != null ? "••••••••" : null;
  }

  get subTitle(): string {
    return this.username;
  }

  get canLaunch(): boolean {
    return this.hasUris && this.uris.some((u) => u.canLaunch);
  }

  get hasTotp(): boolean {
    return !Utils.isNullOrWhitespace(this.totp);
  }

  get launchUri(): string {
    if (this.hasUris) {
      const uri = this.uris.find((u) => u.canLaunch);
      if (uri != null) {
        return uri.launchUri;
      }
    }
    return null;
  }

  get hasUris(): boolean {
    return this.uris != null && this.uris.length > 0;
  }

  toJSON(): ToJsonObject<LoginView> {
    return this;
  }

  static fromJSON(obj: ParsedObject<LoginView>): LoginView {
    const view = new LoginView();

    view.username = obj.username;
    view.password = obj.password;
    view.totp = obj.totp;
    view.autofillOnPageLoad = obj.autofillOnPageLoad;
    view.passwordRevisionDate =
      obj.passwordRevisionDate == null ? null : new Date(obj.passwordRevisionDate);
    view.uris = obj.uris?.map((uri: any) => LoginUriView.fromJSON(uri));

    return view;
  }
}
