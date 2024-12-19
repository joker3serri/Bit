import {ContextProvider} from '@lit/context';
import {LitElement, html} from 'lit';

import {themeContext} from '../contexts/theme';

import {NotificationContainer} from './container';


export class HostContainer extends LitElement {
  private _provider = new ContextProvider(this, {context: themeContext});
  private notificationBarIframeInitData: any;

  render() {
    // return NotificationContainer({
    //     ...notificationBarIframeInitData,
    //     theme: resolvedTheme,
    //     handleCloseNotification,
    //     i18n,
    //   });
  }
}
