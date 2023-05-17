import { FormElement } from "../types";

import { urlNotSecure, canSeeElementToStyle, selectAllFromDoc, getElementByOpId } from "./fill";

type FormElementExtended = FormElement & { opid?: string };

const mockLoginForm = `
  <div id="root">
    <form>
      <input type="text" id="username" />
      <input type="password" />
    </form>
  </div>
`;

let confirmSpy: jest.SpyInstance<boolean, [message?: string]>;
let consoleSpy: jest.SpyInstance<any>;
let windowSpy: jest.SpyInstance<any>;
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
      const testElement: FormElementExtended = document.querySelector('input[type="password"]');

      expect(canSeeElementToStyle(testElement, true)).toEqual(true);
    });

    it("should return true when the element is a non-hidden email input", () => {
      document.body.innerHTML = mockLoginForm + '<input type="email" />';
      const testElement: FormElementExtended = document.querySelector('input[type="email"]');

      expect(canSeeElementToStyle(testElement, true)).toEqual(true);
    });

    it("should return true when the element is a non-hidden text input", () => {
      document.body.innerHTML = mockLoginForm + '<input type="text" />';
      const testElement: FormElementExtended = document.querySelector('input[type="text"]');

      expect(canSeeElementToStyle(testElement, true)).toEqual(true);
    });

    it("should return true when the element is a non-hidden number input", () => {
      document.body.innerHTML = mockLoginForm + '<input type="number" />';
      const testElement: FormElementExtended = document.querySelector('input[type="number"]');

      expect(canSeeElementToStyle(testElement, true)).toEqual(true);
    });

    it("should return true when the element is a non-hidden tel input", () => {
      document.body.innerHTML = mockLoginForm + '<input type="tel" />';
      const testElement: FormElementExtended = document.querySelector('input[type="tel"]');

      expect(canSeeElementToStyle(testElement, true)).toEqual(true);
    });

    it("should return true when the element is a non-hidden url input", () => {
      document.body.innerHTML = mockLoginForm + '<input type="url" />';
      const testElement: FormElementExtended = document.querySelector('input[type="url"]');

      expect(canSeeElementToStyle(testElement, true)).toEqual(true);
    });

    it("should return false when the element is a non-hidden hidden input type", () => {
      document.body.innerHTML = mockLoginForm + '<input type="hidden" />';
      const testElement: FormElementExtended = document.querySelector('input[type="hidden"]');

      expect(canSeeElementToStyle(testElement, true)).toEqual(false);
    });

    it("should return false when the element is a non-hidden textarea", () => {
      document.body.innerHTML = mockLoginForm + "<textarea></textarea>";
      const testElement: FormElementExtended = document.querySelector("textarea");

      expect(canSeeElementToStyle(testElement, true)).toEqual(false);
    });

    it("should return true when the element is a non-hidden span", () => {
      document.body.innerHTML = mockLoginForm + '<span id="input-tag"></span>';
      const testElement: FormElementExtended = document.querySelector("#input-tag");

      expect(canSeeElementToStyle(testElement, true)).toEqual(true);
    });

    it("should return false when the element is a unsupported tag", () => {
      document.body.innerHTML = mockLoginForm + '<div id="input-tag"></div>';
      const testElement: FormElementExtended = document.querySelector("#input-tag");

      expect(canSeeElementToStyle(testElement, true)).toEqual(false);
    });

    it("should return false when the element has a `visibility: hidden;` CSS rule applied to it", () => {
      const testElement: FormElementExtended = document.querySelector('input[type="password"]');
      testElement.style.visibility = "hidden";

      expect(canSeeElementToStyle(testElement, true)).toEqual(false);
    });

    it("should return false when the element has a `display: none;` CSS rule applied to it", () => {
      const testElement: FormElementExtended = document.querySelector('input[type="password"]');
      testElement.style.display = "none";

      expect(canSeeElementToStyle(testElement, true)).toEqual(false);
    });

    it("should return false when a parent of the element has a `display: none;` or `visibility: hidden;` CSS rule applied to it", () => {
      document.body.innerHTML =
        mockLoginForm + '<div style="visibility: hidden;"><input type="email" /></div>';
      let testElement: FormElementExtended = document.querySelector('input[type="email"]');

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
      testElement = document.querySelector("#input-tag");
      expect(canSeeElementToStyle(testElement, true)).toEqual(false);
    });
  });

  describe("selectAllFromDoc", () => {
    it("should return an array of all elements in the document which the selector targets", () => {
      let selection = selectAllFromDoc("input");

      expect(selection.length).toEqual(2);

      selection = selectAllFromDoc("p");

      expect(selection.length).toEqual(0);
    });
  });

  describe("getElementByOpId", () => {
    it("should return the element with the opid property value matching the passed value", () => {
      const textInput: FormElementExtended = document.querySelector('input[type="text"]');
      const passwordInput: FormElementExtended = document.querySelector('input[type="password"]');

      textInput.setAttribute("opid", "__0");
      passwordInput.setAttribute("opid", "__1");

      expect(getElementByOpId("__0")).toEqual(textInput);
      expect(getElementByOpId("__0")).not.toEqual(passwordInput);
      expect(getElementByOpId("__1")).toEqual(passwordInput);
    });

    describe("should handle multiple elements with the same `opid` property value matching the passed value", () => {
      beforeAll(() => {
        consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {
          /* no-op */
        });
      });

      afterAll(() => {
        consoleSpy.mockRestore();
      });

      it("should return the first of the elements with an `opid` value matching the passed value and emit a console warning", () => {
        const textInput: FormElementExtended = document.querySelector('input[type="text"]');
        const passwordInput: FormElementExtended = document.querySelector('input[type="password"]');

        textInput.opid = "__1";
        passwordInput.opid = "__1";

        expect(getElementByOpId("__1")).toEqual(textInput);
        expect(getElementByOpId("__1")).not.toEqual(passwordInput);
        expect(getElementByOpId("__0")).toEqual(textInput);
        expect(consoleSpy.mock.calls[0]?.[0]).toEqual("More than one element found with opid __1");
      });
    });

    it("should return the first of input, select, button, textarea, or span[data-bwautofill] elements or when the passed value cannot be found", () => {
      const textInput: FormElementExtended = document.querySelector('input[type="text"]');
      const passwordInput: FormElementExtended = document.querySelector('input[type="password"]');

      textInput.removeAttribute("opid");
      passwordInput.opid = "__1";

      expect(textInput.hasAttribute("opid")).toEqual(false);
      expect(getElementByOpId("__0")).toEqual(textInput);
      expect(getElementByOpId("__0")).not.toEqual(passwordInput);
    });

    it("should return null if a falsey value is passed", () => {
      expect(getElementByOpId(null)).toEqual(null);
      expect(getElementByOpId(undefined)).toEqual(null);
    });

    it("should return null if no suitable element could be found", () => {
      document.body.innerHTML = "<div></div>";

      expect(getElementByOpId("__2")).toEqual(null);
    });
  });
});
