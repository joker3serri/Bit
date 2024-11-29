import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

require("../scss/styles.scss");
require("../scss/tailwind.css");

// import { SecureHeapAllocator, initGlobalAllocator } from "@bitwarden/platform";

import { AppModule } from "./app.module";

if (!ipc.platform.isDev) {
  enableProdMode();
}

// Initialize the global secure memory allocator
// initGlobalAllocator(new SecureHeapAllocator());

// FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
// eslint-disable-next-line @typescript-eslint/no-floating-promises
platformBrowserDynamic().bootstrapModule(AppModule, { preserveWhitespaces: true });

// Disable drag and drop to prevent malicious links from executing in the context of the app
document.addEventListener("dragover", (event) => event.preventDefault());
document.addEventListener("drop", (event) => event.preventDefault());
