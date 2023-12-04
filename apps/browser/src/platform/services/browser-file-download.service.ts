import { Injectable } from "@angular/core";

import { FileDownloadBuilder } from "@bitwarden/common/platform/abstractions/file-download/file-download.builder";
import { FileDownloadRequest } from "@bitwarden/common/platform/abstractions/file-download/file-download.request";
import { FileDownloadService } from "@bitwarden/common/platform/abstractions/file-download/file-download.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";

import { SafariApp } from "../../browser/safariApp";
import { BrowserApi } from "../browser/browser-api";

@Injectable()
export class BrowserFileDownloadService implements FileDownloadService {
  download(request: FileDownloadRequest): void {
    const builder = new FileDownloadBuilder(request);
    if (BrowserApi.isSafariApi) {
      let data: BlobPart = null;
      if (builder.blobOptions.type === "text/plain" && typeof request.blobData === "string") {
        data = request.blobData;
      } else {
        data = Utils.fromBufferToB64(request.blobData as ArrayBuffer);
      }
      SafariApp.sendMessageToApp(
        "downloadFile",
        JSON.stringify({
          blobData: data,
          blobOptions: request.blobOptions,
          fileName: request.fileName,
        }),
        true,
      );
    } else {
      const a = window.document.createElement("a");
      a.href = URL.createObjectURL(builder.blob);
      a.download = request.fileName;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    }
  }
}
