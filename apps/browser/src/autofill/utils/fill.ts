import { EVENTS, TYPE_CHECK } from "../constants";
import { FillableControl, ElementWithOpId } from "../types";

/**
 * Check if the action to autofill on the given page should be considered "secure"
 * @param {string[]} savedURLs
 * @return {Boolean}
 */
export function urlNotSecure(savedURLs?: string[] | null): boolean {
  // @TODO do this check at the callsite(s)
  if (!savedURLs || !savedURLs.length) {
    return false;
  }

  const confirmationWarning = [
    chrome.i18n.getMessage("insecurePageWarning"),
    chrome.i18n.getMessage("insecurePageWarningFillPrompt", [window.location.hostname]),
  ].join("\n\n");

  if (
    // At least one of the `savedURLs` uses SSL
    savedURLs.some((url) => url.startsWith("https://")) &&
    // The current page is not using SSL
    window.location.protocol === "http:" &&
    // There are password inputs on the page
    document.querySelectorAll("input[type=password]").length
  ) {
    // The user agrees the action is unsafe or not
    return !confirm(confirmationWarning);
  }

  // The action is secure
  return false;
}

/**
 * Normalize the event based on API support
 * @param {HTMLElement} element
 * @param {string} eventName
 * @returns {Event} A normalized event
 */
function normalizeEvent(element: FillableControl, eventName: string) {
  let event;

  if (EVENTS.KEYBOARDEVENT in window) {
    event = new window.KeyboardEvent(eventName, {
      bubbles: true,
      cancelable: false,
    });
  } else {
    event = element.ownerDocument.createEvent("Events");
    // new Event(EVENTS.INPUT, { bubbles: true, cancelable: true });
    event.initEvent(eventName, true, false);
    event = {
      ...event,
      charCode: 0,
      keyCode: 0,
      which: 0,
      srcElement: element,
      target: element,
    };
  }

  return event;
}

/**
 * Click on an element `element`
 * @param {HTMLElement} element
 * @returns {boolean} Returns true if the element was clicked and false if it was not able to be clicked
 */
function clickElement(element: HTMLElement) {
  if (!element || (element && typeof element.click !== TYPE_CHECK.FUNCTION)) {
    return false;
  }

  element.click();

  return true;
}

/**
 * Focus an element and optionally re-set its value after focusing
 * @param {HTMLElement} element
 * @param {boolean} shouldResetValue Reset the value after focusing
 */
function doFocusElement(element: FillableControl, shouldResetValue: boolean): void {
  if (shouldResetValue) {
    const initialValue = element.value;

    element.focus();

    if (element.value !== initialValue) {
      element.value = initialValue;
    }
  } else {
    element.focus();
  }
}

/**
 * Determine if we can apply styling to `element` to indicate that it was filled.
 * @param {HTMLElement} element
 * @param {HTMLElement} animateTheFilling
 * @returns {boolean} Returns true if we can see the element to apply styling.
 */
export function canSeeElementToStyle(element: HTMLElement, animateTheFilling: boolean) {
  let currentElement: any = animateTheFilling;

  if (currentElement) {
    a: {
      currentElement = element;

      // Check the parent tree of `element` for display/visibility
      for (
        let owner: any = element.ownerDocument.defaultView, theStyle;
        currentElement && currentElement !== document;

      ) {
        theStyle = owner.getComputedStyle
          ? owner.getComputedStyle(currentElement, null)
          : currentElement.style;

        if (!theStyle) {
          currentElement = true;

          break a;
        }

        if (theStyle.display === "none" || theStyle.visibility === "hidden") {
          currentElement = false;

          break a;
        }

        currentElement = currentElement.parentNode;
      }

      currentElement = currentElement === document;
    }
  }

  if (
    animateTheFilling &&
    currentElement &&
    !(element as FillableControl)?.type &&
    element.tagName.toLowerCase() === "span"
  ) {
    return true;
  }

  return currentElement
    ? ["email", "text", "password", "number", "tel", "url"].includes(
        (element as FillableControl).type || ""
      )
    : false;
}

/**
 * Helper for doc.querySelectorAll
 * @param {string} selector
 * @returns
 */
export function selectAllFromDoc(selector: string): NodeListOf<Element> {
  try {
    return document.querySelectorAll(selector);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("An unexpected error occurred: " + error);

    return [] as unknown as NodeListOf<Element>;
  }
}

/**
 * Find the first element for the given `opid`, falling back to the first relevant unmatched
 * element if non is found.
 * @param {number} targetOpId
 * @returns {HTMLElement} The element for the given `opid`, or `null` if not found.
 */
