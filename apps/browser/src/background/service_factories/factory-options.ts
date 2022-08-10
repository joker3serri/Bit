export type FactoryOptions = {
  instances: Record<string, unknown>;
  alwaysInitializeNewService?: boolean;
  doNotStoreInitializedService?: boolean;
};

export function factory<TOpts extends FactoryOptions, T>(
  opts: TOpts,
  name: string,
  factory: (opts: TOpts) => T
): T {
  let instance = opts.instances[name];
  if (opts.alwaysInitializeNewService || !instance) {
    instance = factory(opts);
  }

  if (!opts.doNotStoreInitializedService) {
    opts.instances[name] = instance;
  }

  return instance as T;
}
