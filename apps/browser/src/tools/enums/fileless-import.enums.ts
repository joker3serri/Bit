const FilelessImportType = {
  LP: "LP",
} as const;

const FilelessImportPort = {
  NotificationBar: "fileless-importer-notification-bar",
  LpImporter: "lp-fileless-importer",
} as const;

export { FilelessImportType, FilelessImportPort };
