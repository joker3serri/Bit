import { css } from "@emotion/css";
import { ContextConsumer } from "@lit/context";
import { html } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { themes } from "../constants/styles";
import { themeContext } from "../contexts/theme";
  // const theme = new ContextConsumer(this, {context: themeContext, subscribe: true, callback: (ctx) => {console.log('context callback!')}} );

export function NotificationHeaderMessage({ message, theme }: { message: string; theme: Theme }) {
  return html`
    <span title=${message} class=${notificationHeaderMessageStyles(theme)}>${message}</span>
  `;
}

const notificationHeaderMessageStyles = (theme: Theme) => css`
  flex-grow: 1;
  overflow-x: hidden;
  text-align: left;
  text-overflow: ellipsis;
  line-height: 28px;
  white-space: nowrap;
  color: ${themes[theme].text.main};
  font-family: "DM Sans", sans-serif;
  font-size: 18px;
  font-weight: 600;
`;
