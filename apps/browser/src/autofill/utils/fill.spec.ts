import { urlNotSecure, canSeeElementToStyle } from "./fill";

const mockLoginForm = `
  <div id="root">
    <form>
      <input type="text" id="username" />
      <input type="password" />
    </form>
  </div>
`;

let windowSpy: jest.SpyInstance<any>;
let confirmSpy: jest.SpyInstance<boolean, [message?: string]>;
let savedURLs: string[] | null = ["https://bitwarden.com"];
document.body.innerHTML = mockLoginForm;

function setMockWindowLocationProtocol(protocol: "http:" | "https:") {
  windowSpy.mockImplementation(() => ({
    location: {
      protocol,
    },
  }));
}

beforeEach(() => {
  windowSpy = jest.spyOn(window, "window", "get");
  confirmSpy = jest.spyOn(window, "confirm");
});

afterEach(() => {
  windowSpy.mockRestore();
  confirmSpy.mockRestore();

  document.body.innerHTML = mockLoginForm;
});

describe("fill utils", () => {
  describe("urlNotSecure", () => {
    it("is secure on page with no password field", () => {
      setMockWindowLocationProtocol("https:");

      document.body.innerHTML = `
        <div id="root">
          <form>
            <input type="text" id="username" />
          </form>
        </div>
      `;

      const isNotSecure = urlNotSecure(savedURLs);

      expect(isNotSecure).toEqual(false);
    });

    it("is secure on https page with saved https URL", () => {
      setMockWindowLocationProtocol("https:");

      const isNotSecure = urlNotSecure(savedURLs);

      expect(isNotSecure).toEqual(false);
    });

    it("is secure on http page with saved https URL and user approval", () => {
      confirmSpy.mockImplementation(jest.fn(() => true));

      const isNotSecure = urlNotSecure(savedURLs);

      expect(isNotSecure).toEqual(false);
    });

    it("is not secure on http page with saved https URL and user disapproval", () => {
      setMockWindowLocationProtocol("http:");

      confirmSpy.mockImplementation(jest.fn(() => false));

      const isNotSecure = urlNotSecure(savedURLs);

      expect(isNotSecure).toEqual(true);
    });

    it("is secure on http page with saved http URL", () => {
      savedURLs = ["http://bitwarden.com"];

      setMockWindowLocationProtocol("http:");

      const isNotSecure = urlNotSecure(savedURLs);

      expect(isNotSecure).toEqual(false);
    });

    it("is secure when there are no saved URLs", () => {
      savedURLs = [];

      setMockWindowLocationProtocol("http:");

      let isNotSecure = urlNotSecure(savedURLs);

      expect(isNotSecure).toEqual(false);

      savedURLs = null;

      isNotSecure = urlNotSecure(savedURLs);

      expect(isNotSecure).toEqual(false);
    });
  });

  describe("canSeeElementToStyle", () => {
    it("should return true when the element is a non-hidden password field", () => {
      const testElement = document.querySelector('input[type="password"]') as HTMLElement;

      expect(canSeeElementToStyle(testElement, true)).toEqual(true);
    });

    it("should return true when the element is a non-hidden email input", () => {
      document.body.innerHTML = mockLoginForm + '<input type="email" />';
      const testElement = document.querySelector('input[type="email"]') as HTMLElement;

      expect(canSeeElementToStyle(testElement, true)).toEqual(true);
    });

    it("should return true when the element is a non-hidden text input", () => {
      document.body.innerHTML = mockLoginForm + '<input type="text" />';
      const testElement = document.querySelector('input[type="text"]') as HTMLElement;

      expect(canSeeElementToStyle(testElement, true)).toEqual(true);
    });

    it("should return true when the element is a non-hidden number input", () => {
      document.body.innerHTML = mockLoginForm + '<input type="number" />';
      const testElement = document.querySelector('input[type="number"]') as HTMLElement;

      expect(canSeeElementToStyle(testElement, true)).toEqual(true);
    });

    it("should return true when the element is a non-hidden tel input", () => {
      document.body.innerHTML = mockLoginForm + '<input type="tel" />';
      const testElement = document.querySelector('input[type="tel"]') as HTMLElement;

      expect(canSeeElementToStyle(testElement, true)).toEqual(true);
    });

    it("should return true when the element is a non-hidden url input", () => {
      document.body.innerHTML = mockLoginForm + '<input type="url" />';
      const testElement = document.querySelector('input[type="url"]') as HTMLElement;

      expect(canSeeElementToStyle(testElement, true)).toEqual(true);
    });

    it("should return false when the element is a non-hidden hidden input type", () => {
      document.body.innerHTML = mockLoginForm + '<input type="hidden" />';
      const testElement = document.querySelector('input[type="hidden"]') as HTMLElement;

      expect(canSeeElementToStyle(testElement, true)).toEqual(false);
    });

    it("should return false when the element is a non-hidden textarea", () => {
      document.body.innerHTML = mockLoginForm + "<textarea></textarea>";
      const testElement = document.querySelector("textarea") as HTMLElement;

      expect(canSeeElementToStyle(testElement, true)).toEqual(false);
    });

    it("should return true when the element is a non-hidden span", () => {
      document.body.innerHTML = mockLoginForm + '<span id="input-tag"></span>';
      const testElement = document.querySelector("#input-tag") as HTMLElement;

      expect(canSeeElementToStyle(testElement, true)).toEqual(true);
    });

    it("should return false when the element is a unsupported tag", () => {
      document.body.innerHTML = mockLoginForm + '<div id="input-tag"></div>';
      const testElement = document.querySelector("#input-tag") as HTMLElement;

      expect(canSeeElementToStyle(testElement, true)).toEqual(false);
    });

    it("should return false when the element has a `visibility: hidden;` CSS rule applied to it", () => {
      const testElement = document.querySelector('input[type="password"]') as HTMLElement;
      testElement.style.visibility = "hidden";

      expect(canSeeElementToStyle(testElement, true)).toEqual(false);
    });

    it("should return false when the element has a `display: none;` CSS rule applied to it", () => {
      const testElement = document.querySelector('input[type="password"]') as HTMLElement;
      testElement.style.display = "none";

      expect(canSeeElementToStyle(testElement, true)).toEqual(false);
    });

    it("should return false when a parent of the element has a `display: none;` or `visibility: hidden;` CSS rule applied to it", () => {
      document.body.innerHTML =
        mockLoginForm + '<div style="visibility: hidden;"><input type="email" /></div>';
      let testElement = document.querySelector('input[type="email"]') as HTMLElement;

      expect(canSeeElementToStyle(testElement, true)).toEqual(false);

      document.body.innerHTML =
        mockLoginForm +
        `
          <div style="display: none;">
            <div>
              <span id="input-tag"></span>
            </div>
          </div>
        `;
      testElement = document.querySelector("#input-tag") as HTMLElement;

      expect(canSeeElementToStyle(testElement, true)).toEqual(false);
    });
  });
});
