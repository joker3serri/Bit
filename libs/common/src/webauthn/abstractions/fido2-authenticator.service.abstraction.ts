export abstract class Fido2AuthenticatorService {
  /**
   * Create and save a new credential
   *
   * @return {Uint8Array} Attestation object
   **/
  makeCredential: (
    params: Fido2AuthenticatorMakeCredentialsParams,
    abortController?: AbortController
  ) => Promise<Fido2AuthenticatorMakeCredentialResult>;

  /**
   * Generate an assertion using an existing credential
   */
  getAssertion: (
    params: Fido2AuthenticatorGetAssertionParams,
    abortController?: AbortController
  ) => Promise<Fido2AuthenticatorGetAssertionResult>;
}

export enum Fido2AlgorithmIdentifier {
  ES256 = -7,
  RS256 = -257,
}

export enum Fido2AutenticatorErrorCode {
  Unknown = "UnknownError",
  NotSupported = "NotSupportedError",
  InvalidState = "InvalidStateError",
  NotAllowed = "NotAllowedError",
  Constraint = "ConstraintError",
}

export class Fido2AutenticatorError extends Error {
  constructor(readonly errorCode: Fido2AutenticatorErrorCode) {
    super(errorCode);
  }
}

export interface PublicKeyCredentialDescriptor {
  id: BufferSource;
  transports?: ("ble" | "hybrid" | "internal" | "nfc" | "usb")[];
  type: "public-key";
}

/**
 * Parameters for {@link Fido2AuthenticatorService.makeCredential}
 *
 * @note
 * This interface represents the input parameters described in
 * https://www.w3.org/TR/webauthn-3/#sctn-op-make-cred
 */
export interface Fido2AuthenticatorMakeCredentialsParams {
  /** The hash of the serialized client data, provided by the client. */
  hash: BufferSource;
  /** The Relying Party's PublicKeyCredentialRpEntity. */
  rpEntity: {
    name: string;
    id?: string;
  };
  /** The user account’s PublicKeyCredentialUserEntity, containing the user handle given by the Relying Party. */
  userEntity: {
    id: BufferSource;
    name?: string;
    displayName?: string;
    icon?: string;
  };
  /** A sequence of pairs of PublicKeyCredentialType and public key algorithms (COSEAlgorithmIdentifier) requested by the Relying Party. This sequence is ordered from most preferred to least preferred. The authenticator makes a best-effort to create the most preferred credential that it can. */
  credTypesAndPubKeyAlgs: {
    alg: number;
    type: "public-key"; // not used
  }[];
  /** An OPTIONAL list of PublicKeyCredentialDescriptor objects provided by the Relying Party with the intention that, if any of these are known to the authenticator, it SHOULD NOT create a new credential. excludeCredentialDescriptorList contains a list of known credentials. */
  excludeCredentialDescriptorList?: PublicKeyCredentialDescriptor[];
  /** A map from extension identifiers to their authenticator extension inputs, created by the client based on the extensions requested by the Relying Party, if any. */
  extensions?: {
    appid?: string;
    appidExclude?: string;
    credProps?: boolean;
    uvm?: boolean;
  };
  /** A Boolean value that indicates that individually-identifying attestation MAY be returned by the authenticator. */
  enterpriseAttestationPossible?: boolean; // Ignored by bitwarden at the moment
  /** The effective resident key requirement for credential creation, a Boolean value determined by the client. */
  requireResidentKey: boolean;
  requireUserVerification: boolean;
  /** The constant Boolean value true. It is included here as a pseudo-parameter to simplify applying this abstract authenticator model to implementations that may wish to make a test of user presence optional although WebAuthn does not. */
  // requireUserPresence: true; // Always required
}

export interface Fido2AuthenticatorMakeCredentialResult {
  credentialId: BufferSource;
  attestationObject: BufferSource;
  authData: BufferSource;
  publicKeyAlgorithm: number;
}

export interface Fido2AuthenticatorGetAssertionParams {
  /** The caller’s RP ID, as determined by the user agent and the client. */
  rpId: string;
  /** The hash of the serialized client data, provided by the client. */
  hash: BufferSource;
  allowCredentialDescriptorList: PublicKeyCredentialDescriptor[];
  /** The effective user verification requirement for assertion, a Boolean value provided by the client. */
  requireUserVerification: boolean;
  /** The constant Boolean value true. It is included here as a pseudo-parameter to simplify applying this abstract authenticator model to implementations that may wish to make a test of user presence optional although WebAuthn does not. */
  // requireUserPresence: boolean; // Always required
  extensions: unknown;
}

export interface Fido2AuthenticatorGetAssertionResult {
  selectedCredential: {
    id: string;
    userHandle?: Uint8Array;
  };
  authenticatorData: Uint8Array;
  signature: Uint8Array;
}
