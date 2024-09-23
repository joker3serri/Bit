import { Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { BehaviorSubject, combineLatestWith, map, Subject, switchMap, takeUntil } from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { UserId } from "@bitwarden/common/types/guid";
import { Option } from "@bitwarden/components/src/select/option";
import {
  CredentialAlgorithm,
  CredentialGeneratorService,
  EmailAlgorithm,
  GeneratedCredential,
  Generators,
  isEmailAlgorithm,
  isUsernameAlgorithm,
  UsernameAlgorithm,
  UsernameAlgorithms,
} from "@bitwarden/generator-core";

import { CatchallSettingsComponent } from "./catchall-settings.component";
import { DependenciesModule } from "./dependencies";
import { SubaddressSettingsComponent } from "./subaddress-settings.component";
import { UsernameSettingsComponent } from "./username-settings.component";
import { completeOnAccountSwitch } from "./util";

type SupportedAlgorithm = UsernameAlgorithm | EmailAlgorithm;

/** Options group for passwords */
@Component({
  standalone: true,
  selector: "tools-username-generator",
  templateUrl: "username-generator.component.html",
  imports: [
    DependenciesModule,
    CatchallSettingsComponent,
    SubaddressSettingsComponent,
    UsernameSettingsComponent,
  ],
})
export class UsernameGeneratorComponent implements OnInit, OnDestroy {
  /** Instantiates the username generator
   *  @param generatorService generates credentials; stores preferences
   *  @param i18nService localizes generator algorithm descriptions
   *  @param accountService discovers the active user when one is not provided
   *  @param zone detects generator settings updates originating from the generator services
   *  @param formBuilder binds reactive form
   */
  constructor(
    private generatorService: CredentialGeneratorService,
    private i18nService: I18nService,
    private accountService: AccountService,
    private zone: NgZone,
    private formBuilder: FormBuilder,
  ) {}

  /** Binds the passphrase component to a specific user's settings.
   *  When this input is not provided, the form binds to the active
   *  user
   */
  @Input()
  userId: UserId | null;

  /** Emits credentials created from a generation request. */
  @Output()
  readonly onGenerated = new EventEmitter<GeneratedCredential>();

  /** Tracks the selected generation algorithm */
  protected algorithm = this.formBuilder.group({
    credentialType: ["username" as SupportedAlgorithm],
  });

  async ngOnInit() {
    if (this.userId) {
      this.userId$.next(this.userId);
    } else {
      this.singleUserId$().pipe(takeUntil(this.destroyed)).subscribe(this.userId$);
    }

    this.generatorService
      .algorithms$(["email", "username"], { userId$: this.userId$ })
      .pipe(
        map((algorithms) =>
          algorithms.map(
            (algorithm) =>
              ({
                value: algorithm.id,
                label: this.i18nService.t(algorithm.nameKey),
              }) satisfies Option<CredentialAlgorithm>,
          ),
        ),
        takeUntil(this.destroyed),
      )
      .subscribe(this.credentialTypes$);

    // restore selection to the user's preferred generator algorithm
    const preferences = await this.generatorService.preferences({ singleUserId$: this.userId$ });
    preferences.pipe(takeUntil(this.destroyed)).subscribe(({ email, username }) => {
      // this generator supports email & username; the last preference
      // set by the user "wins"
      const preference = email.updated > username.updated ? email.algorithm : username.algorithm;

      // break subscription loop
      this.algorithm.setValue({ credentialType: preference }, { emitEvent: false });
      this.credentialType$.next(preference);
    });

    // assume the last-visible generator algorithm is the user's preferred one
    this.algorithm.valueChanges
      .pipe(combineLatestWith(preferences), takeUntil(this.destroyed))
      .subscribe(([algorithm, preference]) => {
        if (isEmailAlgorithm(algorithm.credentialType)) {
          preference.email.algorithm = algorithm.credentialType;
          preference.email.updated = new Date();
        } else if (isUsernameAlgorithm(algorithm.credentialType)) {
          preference.username.algorithm = algorithm.credentialType;
          preference.username.updated = new Date();
        } else {
          return;
        }

        preferences.next(preference);
      });

    // once everything is initialized, wire up the generator
    this.credentialType$
      .pipe(
        switchMap((type) => this.typeToGenerator$(type)),
        takeUntil(this.destroyed),
      )
      .subscribe((generated) => {
        // update subjects within the angular zone so that the
        // template bindings refresh immediately
        this.zone.run(() => {
          if (UsernameAlgorithms.includes(generated.category as any)) {
            this.onGenerated.next(generated);
            this.value$.next(generated.credential);
          }
        });
      });
  }

  private typeToGenerator$(type: SupportedAlgorithm) {
    const dependencies = {
      on$: this.generate$,
      userId$: this.userId$,
    };

    switch (type) {
      case "catchall":
        return this.generatorService.generate$(Generators.catchall, dependencies);

      case "subaddress":
        return this.generatorService.generate$(Generators.subaddress, dependencies);

      case "username":
        return this.generatorService.generate$(Generators.username, dependencies);

      default:
        throw new Error(`Invalid generator type: "${type}"`);
    }
  }

  /** Lists the credential types supported by the component. */
  protected credentialTypes$ = new BehaviorSubject<Option<CredentialAlgorithm>[]>([]);

  /** tracks the currently selected credential type */
  protected credentialType$ = new BehaviorSubject<SupportedAlgorithm>("username");

  /** Emits the last generated value. */
  protected readonly value$ = new BehaviorSubject<string>("");

  /** Emits when the userId changes */
  protected readonly userId$ = new BehaviorSubject<UserId>(null);

  /** Emits when a new credential is requested */
  protected readonly generate$ = new Subject<void>();

  private singleUserId$() {
    // FIXME: this branch should probably scan for the user and make sure
    // the account is unlocked
    if (this.userId) {
      return new BehaviorSubject(this.userId as UserId).asObservable();
    }

    return this.accountService.activeAccount$.pipe(
      completeOnAccountSwitch(),
      takeUntil(this.destroyed),
    );
  }

  private readonly destroyed = new Subject<void>();
  ngOnDestroy() {
    this.destroyed.complete();

    // finalize subjects
    this.generate$.complete();
    this.value$.complete();

    // finalize component bindings
    this.onGenerated.complete();
  }
}
