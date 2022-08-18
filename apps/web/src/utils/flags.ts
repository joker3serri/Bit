// required to avoid linting errors when there are no feature flags
/* eslint-disable @typescript-eslint/ban-types */

import {
  flagEnabled as baseFlagEnabled,
  devFlagEnabled as baseDevFlagEnabled,
  SharedFlags,
  SharedDevFlags,
} from "@bitwarden/common/misc/flags";

export type Flags = {
  showTrial?: boolean;
} & SharedFlags;

export function flagEnabled(flag: keyof Flags): boolean {
  return baseFlagEnabled<Flags>(flag);
}

export type DevFlags = {} & SharedDevFlags;

export function devFlagEnabled(flag: keyof DevFlags) {
  return baseDevFlagEnabled<DevFlags>(flag);
}
