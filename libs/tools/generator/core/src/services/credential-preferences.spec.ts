import { DefaultCredentialPreferences } from "../data";

import { PREFERENCES } from "./credential-preferences";

describe("PREFERENCES", () => {
  describe("deserializer", () => {
    it.each([[null], [undefined]])("creates new preferences (= %p)", (value) => {
      const result = PREFERENCES.deserializer(value);

      expect(result).toEqual(DefaultCredentialPreferences);
    });

    it("fills missing password preferences", () => {
      const input = { ...DefaultCredentialPreferences };
      delete input.password;

      const result = PREFERENCES.deserializer(input as any);

      expect(result).toEqual(DefaultCredentialPreferences);
    });

    it("fills missing email preferences", () => {
      const input = { ...DefaultCredentialPreferences };
      delete input.email;

      const result = PREFERENCES.deserializer(input as any);

      expect(result).toEqual(DefaultCredentialPreferences);
    });

    it("fills missing username preferences", () => {
      const input = { ...DefaultCredentialPreferences };
      delete input.username;

      const result = PREFERENCES.deserializer(input as any);

      expect(result).toEqual(DefaultCredentialPreferences);
    });

    it("converts updated fields to Dates", () => {
      const input = structuredClone(DefaultCredentialPreferences);
      input.email.updated = 100 as any;
      input.password.updated = 200 as any;
      input.username.updated = 300 as any;

      const result = PREFERENCES.deserializer(input as any);

      expect(result.email.updated).toEqual(new Date(100));
      expect(result.password.updated).toEqual(new Date(200));
      expect(result.username.updated).toEqual(new Date(300));
    });
  });
});
