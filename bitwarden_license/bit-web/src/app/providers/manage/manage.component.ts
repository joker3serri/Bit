import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ProviderService } from "@bitwarden/common/src/abstractions/provider.service";
import { Provider } from "@bitwarden/common/src/models/domain/provider";

@Component({
  selector: "provider-manage",
  templateUrl: "manage.component.html",
})
export class ManageComponent implements OnInit {
  provider: Provider;
  accessEvents = false;

  constructor(private route: ActivatedRoute, private providerService: ProviderService) {}

  ngOnInit() {
    this.route.parent.params.subscribe(async (params) => {
      this.provider = await this.providerService.get(params.providerId);
      this.accessEvents = this.provider.useEvents;
    });
  }
}
