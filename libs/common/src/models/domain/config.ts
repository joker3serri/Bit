export class Config {
  version: string;
  gitHash: string;
  server: ServerConfig;
  environment: EnvironmentConfig;

  constructor() {
    this.environment = new EnvironmentConfig();
  }
}

export class ServerConfig {
  name: string;
  url: string;
}

export class EnvironmentConfig {
  vault: string;
  api: string;
  identity: string;
  admin: string;
  notifications: string;
  sso: string;
}
