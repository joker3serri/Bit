import * as program from "commander";
import * as inquirer from "inquirer";

import { ImportService } from "@bitwarden/common/abstractions/import.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization.service";
import {
  byteArrayImportOptions,
  ImportType,
  passwordImportOptions,
} from "@bitwarden/common/enums/importOptions";
import { Importer } from "@bitwarden/common/importers/importer";
import { Response } from "@bitwarden/node/cli/models/response";
import { MessageResponse } from "@bitwarden/node/cli/models/response/messageResponse";

import { CliUtils, FileDataType } from "../utils";

export class ImportCommand {
  constructor(
    private importService: ImportService,
    private organizationService: OrganizationService
  ) {}

  async run(
    format: ImportType,
    filepath: string,
    options: program.OptionValues
  ): Promise<Response> {
    const organizationId = options.organizationid;
    if (organizationId != null) {
      const organization = await this.organizationService.get(organizationId);

      if (organization == null) {
        return Response.badRequest(
          `You do not belong to an organization with the ID of ${organizationId}. Check the organization ID and sync your vault.`
        );
      }

      if (!organization.canAccessImportExport) {
        return Response.badRequest(
          "You are not authorized to import into the provided organization."
        );
      }
    }

    if (options.formats || false) {
      return await this.list();
    } else {
      return await this.import(format, filepath, organizationId);
    }
  }

  private async import(format: ImportType, filepath: string, organizationId: string) {
    if (format == null) {
      return Response.badRequest("`format` was not provided.");
    }
    if (filepath == null || filepath === "") {
      return Response.badRequest("`filepath` was not provided.");
    }

    const importer = this.importService.getImporter(
      format,
      organizationId,
      passwordImportOptions.includes(format) ? await this.promptPassword() : undefined
    );
    if (importer === null) {
      return Response.badRequest("Proper importer type required.");
    }

    try {
      let contents: string | Buffer;
      if (format === "1password1pux") {
        contents = await CliUtils.extract1PuxContent(filepath);
      } else {
        contents = await CliUtils.readFile(
          filepath,
          byteArrayImportOptions.includes(format) ? FileDataType.Binary : FileDataType.Utf8
        );
      }

      if (contents === null || contents === "") {
        return Response.badRequest("Import file was empty.");
      }

      const response = await this.doImport(importer, contents, organizationId);
      if (response.success) {
        response.data = new MessageResponse("Imported " + filepath, null);
      }
      return response;
    } catch (err) {
      return Response.badRequest(err);
    }
  }

  private async list() {
    const options = this.importService
      .getImportOptions()
      .sort((a, b) => {
        return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
      })
      .map((option) => option.id)
      .join("\n");
    const res = new MessageResponse("Supported input formats:", options);
    res.raw = options;
    return Response.success(res);
  }

  private async doImport(
    importer: Importer,
    contents: string | Buffer,
    organizationId?: string
  ): Promise<Response> {
    const err = await this.importService.import(importer, contents, organizationId);
    if (err != null) {
      if (err.passwordRequired) {
        importer = this.importService.getImporter(
          "bitwardenpasswordprotected",
          organizationId,
          await this.promptPassword()
        );
        return this.doImport(importer, contents, organizationId);
      }
      return Response.badRequest(err.message);
    }

    return Response.success();
  }

  private async promptPassword() {
    const answer: inquirer.Answers = await inquirer.createPromptModule({
      output: process.stderr,
    })({
      type: "password",
      name: "password",
      message: "Import file password:",
    });
    return answer.password;
  }
}
