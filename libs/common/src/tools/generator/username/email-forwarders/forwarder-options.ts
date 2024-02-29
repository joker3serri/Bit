export class ForwarderOptions {
  apiKey: string;
  website: string;
  fastmail = new FastmailForwarderOptions();
  anonaddy = new AnonAddyForwarderOptions();
  cloudflare = new CloudflareForwarder();
  forwardemail = new ForwardEmailForwarderOptions();
  simplelogin = new SimpleLoginForwarderOptions();
}

export class FastmailForwarderOptions {
  prefix: string;
}

export class AnonAddyForwarderOptions {
  domain: string;
  baseUrl: string;
}

export class ForwardEmailForwarderOptions {
  domain: string;
}

export class SimpleLoginForwarderOptions {
  baseUrl: string;
}

export class CloudflareForwarder {
  zoneId: string;
  accountId: string;
  alias: string;
  startString: string;
  recipient: string;
}
