import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  standalone: true,
  templateUrl: "subscription.component.html",
})
export class SubscriptionComponent {
  protected loading = true;

  constructor(private activateRoute: ActivatedRoute) {}
}
