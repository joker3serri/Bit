import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import "bootstrap";
import "jquery";
import "popper.js";

require("./scss/styles.scss");
require("./scss/tailwind.css");

import { AppModule } from "./app/app.module";

if (process.env.NODE_ENV === "production") {
  console.log(process.env.NODE_ENV);
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule, { preserveWhitespaces: true });
