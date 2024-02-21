import { SecretClassifier } from "./secret-classifier";

describe("SecretClassifier", () => {
  describe("forSecret", () => {
    it("classifies a property as secret by default", () => {
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();

      expect(classifier.disclosed).toEqual([]);
      expect(classifier.excluded).toEqual([]);
    });
  });

  describe("disclose", () => {
    it("adds a property to the disclosed list", () => {
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();

      const withDisclosedFoo = classifier.disclose("foo");

      expect(withDisclosedFoo.disclosed).toEqual(["foo"]);
      expect(withDisclosedFoo.excluded).toEqual([]);
    });

    it("chains calls with excluded", () => {
      const classifier = SecretClassifier.allSecret<{ foo: boolean; bar: boolean }>();

      const withDisclosedFoo = classifier.disclose("foo").exclude("bar");

      expect(withDisclosedFoo.disclosed).toEqual(["foo"]);
      expect(withDisclosedFoo.excluded).toEqual(["bar"]);
    });

    it("returns a new classifier", () => {
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();

      const withDisclosedFoo = classifier.disclose("foo");

      expect(withDisclosedFoo).not.toBe(classifier);
    });
  });

  describe("exclude", () => {
    it("adds a property to the excluded list", () => {
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();

      const withExcludedFoo = classifier.exclude("foo");

      expect(withExcludedFoo.disclosed).toEqual([]);
      expect(withExcludedFoo.excluded).toEqual(["foo"]);
    });

    it("chains calls with disclose", () => {
      const classifier = SecretClassifier.allSecret<{ foo: boolean; bar: boolean }>();

      const withExcludedFoo = classifier.exclude("foo").disclose("bar");

      expect(withExcludedFoo.disclosed).toEqual(["bar"]);
      expect(withExcludedFoo.excluded).toEqual(["foo"]);
    });

    it("returns a new classifier", () => {
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();

      const withExcludedFoo = classifier.exclude("foo");

      expect(withExcludedFoo).not.toBe(classifier);
    });
  });

  describe("classify", () => {
    it("partitions disclosed properties into the disclosed member", () => {
      const classifier = SecretClassifier.allSecret<{ foo: boolean; bar: boolean }>().disclose(
        "foo",
      );

      const classified = classifier.classify({ foo: true, bar: false });

      expect(classified.disclosed).toEqual({ foo: true });
    });

    it("deletes disclosed properties from the secret member", () => {
      const classifier = SecretClassifier.allSecret<{ foo: boolean; bar: boolean }>().disclose(
        "foo",
      );

      const classified = classifier.classify({ foo: true, bar: false });

      expect(classified.secret).toEqual({ bar: false });
    });

    it("deletes excluded properties from the secret member", () => {
      const classifier = SecretClassifier.allSecret<{ foo: boolean; bar: boolean }>().exclude(
        "foo",
      );

      const classified = classifier.classify({ foo: true, bar: false });

      expect(classified.secret).toEqual({ bar: false });
    });

    it("excludes excluded properties from the disclosed member", () => {
      const classifier = SecretClassifier.allSecret<{ foo: boolean; bar: boolean }>().exclude(
        "foo",
      );

      const classified = classifier.classify({ foo: true, bar: false });

      expect(classified.disclosed).toEqual({});
    });

    it("returns its input as the secret member", () => {
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();
      const input = { foo: true };

      const classified = classifier.classify(input);

      expect(classified.secret).toEqual(input);
    });
  });

  describe("declassify", () => {
    it("merges disclosed and secret members", () => {
      const classifier = SecretClassifier.allSecret<{ foo: boolean; bar: boolean }>().disclose(
        "foo",
      );

      // `any` is required here because declassify cannot infer the type of `NewDisclosed`
      const declassified = classifier.declassify({ foo: true } as any, { bar: false } as any);

      expect(declassified).toEqual({ foo: true, bar: false });
    });

    it("omits unknown disclosed members", () => {
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>().disclose("foo");

      // `any` is required here because declassify cannot infer the type of `NewDisclosed`
      const declassified = classifier.declassify({ foo: true, bar: false } as any, {} as any);

      expect(declassified).toEqual({ foo: true });
    });

    it("clobbers disclosed members with secret members", () => {
      const classifier = SecretClassifier.allSecret<{ foo: boolean; bar: boolean }>().disclose(
        "foo",
      );

      // `any` is required here because declassify cannot infer the type of `NewDisclosed`
      const declassified = classifier.declassify(
        { foo: true } as any,
        { foo: false, bar: false } as any,
      );

      expect(declassified).toEqual({ foo: false, bar: false });
    });

    it("omits excluded secret members", () => {
      const classifier = SecretClassifier.allSecret<{ foo: boolean; bar: boolean }>().exclude(
        "foo",
      );

      // `any` is required here because declassify cannot infer the type of `NewDisclosed`
      const declassified = classifier.declassify({} as any, { foo: false, bar: false } as any);

      expect(declassified).toEqual({ bar: false });
    });

    it("returns a new object", () => {
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();

      // `any` is required here because declassify cannot infer the type of `NewDisclosed`
      const disclosed = {} as any;
      const secret = { foo: false };
      const declassified = classifier.declassify(disclosed, secret);

      expect(declassified).not.toBe(disclosed);
      expect(declassified).not.toBe(secret);
    });
  });
});
