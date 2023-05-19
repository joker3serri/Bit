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
 * @param {HTMLElement} el
 * @param {string} eventName
 * @returns {Event} A normalized event
 */
function normalizeEvent(el: FillableControl, eventName: string) {
  let ev;

  if (EVENTS.KEYBOARDEVENT in window) {
    ev = new window.KeyboardEvent(eventName, {
      bubbles: true,
      cancelable: false,
    });
  } else {
    ev = el.ownerDocument.createEvent("Events");
    ev.initEvent(eventName, true, false);
    ev = {
      ...ev,
      charCode: 0,
      keyCode: 0,
      which: 0,
      srcElement: el,
      target: el,
    };
  }

  return ev;
}

/**
 * Click on an element `el`
 * @param {HTMLElement} el
 * @returns {boolean} Returns true if the element was clicked and false if it was not able to be clicked
 */
function clickElement(el: HTMLElement) {
  if (!el || (el && typeof el.click !== TYPE_CHECK.FUNCTION)) {
    return false;
  }

  el.click();

  return true;
}

/**
 * Focus an element and optionally re-set its value after focusing
 * @param {HTMLElement} el
 * @param {boolean} setValue Re-set the value after focusing
 */
function doFocusElement(el: FillableControl, setValue: boolean): void {
  if (setValue) {
    const existingValue = el.value;

    el.focus();
    el.value !== existingValue && (el.value = existingValue);
  } else {
    el.focus();
  }
}

/**
 * Determine if we can apply styling to `element` to indicate that it was filled.
 * @param {HTMLElement} element
 * @param {HTMLElement} animateTheFilling
 * @returns {boolean} Returns true if we can see the element to apply styling.
 */
export function canSeeElementToStyle(element: HTMLElement, animateTheFilling: boolean) {
  let currentEl: any = animateTheFilling;

  if (currentEl) {
    a: {
      currentEl = element;

      // Check the parent tree of `element` for display/visibility
      for (
        let owner: any = element.ownerDocument.defaultView, theStyle;
        currentEl && currentEl !== document;

      ) {
        theStyle = owner.getComputedStyle
          ? owner.getComputedStyle(currentEl, null)
          : currentEl.style;

        if (!theStyle) {
          currentEl = true;

          break a;
        }

        if (theStyle.display === "none" || theStyle.visibility === "hidden") {
          currentEl = false;

          break a;
        }

        currentEl = currentEl.parentNode;
      }

      currentEl = currentEl === document;
    }
  }

  if (
    animateTheFilling &&
    currentEl &&
    !(element as FillableControl)?.type &&
    element.tagName.toLowerCase() === "span"
  ) {
    return true;
  }

  return currentEl
    ? ["email", "text", "password", "number", "tel", "url"].includes(
        (element as FillableControl).type || ""
      )
    : false;
}

/**
 * Helper for doc.querySelectorAll
 * @param {string} theSelector
 * @returns
 */
export function selectAllFromDoc(theSelector: string): NodeListOf<Element> {
  try {
    // Technically this returns a NodeListOf<Element> but it's ducktyped as an Array everywhere, so return it as an array here
    return document.querySelectorAll(theSelector) as NodeListOf<Element>;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("An unexpected error occurred: " + e);

    return [] as unknown as NodeListOf<Element>;
  }
}

/**
 * Find the first element for the given `opid`, falling back to the first relevant unmatched
 * element if non is found.
 * @param {number} theOpId
 * @returns {HTMLElement} The element for the given `opid`, or `null` if not found.
 */
