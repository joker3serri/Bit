import * as fetch from "node-fetch";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

import { Response } from "../models/response";
import { MessageResponse } from "../models/response/messageResponse";

export class UpdateCommand {
  inPkg = false;

  clientsReleaseListEndpoint = "https://api.github.com/repos/bitwarden/clients/releases";
  defaultDownloadUrl = "https://github.com/bitwarden/clients/releases";
  npmUpdateCommand = "npm install -g @bitwarden/cli";

  constructor(
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private appName: string,
    private executableName: string,
    private showExtendedMessage: boolean
  ) {
    this.inPkg = !!(process as any).pkg;
  }

  async run(): Promise<Response> {
    const currentVersion = await this.platformUtilsService.getApplicationVersion();

    const response = await fetch.default(this.clientsReleaseListEndpoint);
    if (response.status === 200) {
      const responseJson = await response.json();
      const cliTag = responseJson.find((r: any) => r.tag_name.includes(this.appName));
      if (cliTag === undefined || cliTag === null) {
        return Response.error("Could not find latest CLI version.");
      }

      const res = new MessageResponse(null, null);

      const tagName: string = cliTag.tag_name;
      if (tagName === "cli-v" + currentVersion) {
        res.title = "No update available.";
        res.noColor = true;
        return Response.success(res);
      }

      let downloadUrl: string = null;
      if (cliTag.assets != null) {
        for (const a of cliTag.assets) {
          const download: string = a.browser_download_url;
          if (download == null) {
            continue;
          }

          if (download.indexOf(".zip") === -1) {
            continue;
          }

          if (
            process.platform === "win32" &&
            download.indexOf(this.executableName + "-windows") > -1
          ) {
            downloadUrl = download;
            break;
          } else if (
            process.platform === "darwin" &&
            download.indexOf(this.executableName + "-macos") > -1
          ) {
            downloadUrl = download;
            break;
          } else if (
            process.platform === "linux" &&
            download.indexOf(this.executableName + "-linux") > -1
          ) {
            downloadUrl = download;
            break;
          }
        }
      }

      res.title = "A new version is available: " + tagName;
      if (downloadUrl == null) {
        downloadUrl = this.defaultDownloadUrl;
      } else {
        res.raw = downloadUrl;
      }
      res.message = "";
      if (responseJson.body != null && responseJson.body !== "") {
        res.message = responseJson.body + "\n\n";
      }

      res.message += "You can download this update at " + downloadUrl;

      if (this.showExtendedMessage) {
        if (this.inPkg) {
          res.message +=
            "\n\nIf you installed this CLI through a package manager " +
            "you should probably update using its update command instead.";
        } else {
          res.message +=
            "\n\nIf you installed this CLI through NPM " +
            "you should update using `" +
            this.npmUpdateCommand +
            "`";
        }
      }
      return Response.success(res);
    } else {
      return Response.error("Error contacting update API: " + response.status);
    }
  }
}
