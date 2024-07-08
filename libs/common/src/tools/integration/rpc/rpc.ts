import { IntegrationMetadata } from "../integration-metadata";

/** A repeatable rpc request that returns a JSON-encoded payload. */
export interface JsonRpc<Parameters, Result> {
  /** information about the integration requesting RPC */
  requestor: Readonly<IntegrationMetadata>;

  /** creates a fetch request for the RPC */
  toRequest(request: Parameters): Request;

  /** returns true when there should be a JSON payload to process */
  hasJsonPayload: (response: Response) => boolean;

  /** processes the json payload; on success returns [Result], on failure returns [undefined, Result] */
  processJson: (response: any) => [Result, string?];
}
