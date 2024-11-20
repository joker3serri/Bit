import { mock } from "jest-mock-extended";
import { BehaviorSubject, Subject } from "rxjs";

import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";
import { CsprngArray } from "@bitwarden/common/types/csprng";
import { OrganizationId, UserId } from "@bitwarden/common/types/guid";
import { OrgKey, UserKey } from "@bitwarden/common/types/key";
import { KeyService } from "@bitwarden/key-management";

import { SingleUserDependency, SingleOrganizationDependency, UserBound } from "../dependencies";

import { KeyServiceLegacyEncryptorProvider } from "./key-service-legacy-encryptor-provider";
import { OrganizationKeyEncryptor } from "./organization-key-encryptor";
import { UserEncryptor } from "./user-encryptor.abstraction";
import { UserKeyEncryptor } from "./user-key-encryptor";

const encryptService = mock<EncryptService>();
const keyService = mock<KeyService>();

const SomeCsprngArray = new Uint8Array(64) as CsprngArray;
const SomeUser = "some user" as UserId;
const AnotherUser = "another user" as UserId;
const SomeUserKey = new SymmetricCryptoKey(SomeCsprngArray) as UserKey;
const SomeOrganization = "some organization" as OrganizationId;
const AnotherOrganization = "another organization" as OrganizationId;
const SomeOrgKey = new SymmetricCryptoKey(SomeCsprngArray) as OrgKey;
const AnotherOrgKey = new SymmetricCryptoKey(SomeCsprngArray) as OrgKey;
const OrgRecords: Record<OrganizationId, OrgKey> = {
  [SomeOrganization]: SomeOrgKey,
  [AnotherOrganization]: AnotherOrgKey,
};

