import { DefaultOffscreenDocumentService } from "./offscreen-document.service";

describe("DefaultOffscreenDocumentService", () => {
  let sut: DefaultOffscreenDocumentService;
  const reasons = [chrome.offscreen.Reason.TESTING];
  const justification = "justification is testing";
  const url = "offscreen-document/index.html";
  const api = {
    createDocument: jest.fn(),
    closeDocument: jest.fn(),
    hasDocument: jest.fn().mockResolvedValue(false),
    Reason: chrome.offscreen.Reason,
  };

  beforeEach(() => {
    chrome.offscreen = api;

    sut = new DefaultOffscreenDocumentService();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("withDocument", () => {
    it("creates a document when none exists", async () => {
      await sut.withDocument(reasons, justification, () => {});

      expect(chrome.offscreen.createDocument).toHaveBeenCalledWith({
        url,
        reasons,
        justification,
      });
    });

    it("does not create a document when one exists", async () => {
      api.hasDocument.mockResolvedValue(true);

      await sut.withDocument(reasons, justification, () => {});

      expect(chrome.offscreen.createDocument).not.toHaveBeenCalled();
    });

    describe.each([true, false])("hasDocument returns %s", (hasDocument) => {
      beforeEach(() => {
        api.hasDocument.mockResolvedValue(hasDocument);
      });

      it("calls the callback", async () => {
        const callback = jest.fn();

        await sut.withDocument(reasons, justification, callback);

        expect(callback).toHaveBeenCalled();
      });

      it("returns the callback result", async () => {
        const callback = jest.fn().mockReturnValue("result");

        const result = await sut.withDocument(reasons, justification, callback);

        expect(result).toBe("result");
      });

      it("closes the document when the callback completes and no other callbacks are running", async () => {
        await sut.withDocument(reasons, justification, () => {});

        expect(chrome.offscreen.closeDocument).toHaveBeenCalled();
      });

      it("does not close the document when the callback completes and other callbacks are running", async () => {
        await Promise.all([
          sut.withDocument(reasons, justification, () => {}),
          sut.withDocument(reasons, justification, () => {}),
          sut.withDocument(reasons, justification, () => {}),
          sut.withDocument(reasons, justification, () => {}),
        ]);

        expect(chrome.offscreen.closeDocument).toHaveBeenCalledTimes(1);
      });
    });
  });
});