export function getElementByOpId(
  targetOpId?: string | null
): HTMLButtonElement | FillableControl | null | undefined {
  let currentElement;

  // @TODO do this check at the callsite(s)
  if (!targetOpId) {
    return null;
  }

  try {
    const elements = Array.from(
      selectAllFromDoc("input, select, button, textarea, span[data-bwautofill]")
    ) as Array<FillableControl | HTMLButtonElement>;

    const filteredElements = elements.filter(
      (element) =>
        (element as ElementWithOpId<FillableControl | HTMLButtonElement>).opid === targetOpId
    );

    if (filteredElements.length) {
      currentElement = filteredElements[0];

      if (filteredElements.length > 1) {
        // eslint-disable-next-line no-console
        console.warn("More than one element found with opid " + targetOpId);
      }
    } else {
      const elementIndex = parseInt(targetOpId.split("__")[1], 10);

      if (isNaN(elementIndex) || !elements[elementIndex]) {
        currentElement = null;
      } else {
        currentElement = elements[elementIndex];
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("An unexpected error occurred: " + error);
  } finally {
    // eslint-disable-next-line no-unsafe-finally
    return currentElement;
  }
}

/**
 * Simulate the entry of a value into an element by using events.
 * Dispatches a keydown, keypress, and keyup event, then fires the `input` and `change` events before removing focus.
 * @param {HTMLElement} element
 */
export function setValueForElementByEvent(element: FillableControl) {
  const valueToSet = element.value;
  const inputEvent = new Event(EVENTS.INPUT, { bubbles: true, cancelable: true });
  const changeEvent = new Event(EVENTS.CHANGE, { bubbles: true, cancelable: true });

  element.dispatchEvent(normalizeEvent(element, EVENTS.KEYDOWN));
  element.dispatchEvent(normalizeEvent(element, EVENTS.KEYPRESS));
  element.dispatchEvent(normalizeEvent(element, EVENTS.KEYUP));
  element.dispatchEvent(inputEvent);
  element.dispatchEvent(changeEvent);
  element.blur();

  if (element.value !== valueToSet) {
    element.value = valueToSet;
  }
}

/**
 * Get all the elements on the DOM that are likely to be a password field
 * @returns {Array} Array of elements
 */
function getAllPasswordFields() {
  const passwordPattern = RegExp(
    "((\\\\b|_|-)pin(\\\\b|_|-)|password|passwort|kennwort|passe|contraseña|senha|密码|adgangskode|hasło|wachtwoord)",
    "i"
  );

  // @TODO Check password input type as well?
  const fields = Array.from(selectAllFromDoc("input[type='text']")) as HTMLInputElement[];

  return fields.filter((element) => {
    const { value } = element;

    // @TODO Check placeholder value? title/label/name/id/etc?
    return value && passwordPattern.test(value);
  });
}

/**
 * Simulate the entry of a value into an element.
 * Clicks the element, focuses it, and then fires a keydown, keypress, and keyup event.
 * @param {HTMLElement} element
 */
export function setValueForElement(element: FillableControl) {
  const initialValue = element.value;

  clickElement(element);
  doFocusElement(element, false);
  element.dispatchEvent(normalizeEvent(element, EVENTS.KEYDOWN));
  element.dispatchEvent(normalizeEvent(element, EVENTS.KEYPRESS));
  element.dispatchEvent(normalizeEvent(element, EVENTS.KEYUP));

  if (element.value !== initialValue) {
    element.value = initialValue;
  }
}

/**
 * Do a click on the element with the given `opId`.
 * @param {string} opId
 * @returns
 */
export function doClickByOpId(opId: string) {
  const element = getElementByOpId(opId) as FillableControl;

  return element ? (clickElement(element) ? [element] : null) : null;
}

/**
 * Touch all the password fields
 */
export function touchAllPasswordFields() {
  getAllPasswordFields().forEach(function (element) {
    setValueForElement(element);
    element.click && element.click();
    setValueForElementByEvent(element);
  });
}

/**
 * Do a `click` and `focus` on all elements that match the query.
 * @param {string} selector
 * @returns
 */
export function doClickByQuery(selector: string) {
  const fields = Array.from(selectAllFromDoc(selector)) as HTMLInputElement[];

  return fields.forEach((element) => {
    clickElement(element);

    if (typeof element.click === TYPE_CHECK.FUNCTION) {
      element.click();
    }

    if (typeof element.focus === TYPE_CHECK.FUNCTION) {
      doFocusElement(element, true);
    }

    // @TODO Is this meant to return all the affected elements?
    return [element];
  });
}

/**
 * Do a click and focus on the element with the given `opId`.
 * @param {string} opId
 * @returns
 */
export function doFocusByOpId(opId: string): null {
  const element = getElementByOpId(opId) as FillableControl;

  if (element) {
    if (typeof element.click === TYPE_CHECK.FUNCTION) {
      element.click();
    }

    if (typeof element.focus === TYPE_CHECK.FUNCTION) {
      doFocusElement(element, true);
    }
  }

  return null;
}

/**
 * Assign `valueToSet` to all elements in the DOM that match `selector`.
 * @param {string} selector
 * @param {string} valueToSet
 * @returns {Array} Array of elements that were set.
 */
export function doSimpleSetByQuery(selector: string, valueToSet: string): FillableControl[] {
  const elements = Array.from(selectAllFromDoc(selector)) as FillableControl[];

  return elements.filter((element) => {
    if (
      element.disabled ||
      (element as any).a ||
      (element as HTMLInputElement).readOnly ||
      element.value === undefined
    ) {
      return false;
    }

    element.value = valueToSet;

    return true;
  });
}
