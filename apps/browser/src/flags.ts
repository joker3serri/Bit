// required to avoid linting errors when there are no feature flags
/* eslint-disable @typescript-eslint/ban-types */
import {
  flagEnabled as baseFlagEnabled,
  devFlagEnabled as baseDevFlagEnabled,
  devFlagValue as baseDevFlagValue,
  SharedFlags,
  SharedDevFlags,
} from "@bitwarden/common/misc/flags";

import { GroupPolicyEnvironment } from "./types/group-policy-environment";

export type Flags = {} & SharedFlags;

export type DevFlags = {
  storeSessionDecrypted?: boolean;
  managedEnvironment?: GroupPolicyEnvironment;
} & SharedDevFlags;

export function flagEnabled(flag: keyof Flags): boolean {
  return baseFlagEnabled<Flags>(flag);
}

export function devFlagEnabled(flag: keyof DevFlags) {
  return baseDevFlagEnabled<DevFlags>(flag);
}

export function devFlagValue(flag: keyof DevFlags) {
  return baseDevFlagValue(flag);
}
