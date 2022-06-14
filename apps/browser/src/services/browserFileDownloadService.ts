import { Injectable } from "@angular/core";

import { FileDownloadService } from "jslib-common/abstractions/fileDownload.service";
import { FileDownloadRequest } from "jslib-common/models/domain/fileDownloadRequest";

import { BrowserApi } from "../browser/browserApi";

@Injectable()
export class BrowserFileDownloadService implements FileDownloadService {
  download(request: FileDownloadRequest): void {
    BrowserApi.downloadFile(
      request.window,
      request.blobData,
      request.blobOptions,
      request.fileName
    );
  }
}
