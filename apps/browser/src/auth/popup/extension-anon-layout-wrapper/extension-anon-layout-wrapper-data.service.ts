import { Observable, Subject } from "rxjs";

import { AnonLayoutWrapperDataService } from "@bitwarden/auth/angular";

import { ExtensionAnonLayoutWrapperData } from "./extension-anon-layout-wrapper.component";

export class ExtensionAnonLayoutWrapperDataService implements AnonLayoutWrapperDataService {
  private anonLayoutWrapperDataSubject = new Subject<ExtensionAnonLayoutWrapperData>();

  setAnonLayoutWrapperData(data: ExtensionAnonLayoutWrapperData): void {
    this.anonLayoutWrapperDataSubject.next(data);
  }

  anonLayoutWrapperData$(): Observable<ExtensionAnonLayoutWrapperData> {
    return this.anonLayoutWrapperDataSubject.asObservable();
  }
}