export function getElementByOpId(
  theOpId?: string | null
): HTMLButtonElement | FillableControl | null | undefined {
  let theElement;

  // @TODO do this check at the callsite(s)
  if (!theOpId) {
    return null;
  }

  try {
    const elements: Array<FillableControl | HTMLButtonElement> = Array.prototype.slice.call(
      selectAllFromDoc("input, select, button, textarea, span[data-bwautofill]")
    );

    const filteredElements = elements.filter(function (o) {
      return (o as ElementWithOpId<FillableControl | HTMLButtonElement>).opid === theOpId;
    });

    if (filteredElements.length) {
      theElement = filteredElements[0];

      if (filteredElements.length > 1) {
        // eslint-disable-next-line no-console
        console.warn("More than one element found with opid " + theOpId);
      }
    } else {
      const elIndex = parseInt(theOpId.split("__")[1], 10);

      if (isNaN(elIndex) || !elements[elIndex]) {
        theElement = null;
      } else {
        theElement = elements[elIndex];
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("An unexpected error occurred: " + e);
  } finally {
    // eslint-disable-next-line no-unsafe-finally
    return theElement;
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
  const r = RegExp(
    "((\\\\b|_|-)pin(\\\\b|_|-)|password|passwort|kennwort|passe|contraseña|senha|密码|adgangskode|hasło|wachtwoord)",
    "i"
  );

  // @TODO Check password input type as well?
  const fields = Array.from(selectAllFromDoc("input[type='text']")) as HTMLInputElement[];

  return fields.filter((element) => {
    const { value } = element;

    // @TODO Check placeholder value? title/label/name/id/etc?
    return value && r.test(value);
  });
}

/**
 * Simulate the entry of a value into an element.
 * Clicks the element, focuses it, and then fires a keydown, keypress, and keyup event.
 * @param {HTMLElement} element
 */
export function setValueForElement(element: FillableControl) {
  const valueToSet = element.value;

  clickElement(element);
  doFocusElement(element, false);
  element.dispatchEvent(normalizeEvent(element, EVENTS.KEYDOWN));
  element.dispatchEvent(normalizeEvent(element, EVENTS.KEYPRESS));
  element.dispatchEvent(normalizeEvent(element, EVENTS.KEYUP));

  if (element.value !== valueToSet) {
    element.value = valueToSet;
  }
}

/**
 * Do a click on the element with the given `opId`.
 * @param {number} opId
 * @returns
 */
export function doClickByOpId(opId: string) {
  const el = getElementByOpId(opId) as FillableControl;

  return el ? (clickElement(el) ? [el] : null) : null;
}

/**
 * Touch all the password fields
 */
export function touchAllPasswordFields() {
  getAllPasswordFields().forEach(function (el) {
    setValueForElement(el);
    el.click && el.click();
    setValueForElementByEvent(el);
  });
}

/**
 * Do a `click` and `focus` on all elements that match the query.
 * @param {string} query
 * @returns
 */
export function doClickByQuery(query: string) {
  const fields = Array.from(selectAllFromDoc(query)) as HTMLInputElement[];

  return fields.forEach((element) => {
    clickElement(element);

    if (typeof element.click === TYPE_CHECK.FUNCTION) {
      element.click();
    }

    if (typeof element.focus === TYPE_CHECK.FUNCTION) {
      doFocusElement(element, true);
    }

    return [element];
  });
}

/**
 * Do a click and focus on the element with the given `opId`.
 * @param {number} opId
 * @returns
 */
export function doFocusByOpId(opId: string): null {
  const el = getElementByOpId(opId) as FillableControl;

  if (el) {
    if (typeof el.click === TYPE_CHECK.FUNCTION) {
      el.click();
    }

    if (typeof el.focus === TYPE_CHECK.FUNCTION) {
      doFocusElement(el, true);
    }
  }

  return null;
}

/**
 * Assign `valueToSet` to all elements in the DOM that match `query`.
 * @param {string} query
 * @param {string} valueToSet
 * @returns {Array} Array of elements that were set.
 */
export function doSimpleSetByQuery(query: string, valueToSet: string): FillableControl[] {
  const elements = selectAllFromDoc(query);
  const arr: FillableControl[] = [];

  Array.prototype.forEach.call(
    Array.prototype.slice.call(elements),
    function (el: FillableControl) {
      el.disabled ||
        (el as any).a ||
        (el as HTMLInputElement).readOnly ||
        el.value === void 0 ||
        ((el.value = valueToSet), arr.push(el));
    }
  );

  return arr;
}
