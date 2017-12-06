import MainBackground from './background/main.background';
import i18nService from './services/i18n.service';
import UtilsService from './services/utils.service';

// tslint:disable-next-line:variable-name
const bg_isBackground = (window as any).bg_isBackground = true;

// tslint:disable-next-line:variable-name
const bg_main = (window as any).bg_main = new MainBackground(i18nService(new UtilsService()));
// tslint:disable-next-line:no-var-requires
require('./scripts/analytics.js');
bg_main.bootstrap();