// Many tests examine the private members of the objects constructed by the
// provider. This is necessary because it's not presently possible to spy
// on the constructors directly.
describe("KeyServiceLegacyEncryptorProvider", () => {
  describe("userEncryptor$", () => {
    it("emits a user key encryptor bound to the user", async () => {
      const userKey$ = new BehaviorSubject<UserKey>(SomeUserKey);
      keyService.userKey$.mockReturnValueOnce(userKey$);
      const singleUserId$ = new BehaviorSubject<UserId>(SomeUser);
      const provider = new KeyServiceLegacyEncryptorProvider(encryptService, keyService);
      const results: UserBound<"encryptor", UserEncryptor>[] = [];

      provider.userEncryptor$(1, { singleUserId$ }).subscribe((v) => results.push(v));

      expect(keyService.userKey$).toHaveBeenCalledWith(SomeUser);
      expect(results.length).toBe(1);
      expect(results[0]).toMatchObject({
        userId: SomeUser,
        encryptor: {
          userId: SomeUser,
          key: SomeUserKey,
          dataPacker: { frameSize: 1 },
        },
      });
      expect(results[0].encryptor).toBeInstanceOf(UserKeyEncryptor);
    });

    it("waits until `dependencies.singleUserId$` emits", () => {
      const userKey$ = new BehaviorSubject<UserKey>(SomeUserKey);
      keyService.userKey$.mockReturnValueOnce(userKey$);
      const singleUserId$ = new Subject<UserId>();
      const provider = new KeyServiceLegacyEncryptorProvider(encryptService, keyService);
      const results: UserBound<"encryptor", UserEncryptor>[] = [];
      provider.userEncryptor$(1, { singleUserId$ }).subscribe((v) => results.push(v));
      // precondition: no emissions occur on subscribe
      expect(results.length).toBe(0);

      singleUserId$.next(SomeUser);

      expect(results.length).toBe(1);
    });

    it("emits a new user key encryptor each time `dependencies.singleUserId$` emits", () => {
      const userKey$ = new BehaviorSubject<UserKey>(SomeUserKey);
      keyService.userKey$.mockReturnValue(userKey$);
      const singleUserId$ = new Subject<UserId>();
      const provider = new KeyServiceLegacyEncryptorProvider(encryptService, keyService);
      const results: UserBound<"encryptor", UserEncryptor>[] = [];
      provider.userEncryptor$(1, { singleUserId$ }).subscribe((v) => results.push(v));

      singleUserId$.next(SomeUser);
      singleUserId$.next(SomeUser);

      expect(results.length).toBe(2);
      expect(results[0]).not.toBe(results[1]);
    });

    it("waits until `userKey$` emits a truthy value", () => {
      const userKey$ = new BehaviorSubject<UserKey>(null);
      keyService.userKey$.mockReturnValue(userKey$);
      const singleUserId$ = new BehaviorSubject<UserId>(SomeUser);
      const provider = new KeyServiceLegacyEncryptorProvider(encryptService, keyService);
      const results: UserBound<"encryptor", UserEncryptor>[] = [];
      provider.userEncryptor$(1, { singleUserId$ }).subscribe((v) => results.push(v));
      // precondition: no emissions occur on subscribe
      expect(results.length).toBe(0);

      userKey$.next(SomeUserKey);

      expect(results.length).toBe(1);
      expect(results[0]).toMatchObject({
        userId: SomeUser,
        encryptor: {
          userId: SomeUser,
          key: SomeUserKey,
          dataPacker: { frameSize: 1 },
        },
      });
    });

    it("emits a new user key encryptor each time `userKey$` emits", () => {
      const userKey$ = new Subject<UserKey>();
      keyService.userKey$.mockReturnValue(userKey$);
      const singleUserId$ = new BehaviorSubject<UserId>(SomeUser);
      const provider = new KeyServiceLegacyEncryptorProvider(encryptService, keyService);
      const results: UserBound<"encryptor", UserEncryptor>[] = [];
      provider.userEncryptor$(1, { singleUserId$ }).subscribe((v) => results.push(v));

      userKey$.next(SomeUserKey);
      userKey$.next(SomeUserKey);

      expect(results.length).toBe(2);
    });

    it("errors when the userId changes", () => {
      const userKey$ = new BehaviorSubject<UserKey>(SomeUserKey);
      keyService.userKey$.mockReturnValue(userKey$);
      const singleUserId$ = new Subject<UserId>();
      const provider = new KeyServiceLegacyEncryptorProvider(encryptService, keyService);
      let error: unknown = false;
      provider
        .userEncryptor$(1, { singleUserId$ })
        .subscribe({ error: (e: unknown) => (error = e) });

      singleUserId$.next(SomeUser);
      singleUserId$.next(AnotherUser);

      expect(error).toEqual({ expectedUserId: SomeUser, actualUserId: AnotherUser });
    });

    it("errors when `dependencies.singleUserId$` errors", () => {
      const userKey$ = new BehaviorSubject<UserKey>(SomeUserKey);
      keyService.userKey$.mockReturnValue(userKey$);
      const singleUserId$ = new Subject<UserId>();
      const provider = new KeyServiceLegacyEncryptorProvider(encryptService, keyService);
      let error: unknown = false;
      provider
        .userEncryptor$(1, { singleUserId$ })
        .subscribe({ error: (e: unknown) => (error = e) });

      singleUserId$.error({ some: "error" });

      expect(error).toEqual({ some: "error" });
    });

    it("errors once singleUserId$ emits and `userKey$` errors", () => {
      const userKey$ = new Subject<UserKey>();
      keyService.userKey$.mockReturnValue(userKey$);
      const singleUserId$ = new BehaviorSubject<UserId>(SomeUser);
      const provider = new KeyServiceLegacyEncryptorProvider(encryptService, keyService);
      let error: unknown = false;
      provider
        .userEncryptor$(1, { singleUserId$ })
        .subscribe({ error: (e: unknown) => (error = e) });

      userKey$.error({ some: "error" });

      expect(error).toEqual({ some: "error" });
    });

    it("completes when `dependencies.singleUserId$` completes", () => {
      const userKey$ = new Subject<UserKey>();
      keyService.userKey$.mockReturnValue(userKey$);
      const singleUserId$ = new BehaviorSubject<UserId>(SomeUser);
      const provider = new KeyServiceLegacyEncryptorProvider(encryptService, keyService);
      let completed = false;
      provider
        .userEncryptor$(1, { singleUserId$ })
        .subscribe({ complete: () => (completed = true) });

      singleUserId$.complete();

      expect(completed).toBeTrue();
    });

    it("completes when `userKey$` emits a falsy value after emitting a truthy value", () => {
      const userKey$ = new BehaviorSubject<UserKey>(SomeUserKey);
      keyService.userKey$.mockReturnValue(userKey$);
      const singleUserId$ = new BehaviorSubject<UserId>(SomeUser);
      const provider = new KeyServiceLegacyEncryptorProvider(encryptService, keyService);
      let completed = false;
      provider
        .userEncryptor$(1, { singleUserId$ })
        .subscribe({ complete: () => (completed = true) });

      userKey$.next(null);

      expect(completed).toBeTrue();
    });

    it("completes once singleUserId$ emits and `userKey$` completes", () => {
      const userKey$ = new BehaviorSubject<UserKey>(SomeUserKey);
      keyService.userKey$.mockReturnValue(userKey$);
      const singleUserId$ = new BehaviorSubject<UserId>(SomeUser);
      const provider = new KeyServiceLegacyEncryptorProvider(encryptService, keyService);
      let completed = false;
      provider
        .userEncryptor$(1, { singleUserId$ })
        .subscribe({ complete: () => (completed = true) });

      userKey$.complete();

      expect(completed).toBeTrue();
    });
  });

  describe("organizationEncryptor$", () => {
    it.todo("emits an organization key encryptor bound to the organization");

    it.todo(
      "emits a new organization key encryptor when `dependencies.singleOrganizationId$` emits",
    );

    it.todo("waits until `orgKeys$` emits a truthy value");

    it.todo("errors when the userId changes");

    it.todo("errors when the user lacks the requested org key");

    it.todo("completes when `orgKeys$` emits a falsy value");
  });
});
