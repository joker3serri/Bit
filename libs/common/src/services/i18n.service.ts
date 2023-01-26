import { Observable, ReplaySubject } from "rxjs";

import { I18nService as I18nServiceAbstraction } from "../abstractions/i18n.service";

import { LocaleService } from "./locale.service";

export class I18nService extends LocaleService implements I18nServiceAbstraction {
  protected _locale = new ReplaySubject<string>(1);
  locale$: Observable<string> = this._locale.asObservable();

  constructor(
    protected systemLanguage: string,
    protected localesDirectory: string,
    protected getLocalesJson: (formattedLocale: string) => Promise<any>
  ) {
    super(systemLanguage, localesDirectory, getLocalesJson);
  }

  override async init(locale?: string) {
    if (this.inited) {
      throw new Error("i18n already initialized.");
    }
    if (this.supportedTranslationLocales == null || this.supportedTranslationLocales.length === 0) {
      throw new Error("supportedTranslationLocales not set.");
    }

    this.inited = true;
    this.translationLocale = locale != null ? locale : this.systemLanguage;
    this._locale.next(this.translationLocale);

    try {
      this.collator = new Intl.Collator(this.translationLocale, {
        numeric: true,
        sensitivity: "base",
      });
    } catch {
      this.collator = null;
    }

    if (this.supportedTranslationLocales.indexOf(this.translationLocale) === -1) {
      this.translationLocale = this.translationLocale.slice(0, 2);

      if (this.supportedTranslationLocales.indexOf(this.translationLocale) === -1) {
        this.translationLocale = this.defaultLocale;
      }
    }

    if (this.localesDirectory != null) {
      await super.loadMessages(this.translationLocale, this.localeMessages);
      if (this.translationLocale !== this.defaultLocale) {
        await super.loadMessages(this.defaultLocale, this.defaultMessages);
      }
    }
  }
}
