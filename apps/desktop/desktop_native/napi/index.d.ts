/* tslint:disable */
/* eslint-disable */

/* auto-generated by NAPI-RS */

export namespace passwords {
  /** Fetch the stored password from the keychain. */
  export function getPassword(service: string, account: string): Promise<string>
  /** Fetch the stored password from the keychain that was stored with Keytar. */
  export function getPasswordKeytar(service: string, account: string): Promise<string>
  /** Save the password to the keychain. Adds an entry if none exists otherwise updates the existing entry. */
  export function setPassword(service: string, account: string, password: string): Promise<void>
  /** Delete the stored password from the keychain. */
  export function deletePassword(service: string, account: string): Promise<void>
  export function isAvailable(): Promise<boolean>
}
export namespace biometrics {
  export function prompt(hwnd: Buffer, message: string): Promise<boolean>
  export function available(): Promise<boolean>
  export function setBiometricSecret(service: string, account: string, secret: string, keyMaterial: KeyMaterial | undefined | null, ivB64: string): Promise<string>
  export function getBiometricSecret(service: string, account: string, keyMaterial?: KeyMaterial | undefined | null): Promise<string>
  /**
   * Derives key material from biometric data. Returns a string encoded with a
   * base64 encoded key and the base64 encoded challenge used to create it
   * separated by a `|` character.
   *
   * If the iv is provided, it will be used as the challenge. Otherwise a random challenge will be generated.
   *
   * `format!("<key_base64>|<iv_base64>")`
   */
  export function deriveKeyMaterial(iv?: string | undefined | null): Promise<OsDerivedKey>
  export interface KeyMaterial {
    osKeyPartB64: string
    clientKeyPartB64?: string
  }
  export interface OsDerivedKey {
    keyB64: string
    ivB64: string
  }
}
export namespace clipboards {
  export function read(): Promise<string>
  export function write(text: string, password: boolean): Promise<void>
}
export namespace sshagent {
  export interface PrivateKey {
    privateKey: string
    name: string
    cipherId: string
  }
  export interface SshKey {
    privateKey: string
    publicKey: string
    keyAlgorithm: string
    keyFingerprint: string
  }
  export const enum SshKeyImportStatus {
    Success = 0,
    PasswordRequired = 1,
    WrongPassword = 2,
    ParsingError = 3
  }
  export interface SshKeyImportResult {
    status: SshKeyImportStatus
    sshKey?: SshKey
  }
  export function serve(callback: (err: Error | null, arg: string) => any): Promise<SshAgentState>
  export function stop(agentState: SshAgentState): void
  export function setKeys(agentState: SshAgentState, newKeys: Array<PrivateKey>): void
  export function lock(agentState: SshAgentState): void
  export function importKey(encodedKey: string, password: string): SshKeyImportResult
  export function generateKeypair(keyAlgorithm: string): Promise<SshKey>
  export class SshAgentState {   }
}
export namespace processisolations {
  export function disableCoredumps(): Promise<void>
  export function isCoreDumpingDisabled(): Promise<boolean>
  export function disableMemoryAccess(): Promise<void>
}
export namespace powermonitors {
  export function onLock(callback: (err: Error | null, ) => any): Promise<void>
  export function isLockMonitorAvailable(): Promise<boolean>
}
