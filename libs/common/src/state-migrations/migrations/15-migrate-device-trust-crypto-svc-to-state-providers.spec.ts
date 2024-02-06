import { MockProxy } from "jest-mock-extended";

import { MigrationHelper } from "../migration-helper";
import { mockMigrationHelper } from "../migration-helper.spec";

import {
  DEVICE_KEY,
  DeviceTrustCryptoServiceStateProviderMigrator,
  SHOULD_TRUST_DEVICE,
} from "./15-migrate-device-trust-crypto-svc-to-state-providers";

// TODO: see if this pattern makes sense and works.
const user1PreMigrationStateJson = {
  keys: {
    deviceKey: {
      keyB64: "user1_deviceKey",
    },
    otherStuff: "overStuff2",
  },
  settings: {
    trustDeviceChoiceForDecryption: true,
    otherStuff: "overStuff3",
  },
  otherStuff: "otherStuff4",
};

function exampleJSON() {
  return {
    global: {
      otherStuff: "otherStuff1",
    },
    authenticatedAccounts: ["user1", "user2", "user3"],
    user1: user1PreMigrationStateJson,
    user2: {
      keys: {
        // no device key
        otherStuff: "otherStuff5",
      },
      settings: {
        // no trust device choice
        otherStuff: "overStuff6",
      },
      otherStuff: "otherStuff6",
    },
  };
}

function rollbackJSON() {
  return {
    // use pattern user_{userId}_{stateDefinitionName}_{keyDefinitionKey} for each user
    // User1 migrated data
    user_user1_deviceTrust_deviceKey: {
      keyB64: "user1_deviceKey",
    },
    user_user1_deviceTrust_shouldTrustDevice: true,

    // User2 migrated data
    user_user2_deviceTrust_deviceKey: null as any,
    user_user2_deviceTrust_shouldTrustDevice: null as any,

    global: {
      otherStuff: "otherStuff1",
    },
    authenticatedAccounts: ["user1", "user2", "user3"],
    user1: {
      keys: {
        otherStuff: "overStuff2",
      },
      settings: {
        otherStuff: "overStuff3",
      },
      otherStuff: "otherStuff4",
    },
    user2: {
      keys: {
        otherStuff: "otherStuff5",
      },
      settings: {
        otherStuff: "overStuff6",
      },
      otherStuff: "otherStuff6",
    },
  };
}

