import { EffLongWordGenerationOptions } from "./eff-long-word-generator-options";

export type UsernameGeneratorOptions = EffLongWordGenerationOptions & {
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
  forwardedDuckDuckGoToken?: string;
  forwardedFirefoxApiToken?: string;
  forwardedFastmailApiToken?: string;
  forwardedForwardEmailApiToken?: string;
  forwardedForwardEmailDomain?: string;
  forwardedSimpleLoginApiKey?: string;
  forwardedSimpleLoginBaseUrl?: string;
};
