This module defines interfaces and helpers for creating vendor integration sites.

## RPC

> ⚠️ **Only use for extension points!**
> This logic is not suitable for general use. Making calls to the Bitwarden server api
> using `@bitwarden/common/tools/integration/rpc` is prohibited.

Interfaces and helpers defining a remote procedure call to a vendor's service. These
types provide extension points to produce and process the call without exposing a
generalized fetch API.
