/* eslint no-console:0 */
import fs from "fs";
import path from "path";

type Messages = {
  [id: string]: {
    message: string;
  };
};

function findLocaleFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, { encoding: null, recursive: true })
    .filter((file) => path.basename(file) === "messages.json")
    .map((file) => path.join(dir, file));
}

function findAllLocaleFiles(rootDir: string): string[] {
  return [
    ...findLocaleFiles(path.join(rootDir, "apps", "browser", "src")),
    ...findLocaleFiles(path.join(rootDir, "apps", "cli", "src")),
    ...findLocaleFiles(path.join(rootDir, "apps", "desktop", "src")),
    ...findLocaleFiles(path.join(rootDir, "apps", "web", "src")),
  ].map((file) => path.relative(rootDir, file));
}

function readMessagesJson(file: string): Messages {
  let content = fs.readFileSync(file, { encoding: "utf-8" });
  // Strip BOM
  content = content.replace(/^\uFEFF/, "");
  try {
    return JSON.parse(content);
  } catch (e: unknown) {
    console.error(`Invalid JSON file ${file}`, e);
    throw e;
  }
}

function compareMessagesJson(beforeFile: string, afterFile: string): boolean {
  try {
    const messagesBeforeJson = readMessagesJson(beforeFile);
    const messagesAfterJson = readMessagesJson(afterFile);

    const messagesIdMapBefore = toMessageIdMap(messagesBeforeJson);
    const messagesIdMapAfter = toMessageIdMap(messagesAfterJson);

    let changed = false;

    for (const [id, message] of messagesIdMapAfter.entries()) {
      if (!messagesIdMapBefore.has(id)) {
        console.warn(`Message not found in base branch: "${id}" for file ${beforeFile}`);
        continue;
      }

      if (messagesIdMapBefore.get(id) !== message) {
        console.warn(`Message changed: "${id}" message ${message} file ${afterFile}`);
        changed = true;
      }
    }

    return changed;
  } catch (e: unknown) {
    console.error(`Error for file ${beforeFile} or ${afterFile}`, e);
    throw e;
  }
}

function toMessageIdMap(messagesJson: Messages): Map<string, string> {
  return Object.entries(messagesJson).reduce((map, [id, value]) => {
    map.set(id, value.message);
    return map;
  }, new Map<string, string>());
}

const rootDir = path.join(__dirname, "..", "..");
const baseBranchRootDir = path.join(rootDir, "base");

const files = findAllLocaleFiles(rootDir);

let changedFiles = false;

for (const file of files) {
  const baseBranchFile = path.join(baseBranchRootDir, file);
  if (!fs.existsSync(baseBranchFile)) {
    console.warn(`File not found in base branch: ${file}`);
    continue;
  }

  const changed = compareMessagesJson(baseBranchFile, path.join(rootDir, file));
  changedFiles ||= changed;
}

if (changedFiles) {
  console.error(
    "Incompatible Crowdin locale files. " +
      "All messages in messages.json locale files needs to be immutable and cannot be updated. " +
      "If a message needs to be updated, create a new message id and update the code to use the new message id.",
  );
  process.exit(1);
}