describe("DeviceTrustCryptoServiceStateProviderMigrator", () => {
  let helper: MockProxy<MigrationHelper>;
  let sut: DeviceTrustCryptoServiceStateProviderMigrator;

  describe("migrate", () => {
    beforeEach(() => {
      helper = mockMigrationHelper(exampleJSON(), 14);
      sut = new DeviceTrustCryptoServiceStateProviderMigrator(14, 15);
    });

    // it should remove deviceKey and trustDeviceChoiceForDecryption from all accounts
    it("should remove deviceKey and trustDeviceChoiceForDecryption from all accounts", async () => {
      await sut.migrate(helper);
      expect(helper.set).toHaveBeenCalledWith("user1", {
        keys: {
          otherStuff: "overStuff2",
        },
        settings: {
          otherStuff: "overStuff3",
        },
        otherStuff: "otherStuff4",
      });
      expect(helper.set).toHaveBeenCalledWith("user2", {
        keys: {
          otherStuff: "otherStuff5",
        },
        settings: {
          otherStuff: "overStuff6",
        },
        otherStuff: "otherStuff6",
      });
      // TODO: should we be calling set for user3 when account is undefined?
      // expect helper.set to have been called 2 times and for it not to have been called for user3
      //   expect(helper.set).toHaveBeenCalledTimes(2);
      //   expect(helper.set).not.toHaveBeenCalledWith("user3", any());
    });

    it("should migrate deviceKey and trustDeviceChoiceForDecryption to state providers for accounts that have the data", async () => {
      await sut.migrate(helper);
      expect(helper.setToUser).toHaveBeenCalledWith("user1", DEVICE_KEY, "deviceKey1");
      expect(helper.setToUser).toHaveBeenCalledWith("user1", SHOULD_TRUST_DEVICE, true);

      expect(helper.setToUser).toHaveBeenCalledWith("user2", DEVICE_KEY, undefined);
      expect(helper.setToUser).toHaveBeenCalledWith("user2", SHOULD_TRUST_DEVICE, undefined);

      expect(helper.setToUser).toHaveBeenCalledWith("user3", DEVICE_KEY, undefined);
      expect(helper.setToUser).toHaveBeenCalledWith("user3", SHOULD_TRUST_DEVICE, undefined);
    });
  });

  describe("rollback", () => {
    beforeEach(() => {
      helper = mockMigrationHelper(rollbackJSON(), 15);
      sut = new DeviceTrustCryptoServiceStateProviderMigrator(14, 15);
    });

    it("should null out newly migrated entries in state provider framework", async () => {
      await sut.rollback(helper);

      expect(helper.setToUser).toHaveBeenCalledWith("user1", DEVICE_KEY, null);
      expect(helper.setToUser).toHaveBeenCalledWith("user1", SHOULD_TRUST_DEVICE, null);

      expect(helper.setToUser).toHaveBeenCalledWith("user2", DEVICE_KEY, null);
      expect(helper.setToUser).toHaveBeenCalledWith("user2", SHOULD_TRUST_DEVICE, null);

      expect(helper.setToUser).toHaveBeenCalledWith("user3", DEVICE_KEY, null);
      expect(helper.setToUser).toHaveBeenCalledWith("user3", SHOULD_TRUST_DEVICE, null);
    });

    // it should add back deviceKey and trustDeviceChoiceForDecryption to all accounts
    it("should add back deviceKey and trustDeviceChoiceForDecryption to all accounts", async () => {
      await sut.rollback(helper);
      // TODO: figure out why rollback logic isn't working.
      expect(helper.set).toHaveBeenCalledWith("user1", user1PreMigrationStateJson);

      //   expect(helper.set).toHaveBeenCalledWith("user2", {
      //     keys: {
      //       otherStuff: "otherStuff5",
      //     },
      //     settings: {
      //       otherStuff: "overStuff6",
      //     },
      //     otherStuff: "otherStuff6",
      //   });
    });

    // it("should add explicit value back to accounts", async () => {
    //   await sut.rollback(helper);

    //   expect(helper.set).toHaveBeenCalledTimes(1);
    //   expect(helper.set).toHaveBeenCalledWith("user-1", {
    //     keys: {
    //       biometricEncryptionClientKeyHalf: "user1-key-half",
    //       otherStuff: "overStuff2",
    //     },
    //     otherStuff: "otherStuff3",
    //   });
    // });

    // it.each(["user-2", "user-3"])(
    //   "should not try to restore values to missing accounts",
    //   async (userId) => {
    //     await sut.rollback(helper);

    //     expect(helper.set).not.toHaveBeenCalledWith(userId, any());
    //   },
    // );
  });

  //   describe("rollback", () => {
  //     beforeEach(() => {
  //       helper = mockMigrationHelper(rollbackJSON(), 14);
  //       sut = new MoveBiometricClientKeyHalfToStateProviders(13, 14);
  //     });

  //     it("should null out new values", async () => {
  //       await sut.rollback(helper);

  //       expect(helper.setToUser).toHaveBeenCalledWith("user-1", CLIENT_KEY_HALF, null);
  //     });

  //     it("should add explicit value back to accounts", async () => {
  //       await sut.rollback(helper);

  //       expect(helper.set).toHaveBeenCalledTimes(1);
  //       expect(helper.set).toHaveBeenCalledWith("user-1", {
  //         keys: {
  //           biometricEncryptionClientKeyHalf: "user1-key-half",
  //           otherStuff: "overStuff2",
  //         },
  //         otherStuff: "otherStuff3",
  //       });
  //     });

  //     it.each(["user-2", "user-3"])(
  //       "should not try to restore values to missing accounts",
  //       async (userId) => {
  //         await sut.rollback(helper);

  //         expect(helper.set).not.toHaveBeenCalledWith(userId, any());
  //       },
  //     );
  //   });

  //   describe("rollback", () => {
  //     beforeEach(() => {
  //       helper = mockMigrationHelper(rollbackJSON(), 10);
  //       sut = new UserDecryptionOptionsMigrator(10, 11);
  //     });

  //     it.each(["FirstAccount", "SecondAccount", "ThirdAccount"])(
  //       "should null out new values",
  //       async (userId) => {
  //         await sut.rollback(helper);

  //         expect(helper.setToUser).toHaveBeenCalledWith(userId, keyDefinitionLike, null);
  //       },
  //     );

  //     it("should add explicit value back to accounts", async () => {
  //       await sut.rollback(helper);

  //       expect(helper.set).toHaveBeenCalledWith("FirstAccount", {
  //         decryptionOptions: {
  //           hasMasterPassword: true,
  //           trustedDeviceOption: {
  //             hasAdminApproval: false,
  //             hasLoginApprovingDevice: false,
  //             hasManageResetPasswordPermission: true,
  //           },
  //           keyConnectorOption: {
  //             keyConnectorUrl: "https://keyconnector.bitwarden.com",
  //           },
  //         },
  //         profile: {
  //           otherStuff: "overStuff2",
  //         },
  //         otherStuff: "otherStuff3",
  //       });
  //       expect(helper.set).toHaveBeenCalledWith("SecondAccount", {
  //         decryptionOptions: {
  //           hasMasterPassword: false,
  //           trustedDeviceOption: {
  //             hasAdminApproval: true,
  //             hasLoginApprovingDevice: true,
  //             hasManageResetPasswordPermission: true,
  //           },
  //           keyConnectorOption: {
  //             keyConnectorUrl: "https://selfhosted.bitwarden.com",
  //           },
  //         },
  //         profile: {
  //           otherStuff: "otherStuff4",
  //         },
  //         otherStuff: "otherStuff5",
  //       });
  //     });

  //     it("should not try to restore values to missing accounts", async () => {
  //       await sut.rollback(helper);

  //       expect(helper.set).not.toHaveBeenCalledWith("ThirdAccount", any());
  //     });
  //   });
});
