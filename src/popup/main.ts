import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// Polyfills
import 'web-animations-js';
import 'core-js/stable';
import 'zone.js/dist/zone';

// tslint:disable-next-line
require('./scss/popup.scss');

import { AppModule } from './app.module';

if (process.env.ENV === 'production') {
    enableProdMode();
}

function init() {
    platformBrowserDynamic().bootstrapModule(AppModule, { preserveWhitespaces: true });
}

init();
