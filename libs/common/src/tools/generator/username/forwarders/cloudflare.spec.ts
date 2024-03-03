/**
 * include Request in test environment.
 * @jest-environment ../../../../shared/test.environment.ts
 */
import { CloudflareForwarder } from "./cloudflare"; // Adjust the import path as necessary
import { mockApiService, mockI18nService } from "./mocks.jest";

describe("Cloudflare Forwarder", () => {
  const zoneID = "your_zone_id_here";
  const recipient = "recipient@commonmailbox.com";
  const generatedEmail = "generated@yourdomain.com";
  const description = "Forwarder for Generated Email to Recipient, created by bitwarden";
  const cloudflareUrl = "https://api.cloudflare.com/client/v4/zones/" + zoneID + "/rules";

  it("throws a Duplicate Zone Rule error if the request fails with a 409", async () => {
    const apiService = mockApiService(409, {});
    const i18nService = mockI18nService();

    const forwarder = new CloudflareForwarder(apiService, i18nService);

    await expect(
      async () =>
        await forwarder.generate(cloudflareUrl, {
          zoneId: zoneID,
          accountId: "your_account_id_here",
          email: generatedEmail,
          recipient,
          description,
          zoneIdDomain: "yourdomain.com",
        }),
    ).rejects.toEqual("forwarderDuplicateZoneRule");

    expect(apiService.nativeFetch).toHaveBeenCalledWith(expect.any(Request));
    expect(i18nService.t).toHaveBeenCalledWith("forwarderDuplicateZoneRule");
  });

  it("returns the generated email address if the request is successful (status = 200)", async () => {
    const apiService = mockApiService(200, { generatedEmail });
    const i18nService = mockI18nService();

    const forwarder = new CloudflareForwarder(apiService, i18nService);

    await expect(
      async () =>
        await forwarder.generate(cloudflareUrl, {
          zoneId: zoneID,
          accountId: "your_account_id_here",
          email: generatedEmail,
          recipient,
          description,
          zoneIdDomain: "yourdomain.com",
        }),
    );

    expect(apiService.nativeFetch).toHaveBeenCalledWith(expect.any(Request));
  });

  it("throws a Could not route error if the request fails with a 404", async () => {
    const apiService = mockApiService(404, {});
    const i18nService = mockI18nService();

    const forwarder = new CloudflareForwarder(apiService, i18nService);

    await expect(
      async () =>
        await forwarder.generate(cloudflareUrl, {
          zoneId: zoneID,
          accountId: "your_account_id_here",
          email: generatedEmail,
          recipient,
          description,
          zoneIdDomain: "yourdomain.com",
        }),
    ).rejects.toEqual("forwarderCouldNotRoute");

    expect(apiService.nativeFetch).toHaveBeenCalledWith(expect.any(Request));
    expect(i18nService.t).toHaveBeenCalledWith("forwarderCouldNotRoute");
  });

  it("throws a Bad Request error if the request fails with a 400", async () => {
    const apiService = mockApiService(400, {});
    const i18nService = mockI18nService();

    const forwarder = new CloudflareForwarder(apiService, i18nService);

    await expect(
      async () =>
        await forwarder.generate(cloudflareUrl, {
          zoneId: zoneID,
          accountId: "your_account_id_here",
          email: generatedEmail,
          recipient,
          description,
          zoneIdDomain: "yourdomain.com",
        }),
    ).rejects.toEqual("forwarderBadRequest");

    expect(apiService.nativeFetch).toHaveBeenCalledWith(expect.any(Request));
    expect(i18nService.t).toHaveBeenCalledWith("forwarderBadRequest");
  });
});
