import { Observable } from "rxjs";

/**
 * Manages the state of a single organization management preference.
 * Can be used to subscribe to or update a given property.
 */
export class OrganizationManagementPreference<T> {
  state$: Observable<T>;
  update: (value: T) => Promise<void>;

  constructor(state$: Observable<T>, updateFn: (value: T) => Promise<void>) {
    this.state$ = state$;
    this.update = updateFn;
  }
}

/**
 * Publishes state of a given user's personal settings relating to the user experience of managing an organization.
 */
export abstract class OrganizationManagementPreferencesService {
  autoConfirmFingerPrints: OrganizationManagementPreference<boolean>;
}
