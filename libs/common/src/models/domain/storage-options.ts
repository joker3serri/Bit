import { Jsonify } from "type-fest";

import { HtmlStorageLocation } from "../../enums/html-storage-location";
import { StorageLocation } from "../../enums/storageLocation";

export type StorageOptions = {
  storageLocation?: StorageLocation;
  useSecureStorage?: boolean;
  userId?: string;
  htmlStorageLocation?: HtmlStorageLocation;
  keySuffix?: string;
};

export type MemoryStorageOptions<T> = StorageOptions & { deserializer?: (obj: Jsonify<T>) => T };
