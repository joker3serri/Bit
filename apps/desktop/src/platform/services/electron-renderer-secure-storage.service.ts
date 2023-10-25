import { AbstractStorageService } from "@bitwarden/common/platform/abstractions/storage.service";
import { StorageOptions } from "@bitwarden/common/platform/models/domain/storage-options";

export class ElectronRendererSecureStorageService extends AbstractStorageService {
  async get<T>(key: string, options?: StorageOptions): Promise<T> {
    const val = await ipc.platform.passwords.get(key, options?.keySuffix ?? "");
    return val != null ? (JSON.parse(val) as T) : null;
  }

  async has(key: string, options?: StorageOptions): Promise<boolean> {
    const val = await ipc.platform.passwords.has(key, options?.keySuffix ?? "");
    return !!val;
  }

  async save<T>(key: string, obj: T, options?: StorageOptions): Promise<void> {
    await ipc.platform.passwords.set(key, options?.keySuffix ?? "", JSON.stringify(obj));
    this.updatesSubject.next({ key, value: obj, updateType: "save" });
  }

  async remove(key: string, options?: StorageOptions): Promise<void> {
    await ipc.platform.passwords.delete(key, options?.keySuffix ?? "");
    this.updatesSubject.next({ key, value: null, updateType: "remove" });
  }
}
