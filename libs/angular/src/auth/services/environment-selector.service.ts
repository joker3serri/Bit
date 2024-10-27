import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

/**
 * Provides an observable stream that components can subscribe to in order to be notified when
 * the self-hosted settings dialog needs to be opened.
 */
@Injectable({
  providedIn: "root",
})
export class EnvironmentSelectorService {
  private selfHostedSettingsSource = new Subject<void>();
  selfHostedSettings$ = this.selfHostedSettingsSource.asObservable();

  triggerSelfHostedSettings() {
    this.selfHostedSettingsSource.next();
  }
}
