import { Injectable } from "@angular/core";

import { FileDownloadService } from "@bitwarden/common/abstractions/fileDownload/fileDownload.service";
import { FileDownloadRequest } from "@bitwarden/common/abstractions/fileDownload/fileDownloadRequest";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

@Injectable()
export class WebFileDownloadService implements FileDownloadService {
  constructor(private platformUtilsService: PlatformUtilsService) {}

  download(request: FileDownloadRequest): void {
    const a = window.document.createElement("a");
    if (request.downloadMethod === "save") {
      a.download = request.fileName;
    } else if (!this.platformUtilsService.isSafari()) {
      a.target = "_blank";
    }
    a.href = URL.createObjectURL(request.blob);
    a.style.position = "fixed";
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  }
}
