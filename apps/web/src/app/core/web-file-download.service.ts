import { Injectable } from "@angular/core";

import { FileDownloadBuilder } from "@bitwarden/common/platform/abstractions/file-download/file-download-builder";
import { FileDownloadRequest } from "@bitwarden/common/platform/abstractions/file-download/file-download.request";
import { FileDownloadService } from "@bitwarden/common/platform/abstractions/file-download/file-download.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

@Injectable()
export class WebFileDownloadService implements FileDownloadService {
  constructor(private platformUtilsService: PlatformUtilsService) {}

  download(request: FileDownloadRequest): void {
    const builder = new FileDownloadBuilder(request);
    const a = window.document.createElement("a");
    if (builder.downloadMethod === "save") {
      a.download = request.fileName;
    } else if (!this.platformUtilsService.isSafari()) {
      a.target = "_blank";
    }
    a.href = URL.createObjectURL(builder.blob);
    a.style.position = "fixed";
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  }
}
