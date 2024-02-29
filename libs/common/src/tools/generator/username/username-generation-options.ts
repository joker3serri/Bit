import { EffUsernameGenerationOptions } from "./eff-username-generator-options";

export type UsernameGeneratorOptions = EffUsernameGenerationOptions & {
  type?: "word" | "subaddress" | "catchall" | "forwarded";
  subaddressType?: "random" | "website-name";
  subaddressEmail?: string;
  catchallType?: "random" | "website-name";
  catchallDomain?: string;
  website?: string;
  forwardedService?: string;
  forwardedAnonAddyApiToken?: string;
  forwardedAnonAddyDomain?: string;
  forwardedAnonAddyBaseUrl?: string;
  cloudflareType?: "random" | "website-name";
  forwardedCloudflareApiToken?: string;
  forwardedCloudflareAccountId?: string;
  forwardedCloudflareZoneId?: string;
  forwardedCloudflareAliasDomain?: string;
  forwardedCloudflareRecipient?: string;
  forwardedDuckDuckGoToken?: string;
  forwardedFirefoxApiToken?: string;
  forwardedFastmailApiToken?: string;
  forwardedForwardEmailApiToken?: string;
  forwardedForwardEmailDomain?: string;
  forwardedSimpleLoginApiKey?: string;
  forwardedSimpleLoginBaseUrl?: string;
};
