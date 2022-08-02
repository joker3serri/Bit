import { Config } from "../models/domain/config";

export abstract class ConfigService {
  getConfig: () => Promise<Config>;
}
