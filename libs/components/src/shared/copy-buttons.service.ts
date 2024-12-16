// FIXME: Update this file to be type safe and remove this and next line
// @ts-strict-ignore
import { Observable } from "rxjs";

/** Global config for the Bitwarden Design System */
export abstract class CopyButtonsService {
  /**
   * When true, enables "copy buttons".
   **/
  enabled$: Observable<boolean>;
}
