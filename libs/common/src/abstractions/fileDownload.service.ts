import { FileDownloadRequest } from "jslib-common/models/domain/fileDownloadRequest";

export abstract class FileDownloadService {
  download: (request: FileDownloadRequest) => void;
}
