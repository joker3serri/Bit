import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { LoginView } from "@bitwarden/common/vault/models/view/login.view";
import {
  CardComponent,
  FormFieldModule,
  SectionComponent,
  SectionHeaderComponent,
  TypographyModule,
  IconButtonModule,
} from "@bitwarden/components";

@Component({
  selector: "app-login-credentials-view",
  templateUrl: "login-credentials-view.component.html",
  standalone: true,
  imports: [
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
export class LoginCredentialsViewComponent {
  @Input() login: LoginView;
}
