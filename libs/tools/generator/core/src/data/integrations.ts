import { IntegrationId } from "@bitwarden/common/tools/integration";
import { ApiSettings } from "@bitwarden/common/tools/integration/rpc";

import { ForwarderConfiguration } from "../engine";
import { AddyIo } from "../integration/addy-io";
import { DuckDuckGo } from "../integration/duck-duck-go";
import { Fastmail } from "../integration/fastmail";
import { FirefoxRelay } from "../integration/firefox-relay";
import { ForwardEmail } from "../integration/forward-email";
import { SimpleLogin } from "../integration/simple-login";

export const Integrations = Object.freeze({
  AddyIo,
  DuckDuckGo,
  Fastmail,
  FirefoxRelay,
  ForwardEmail,
  SimpleLogin,
} as const);

const integrations = Object.fromEntries(Object.values(Integrations).map((i) => [i.id, i as ForwarderConfiguration<object>]));

export function getIntegration(id: IntegrationId) : ForwarderConfiguration<ApiSettings> {
  return integrations[id as string]
}
