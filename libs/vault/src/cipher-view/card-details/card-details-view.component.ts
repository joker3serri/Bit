import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { CardView } from "@bitwarden/common/vault/models/view/card.view";
import {
  BannerModule,
  CalloutModule,
  CardComponent,
  FormFieldModule,
  IconButtonModule,
  SectionComponent,
  SectionHeaderComponent,
  TypographyModule,
} from "@bitwarden/components";

@Component({
  selector: "app-card-details-view",
  templateUrl: "card-details-view.component.html",
  standalone: true,
  imports: [
    BannerModule,
    CalloutModule,
    CommonModule,
    JslibModule,
    CardComponent,
    SectionComponent,
    SectionHeaderComponent,
    TypographyModule,
    FormFieldModule,
    IconButtonModule,
  ],
})
export class CardDetailsComponent implements OnInit {
  @Input() card: CardView;
  cardIsExpired: boolean = false;

  constructor(private i18nService: I18nService) {}

  async ngOnInit() {
    this.cardIsExpired = this.isCardExpiryInThePast();
  }

  get setSectionTitle() {
    if (this.card.brand && this.card.brand !== "Other") {
      return this.i18nService.t("cardBrandDetails", this.card.brand);
    }
    return this.i18nService.t("cardDetails");
  }

  isCardExpiryInThePast() {
    if (this.card) {
      const { expMonth, expYear }: CardView = this.card;

      if (expYear && expMonth) {
        // `Date` months are zero-indexed
        const parsedMonth = parseInt(expMonth) - 1;
        const parsedYear = parseInt(expYear);

        // First day of the next month minus one, to get last day of the card month
        const cardExpiry = new Date(parsedYear, parsedMonth + 1, 0);
        const now = new Date();

        return cardExpiry < now;
      }
    }

    return false;
  }
}
