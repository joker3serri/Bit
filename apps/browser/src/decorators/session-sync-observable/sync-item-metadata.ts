export class SyncedItemMetadata {
  propertyKey: string;
  sessionKey: string;
  ctor?: new () => any;
  initializer?: (keyValuePair: any) => any;
  initializeAsArray?: boolean;
  initializeAsRecord?: boolean;

  static builder(metadata: SyncedItemMetadata): (o: any) => any {
    if (metadata.initializeAsArray && metadata.initializeAsRecord) {
      throw new Error("initializeAsArray and initializeAsRecord cannot both be true");
    }

    const itemBuilder =
      metadata.initializer != null
        ? metadata.initializer
        : (o: any) => Object.assign(new metadata.ctor(), o);
    if (metadata.initializeAsArray) {
      return (keyValuePair: any) => keyValuePair.map((o: any) => itemBuilder(o));
    } else if (metadata.initializeAsRecord) {
      return (keyValuePair: any) => {
        const record: Record<any, any> = {};
        for (const key in keyValuePair) {
          record[key] = itemBuilder(keyValuePair[key]);
        }
        return record;
      };
    } else {
      return (keyValuePair: any) => itemBuilder(keyValuePair);
    }
  }
}
