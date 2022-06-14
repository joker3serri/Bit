import { Injectable } from "@angular/core";
import { FileDownloadService } from "jslib-common/abstractions/fileDownload.service";

import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { FileDownloadRequest } from "jslib-common/models/domain/fileDownloadRequest";

@Injectable()
export class WebFileDownloadService implements FileDownloadService {
  constructor(private platformUtilsService: PlatformUtilsService) {}

  download(request: FileDownloadRequest): void {
    const a = request.window.document.createElement("a");
    if (request.downloadMethod === "save") {
      a.download = request.fileName;
    } else if (!this.platformUtilsService.isSafari()) {
      a.target = "_blank";
    }
    a.href = URL.createObjectURL(request.blob);
    a.style.position = "fixed";
    request.window.document.body.appendChild(a);
    a.click();
    request.window.document.body.removeChild(a);
  }
}
