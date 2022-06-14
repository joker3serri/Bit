import { Injectable } from "@angular/core";

import { FileDownloadService } from "jslib-common/abstractions/fileDownload.service";
import { FileDownloadRequest } from "jslib-common/models/domain/fileDownloadRequest";

@Injectable()
export class DesktopFileDownloadService implements FileDownloadService {
  download(request: FileDownloadRequest): void {
    const a = request.window.document.createElement("a");
    a.href = URL.createObjectURL(request.blob);
    a.download = request.fileName;
    a.style.position = "fixed";
    request.window.document.body.appendChild(a);
    a.click();
    request.window.document.body.removeChild(a);
  }
}
