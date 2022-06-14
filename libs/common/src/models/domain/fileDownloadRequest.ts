export class FileDownloadRequest {
  window: Window;
  fileName: string;
  forceDownload: boolean;

  blobData: any;

  private _blobOptions: any;
  get blobOptions(): any {
    const options = this._blobOptions ?? {};
    if (options.type == null) {
      options.type = this.fileType;
    }
    return options;
  }

  get blob(): Blob {
    if (this.blobOptions != null) {
      return new Blob([this.blobData], this.blobOptions);
    } else {
      return new Blob([this.blobData]);
    }
  }

  get downloadMethod(): "save" | "open" {
    return this.forceDownload || this.fileType != "application/pdf" ? "save" : "open";
  }

  get fileType() {
    const fileNameLower = this.fileName.toLowerCase();
    if (fileNameLower.endsWith(".pdf")) {
      return "application/pdf";
    } else if (fileNameLower.endsWith(".xlsx")) {
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    } else if (fileNameLower.endsWith(".docx")) {
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (fileNameLower.endsWith(".pptx")) {
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    } else if (fileNameLower.endsWith(".csv")) {
      return "text/csv";
    } else if (fileNameLower.endsWith(".png")) {
      return "image/png";
    } else if (fileNameLower.endsWith(".jpg") || fileNameLower.endsWith(".jpeg")) {
      return "image/jpeg";
    } else if (fileNameLower.endsWith(".gif")) {
      return "image/gif";
    }
    return null;
  }

  constructor(
    window: Window,
    fileName: string,
    blobData: any,
    blobOptions?: any,
    forceDownload = false
  ) {
    this.window = window;
    this.fileName = fileName;
    this.blobData = blobData;
    this._blobOptions = blobOptions;
    this.forceDownload = forceDownload;
  }
}
