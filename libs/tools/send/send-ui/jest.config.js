const { pathsToModuleNameMapper } = require("ts-jest");

const { compilerOptions } = require("../../../shared/tsconfig.libs");

/** @type {import('jest').Config} */
module.exports = {
  testMatch: ["**/+(*.)+(spec).+(ts)"],
  roots: ["<rootDir>/libs/tools/send/send-ui/src"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions?.paths || {}, {
    prefix: "<rootDir>/../../",
  }),
};
