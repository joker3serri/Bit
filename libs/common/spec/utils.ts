import { mock, MockProxy } from "jest-mock-extended";
import { Observable } from "rxjs";

import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";

function newGuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function GetUniqueString(prefix = "") {
  return prefix + "_" + newGuid();
}

export function BuildTestObject<T, K extends keyof T = keyof T>(
  def: Partial<Pick<T, K>> | T,
  constructor?: new () => T
): T {
  return Object.assign(constructor === null ? {} : new constructor(), def) as T;
}

export function mockEnc(s: string): MockProxy<EncString> {
  const mocked = mock<EncString>();
  mocked.decrypt.mockResolvedValue(s);

  return mocked;
}

export function makeStaticByteArray(length: number, start = 0) {
  const arr = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    arr[i] = start + i;
  }
  return arr;
}

/**
 * Use to mock a return value of a static fromJSON method.
 */
export const mockFromJson = (stub: any) => (stub + "_fromJSON") as any;

/**
* Returns an array that will hold all emissions of the tracked observable.
* call this function before you expect any emissions and then use code that
* will use the emit values to the observable, then assert after all expected emissions
* have occurred.
*/
export function trackEmissions<T>(observable: Observable<T>): T[] {
  const emissions: T[] = [];
  observable.subscribe((value) => {
    switch (value) {
      case undefined:
      case null:
        emissions.push(value);
        return;
      default:
        // process by type
        break;
    }

    switch (typeof value) {
      case "string":
      case "number":
      case "boolean":
        emissions.push(value);
        break;
      case "object":
        emissions.push({ ...value });
        break;
      default:
        emissions.push(JSON.parse(JSON.stringify(value)));
    }
  });
  return emissions;
}
