/* eslint-disable @typescript-eslint/no-var-requires, no-console */
require("dotenv").config();

const { notarize } = require("@electron/notarize");

exports.default = run;

async function run(context) {
  console.log("## After sign");
  // console.log(context);

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${context.appOutDir}/${appName}.app`;
  const macBuild = context.electronPlatformName === "darwin";

  if (macBuild) {
    console.log("### Notarizing " + appPath);
    const appleId = process.env.APPLE_ID_USERNAME || process.env.APPLEID;
    const appleIdPassword = process.env.APPLE_ID_PASSWORD || `@keychain:AC_PASSWORD`;
    return await notarize({
      tool: "notarytool",
      appPath: appPath,
      teamId: "LTZ2PFU5D6",
      appleId: appleId,
      appleIdPassword: appleIdPassword,
    });
  }
}
