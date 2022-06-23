export type FileDownloadRequest = {
  fileName: string;
  blobData: BlobPart;
  blobOptions?: BlobPropertyBag;
  forceDownload?: boolean;
};
