/*
  The Config class represents a Config object the server will return when executing a GET request to `/config`.
  Please note, the `server` property should be null *unless* the server is a third-party server.
*/
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
