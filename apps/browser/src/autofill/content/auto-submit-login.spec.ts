import AutofillPageDetails from "../models/autofill-page-details";
import AutofillScript from "../models/autofill-script";
import {
  createAutofillFieldMock,
  createAutofillPageDetailsMock,
  createAutofillScriptMock,
} from "../spec/autofill-mocks";
import { flushPromises, sendMockExtensionMessage } from "../spec/testing-utils";

let pageDetailsMock: AutofillPageDetails;
let fillScriptMock: AutofillScript;

jest.mock("../services/collect-autofill-content.service", () => {
  const module = jest.requireActual("../services/collect-autofill-content.service");
  return {
    CollectAutofillContentService: class extends module.CollectAutofillContentService {
      async getPageDetails(): Promise<AutofillPageDetails> {
        return pageDetailsMock;
      }

      deepQueryElements<T>(element: HTMLElement, queryString: string): T[] {
        return Array.from(element.querySelectorAll(queryString)) as T[];
      }
    },
  };
});
jest.mock("../services/insert-autofill-content.service");

describe("AutoSubmitLogin content script", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setupEnvironmentDefaults();
    require("./auto-submit-login");
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("ends the auto-submit login workflow if the page does not contain any fields", async () => {
    pageDetailsMock.fields = [];

    await initAutoSubmitWorkflow();

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      command: "updateIsFieldCurrentlyFilling",
      isFieldCurrentlyFilling: false,
    });
  });

  describe("when the page contains form fields", () => {
    it("ends the auto-submit login workflow if the provided fill script does not contain an autosubmit value", async () => {
      await initAutoSubmitWorkflow();

      sendMockExtensionMessage({
        command: "triggerAutoSubmitLogin",
        fillScript: fillScriptMock,
        pageDetailsUrl: globalThis.location.href,
      });
      await flushPromises();

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        command: "updateIsFieldCurrentlyFilling",
        isFieldCurrentlyFilling: false,
      });
    });

    describe("triggering auto-submit on formless fields", () => {
      beforeEach(async () => {
        pageDetailsMock.fields = [
          createAutofillFieldMock({ htmlID: "username", formOpid: null, opid: "name-field" }),
          createAutofillFieldMock({
            htmlID: "password",
            type: "password",
            formOpid: null,
            opid: "password-field",
          }),
        ];
        fillScriptMock = createAutofillScriptMock(
          {
            autosubmit: [null, null],
          },
          { "name-field": "name-value", "password-field": "password-value" },
        );
        document.body.innerHTML = `
          <div>
            <div>
              <label for="username">Username</label>
              <input type="text" id="username" name="username">
            </div>
            <div>
              <label for="password">Password</label>
              <input type="password" id="password" name="password">
            </div>
          </div>
          <div class="submit-container">
            <input type="submit" value="Submit">
          </div>
        `;
        await initAutoSubmitWorkflow();
      });

      it("fills the fields and triggers the submit action on an element that contains a type=Submit attribute", async () => {
        const passwordElement = document.getElementById("password") as HTMLInputElement;
        (passwordElement as any).opid = "password-field";
        const submitButton = document.querySelector(
          ".submit-container input[type=submit]",
        ) as HTMLInputElement;
        jest.spyOn(submitButton, "click");

        sendMockExtensionMessage({
          command: "triggerAutoSubmitLogin",
          fillScript: fillScriptMock,
          pageDetailsUrl: globalThis.location.href,
        });
        await flushPromises();

        expect(submitButton.click).toHaveBeenCalled();
      });
    });

    describe("triggering auto-submit on a form", () => {});
  });
});

function setupEnvironmentDefaults() {
  document.body.innerHTML = ``;
  pageDetailsMock = createAutofillPageDetailsMock();
  fillScriptMock = createAutofillScriptMock();
}

async function initAutoSubmitWorkflow() {
  jest.advanceTimersByTime(250);
  await flushPromises();
}
