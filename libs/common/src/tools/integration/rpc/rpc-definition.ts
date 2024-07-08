/** Static definition for processing an RPC call */
export interface RpcConfiguration<Request, Helper> {
  /** determine the URL of the lookup */
  url: (request: Request, helper: Helper) => string;

  /** format the body of the rpc call */
  body?: (request: Request, helper: Helper) => any;

  /** returns true when there's a JSON payload to process */
  hasJsonPayload: (response: Response, helper: Helper) => boolean;

  /** map body parsed as json payload of the rpc call. */
  processJson: (response: any, helper: Helper) => [string, string?];
}
