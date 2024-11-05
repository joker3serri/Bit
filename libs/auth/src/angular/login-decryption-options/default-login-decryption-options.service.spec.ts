import { DefaultLoginDecryptionOptionsService } from "./default-login-decryption-options.service";

describe("DefaultLoginDecryptionOptionsService", () => {
  let service: DefaultLoginDecryptionOptionsService;

  beforeEach(() => {
    service = new DefaultLoginDecryptionOptionsService();
  });

  it("should instantiate the service", () => {
    expect(service).not.toBeFalsy();
  });
});
