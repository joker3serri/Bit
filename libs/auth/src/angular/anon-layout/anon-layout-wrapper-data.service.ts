import { Observable } from "rxjs";

import { AnonLayoutWrapperData } from "./anon-layout-wrapper.component";

export abstract class AnonLayoutWrapperDataService {
  /**
   *
   * @param data - The data to set on the AnonLayoutWrapperComponent to feed into the AnonLayoutComponent.
   */
  abstract setAnonLayoutWrapperData(data: AnonLayoutWrapperData): void;

  /**
   * Reactively gets the current AnonLayoutWrapperData.
   */
  abstract anonLayoutWrapperData$(): Observable<AnonLayoutWrapperData>;
}
