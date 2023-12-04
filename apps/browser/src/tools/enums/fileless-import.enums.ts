const FilelessImportType = {
  LP: "LP",
} as const;

type FilelessImportType = (typeof FilelessImportType)[keyof typeof FilelessImportType];

const FilelessImportPort = {
  NotificationBar: "fileless-importer-notification-bar",
  LpImporter: "lp-fileless-importer",
} as const;

export { FilelessImportType, FilelessImportPort };
