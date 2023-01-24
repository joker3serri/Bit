import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatestWith, Observable, startWith, switchMap } from "rxjs";

import { AccessTokenView } from "../models/view/access-token.view";

import { AccessService } from "./access.service";

@Component({
  selector: "sm-access-tokens",
  templateUrl: "./access-tokens.component.html",
})
export class AccessTokenComponent implements OnInit {
  accessTokens$: Observable<AccessTokenView[]>;

  constructor(private route: ActivatedRoute, private accessService: AccessService) {}

  ngOnInit() {
    this.accessTokens$ = this.accessService.accessToken$.pipe(
      startWith(null),
      combineLatestWith(this.route.params),
      switchMap(async ([_, params]) => {
        return await this.accessService.getAccessTokens(
          params.organizationId,
          params.serviceAccountId
        );
      })
    );
  }
}
