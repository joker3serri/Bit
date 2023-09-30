import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";

import { Account } from "./account";
import { Client } from "./client";
import { ClientInfo } from "./clientInfo";
import { Parser } from "./parser";
import { ParserOptions } from "./parserOptions";
import { Ui } from "./ui";

export class Vault {
  accounts: Account[];

  private client: Client;

  constructor(cryptoFunctionService: CryptoFunctionService) {
    const parser = new Parser(cryptoFunctionService);
    this.client = new Client(cryptoFunctionService, parser);
  }

  async open(
    username: string,
    password: string,
    clientInfo: ClientInfo,
    ui: Ui,
    parserOptions: ParserOptions = ParserOptions.default
  ) {
    this.accounts = await this.client.openVault(username, password, clientInfo, ui, parserOptions);
  }
}
