export class RestClient {
  baseServerUrl: string;

  async get(
    endpoint: string,
    headers: Map<string, string> = null,
    cookies: Map<string, string> = null
  ): Promise<Response> {
    const requestInit: RequestInit = {
      method: "GET",
      credentials: "include",
    };
    if (headers != null && headers.size > 0) {
      const headers = new Headers();
      for (const [key, value] of headers) {
        headers.set(key, value);
      }
      requestInit.headers = headers;
    }
    // Cookies should be already automatically set for this origin by the browser
    // TODO: set cookies for non-browser?
    const request = new Request(this.baseServerUrl + "/" + endpoint, requestInit);
    const response = await fetch(request);
    return response;
  }

  async postForm(
    endpoint: string,
    parameters: Map<string, any> = null,
    headers: Map<string, string> = null,
    cookies: Map<string, string> = null
  ): Promise<Response> {
    const requestInit: RequestInit = {
      method: "POST",
      credentials: "include",
    };
    if (parameters != null && parameters.size > 0) {
      const form = new FormData();
      for (const [key, value] of parameters) {
        form.set(key, value);
      }
      requestInit.body = form;
    }
    if (headers != null && headers.size > 0) {
      const headers = new Headers();
      for (const [key, value] of headers) {
        headers.set(key, value);
      }
      requestInit.headers = headers;
    }
    // Cookies should be already automatically set for this origin by the browser
    // TODO: set cookies for non-browser?
    const request = new Request(this.baseServerUrl + "/" + endpoint, requestInit);
    const response = await fetch(request);
    return response;
  }
}
