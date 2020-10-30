import { createPopper } from '@popperjs/core';
import { CipherType } from 'jslib/enums/cipherType';
import LinkedList from '../scripts/doublyLinkedList';

/* =========================================================================

menuCtrler API to interact with the menus within the page

    menuCtrler = {
        hide()
        setHeight(integer in px)
        getCipher(id)
        setCiphers([array of ciphers])
        freeze()
        unFreeze()
        activate()
        deactivate()
    }

========================================================================= */

var menuCtrler = {
    addMenuButton          : null,
    hide                   : null,
    setHeight              : null,
    getCipher              : null,
    setCiphers             : null,
    unFreeze               : function() {state.isFrozen = false}, // when frozen, you can't hide nor show the menu
    freeze                 : function() {state.isFrozen = true },
    deactivate             : null,
    activate               : null,
}

/* --------------------------------------------------------------------- */
// GLOBALS
var menuEl,
    popperInstance,
    targetsEl = [],  // fields where
    formsEl = [],    // store all parent forms of fields where a menu has been added (ie forms of targetsEl)
    ciphers ,        // linked list of ciphers to suggest in the menu
    ciphersById,     // a dictionnary of cyphers to suggest in the menu by id : {idCipher:cipher, ...}

    state = {
        currentMenuType  :null,
        isMenuInited     :false,  // menu is not yet initiated, there is no iframe yet for the menu
        isFrozen         :false,  // when frozen, you can't hide nor show the menu
        isActivated      :true,   // false => in page butons have been removed and menu is hidden
        isHidden         :true,
        isAutoFillInited :false,  // true when iframe created and ciphers have been received in the menuCtrler
        isPinLocked      :false,
        lastFocusedEl    :null,
        selectedCipher   : null, // a cipher node of the linkedList `ciphers`
        lastHeight       : null,
    },
    menuBtnSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23297EF1' fill-rule='evenodd' d='M21 11a3 3 0 1 1-.83 5.88l-.04-.01-2.95 2.94c-.1.1-.22.16-.35.18l-.1.01h-.99c-.32 0-.68-.24-.73-.55l-.01-.09v-1.03c0-.16.11-.29.26-.32h.42c.16 0 .29-.11.32-.26v-.43c0-.15.11-.28.26-.31h.42c.15 0 .28-.12.31-.26v-.43c0-.15.12-.28.26-.31l.07-.01h.6c.16 0 .3-.11.32-.26l.01-.06v-.48c-.13-.3-.22-.64-.24-.99L18 14a3 3 0 0 1 3-3zM10.94 5a4.24 4.24 0 0 1 4.2 3.67c1.1.1 2.1.61 2.79 1.38a4.99 4.99 0 0 0-1.92 3.68L16 14v.28l.02.12-.04.03-.15.1c-.18.16-.35.35-.48.55l-.09.16-.01.03-.13.07-.15.1c-.24.17-.44.38-.6.62l-.11.2-.16.1c-.27.16-.5.38-.68.64H7.24A4.21 4.21 0 0 1 3 12.82c0-1.1.43-2.13 1.2-2.92a4.24 4.24 0 0 1 2.53-1.22A4.24 4.24 0 0 1 10.93 5zm9.65 7.52l-.16.03h-.04a.57.57 0 0 0-.29.88l.07.08 1.36 1.35c.31.28.82.12.92-.3.02-.08.04-.17.04-.26l.01-.13v-.08c-.02-.35-.14-.7-.38-.98l-.1-.12-.07-.06a1.67 1.67 0 0 0-1.36-.41zm-7.44-.72a.4.4 0 0 0-.4.4v.1l.02.1.03.1-.18.14a3 3 0 0 1-3.42-.13.97.97 0 0 0 .05-.3.4.4 0 0 0-.4-.41.4.4 0 0 0-.42.39.4.4 0 0 1-.1.25l-.05.06-.15.12a.39.39 0 0 0-.06.52.42.42 0 0 0 .5.14l.06-.03.1-.07.23.15a3.81 3.81 0 0 0 4.1-.02l.2-.13.1.07.08.03a.43.43 0 0 0 .49-.14.4.4 0 0 0 0-.46l-.06-.06-.13-.1a.46.46 0 0 1-.09-.1.55.55 0 0 1-.05-.11l-.02-.06-.02-.15a.4.4 0 0 0-.25-.27l-.07-.02-.09-.01z'/%3E%3C/svg%3E")`;
    // the string after ";utf8,...')" is just the svg inlined. Done here : https://yoksel.github.io/url-encoder/
    // Might be optimized, see here :
    //    * https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
    //    * https://www.npmjs.com/package/mini-svg-data-uri


/* --------------------------------------------------------------------- */
// Add a menu button to an element and initialize the iframe for the menu
function addMenuButton(el, op, markTheFilling, fieldType, opId) {

    if (el && null !== op && void 0 !== op && !(el.disabled || el.a || el.readOnly)) {
        switch (markTheFilling && el.form && !el.form.opfilled && (el.form.opfilled = true),
        el.type ? el.type.toLowerCase() : null) {
            case 'checkbox':
                break;
            case 'radio':
                break;
            default:
                // store in the input element the fieldTypes so that when clicked we can pass it to the menu
                el.dataset.fieldTypes = el.dataset.fieldTypes === undefined ?  fieldType : el.dataset.fieldTypes + '*' + fieldType;
                el.dataset.cozyOpId = opId;
                if (targetsEl.includes(el)) break; // no need to add again the "button" into the field
                _initInPageMenuForEl(el)
                break;
        }
    }
}
menuCtrler.addMenuButton = addMenuButton


/* --------------------------------------------------------------------- */
// Init a target element to be able to trigger the menu
function _initInPageMenuForEl(targetEl) {
    // register this element as one of the targets for the menu
    targetsEl.push(targetEl)

    // style the input element
    targetEl.style.backgroundImage = menuBtnSvg
    targetEl.style.backgroundRepeat = "no-repeat"
    targetEl.style.backgroundAttachment = "scroll"
    targetEl.style.backgroundSize = "24px 24px"
    targetEl.style.backgroundPosition = "calc(100% - 16px) 50%"
    targetEl.style.cursor = "pointer"

    // prevent browser autocomplet with history for this field
    targetEl.autocomplete='off'

    // when user click in a form (not evant an input), the focus is put in the closest input. So if the focus was in an input with the menu opended, the blur event closes the menu which is reopened immmediately when the focus is put again in the menu...
    // solution : freeze the menu half a second after a click in a form that is not in an input.
    const parentForm = targetEl.closest('form')
    if (parentForm && !formsEl.includes(parentForm) ) {
        formsEl.push(parentForm)
        parentForm.addEventListener('click', (evt) => {
            if (evt.target.nodename !== 'INPUT') {
                menuCtrler.freeze()
                setTimeout(menuCtrler.unFreeze, 400)
            }
        })
    }

	if(!state.isMenuInited) {
        // menu is not yet initiated, there is no iframe elemeent for the menu, create one
        menuEl = document.createElement('iframe')
        _setIframeURL(state.currentMenuType, state.isPinLocked )
        menuEl.id  = 'cozy-menu-in-page'
        menuEl.style.cssText = 'z-index: 2147483647 !important; border:0; transition: transform 30ms linear 0s; background-color: transparent; visibility: visible !important;'
        // Append <style> element to add popperjs styles
        // relevant doc for css stylesheet manipulation : https://www.w3.org/wiki/Dynamic_style_-_manipulating_CSS_with_JavaScript
        const styleEl = document.createElement('style')
        styleEl.innerHTML = `
            #cozy-menu-in-page {display: none;}
            #cozy-menu-in-page[data-show] {display: block;}
            #cozy-menu-in-page[data-unvisible] {height: 1px !important; }
        `;
        document.head.appendChild(styleEl)
        // append element and configure popperjs
        document.body.append(menuEl)
        const sameWidth = {
            name     : "sameWidth",
            enabled  : true,
            phase    : "beforeWrite",
            requires : ["computeStyles"],
            fn       : ({ state }) => { state.styles.popper.width = `${state.rects.reference.width+20}px` },
            effect   : ({ state }) => {
                state.elements.popper.style.width = `${state.elements.reference.offsetWidth+20}px`;
            }
        };
        popperInstance = createPopper(targetEl, menuEl, {
            placement: 'bottom',
            modifiers: [
                {
                    name: 'offset',
                    options: {offset: [0, -5]},
                },
                {
                    name: 'computeStyles',
                    options: {
                        adaptive: false,
                    },
                },
                {
                    name: 'flip',
                    options: {
                        fallbackPlacements: ['bottom'], // force the menu ot go only under the field
                    },
                },
                sameWidth,
            ],
        });
        // a serie of updates due to some late html modifications
        // useful for instance for :  https://accounts.google.com/
        setTimeout(popperInstance.update, 600 )
        setTimeout(popperInstance.update, 1200)
        setTimeout(popperInstance.update, 1800)

        state.isMenuInited = true
    }

    // hide menu if focus leaves the input
    targetEl.addEventListener('blur' , _onBlur)
    // show menu when input receives focus or is clicked (it can be click while it already has focus)
    targetEl.addEventListener('focus', _onFocus)
    targetEl.addEventListener('click', _onClick)
    // listen keystrokes on the input form
    targetEl.addEventListener('keydown', _onKeyDown);

}

function _onBlur(event) {
    if (!event.isTrusted) return;
    // console.log('Blur event in an input', event.target.id)
    menuCtrler.hide()
    return true
}

function _onFocus(event) {
    // console.log('focus event in an input', event.target.id);
    if (!event.isTrusted) return;
    show(this)
}

function _onClick(event) {
    // console.log('click event in an input', event.target.id);
    if (!event.isTrusted) return;
    show(this)
}

function _onKeyDown(event) {
    // console.log('keydown event', event.key, state.isHidden);
    if (!event.isTrusted) return;
    const keyName = event.key;
    if (keyName === 'Escape') {
        // console.log('escape ==> hide');
        menuCtrler.hide(true)
        return;
    } else if (keyName === 'Tab') {
        return;
    } else if (keyName === 'ArrowUp') {
        event.stopPropagation()
        event.preventDefault()
        if (state.isHidden) {
            show(event.target)
        } else {
            menuCtrler.moveSelection(-1)
        }
        return;
    } else if (keyName === 'ArrowDown') {
        event.stopPropagation()
        event.preventDefault()
        if (state.isHidden) {
            show(event.target)
        } else {
            menuCtrler.moveSelection(1)
        }
        return;
    } else if (keyName === 'Enter') {
        if (state.isHidden) return
        event.stopPropagation()
        event.preventDefault()
        menuCtrler.submit()      // else request menu selection validation
        return;
    } else if  (_isCharacterKeyPress(event)){
        // console.log('_isCharacterKeyPress ==> hide');
        menuCtrler.hide(true)
        return;
    }
}


/* --------------------------------------------------------------------- */
//
function show(targetEl) {
    // console.log('menuCtrler.show() ');
    if (state.isFrozen) return
    state.lastFocusedEl = targetEl
    popperInstance.state.elements.reference = targetEl
    popperInstance.update()
    menuEl.setAttribute('data-show', '')
    state.isHidden = false
    // find the first cipher to display
    selectFirstCipherToSuggestFor(targetEl)
    // in the end show the menu
    _setApplyFadeInUrl(true, targetEl.dataset.fieldTypes)
}


/* --------------------------------------------------------------------- */
// Hide the menu element
// force = false : a short time out will wait to check where the focus
//       goes so that to not hide if target is an input or the iframe of
//       the menu.
// force = true : hide the menu without waiting to check the target of the focus.
// let n = 0 // usefull for debug...
function hide(force) {
    // n++  // usefull for debug...
    // console.log(`Hide call id=0${n}, force=${!!force}`); // usefull for debug...
    if (state.isFrozen) return
    if (force && typeof force == 'boolean') {
        _setApplyFadeInUrl(false)
        // hide menu element after a delay so that the inner pannel has been scaled to 0 and therefore enables
        // a proper start for the next display of the menu.
        // There is an explanation in MDN but their solution didnot work as well as this one :
        // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Tips#Run_an_animation_again
        // but don't delay this execution, other wise the menu will still be displayed when the page details will be run
        // and there fore will consider fields under the iframe as being hidden. These fields would then not be filled...
        // console.log(`FORCE HIDE _ call id=0${n}`, state.lastFocusedEl, ); // usefull for debug...
        if (document.activeElement === menuEl) {
            // the focus is in the iframe.
            // When closing it, put focus back in the correct input in the page
            // but freeze the menu so that focus event doesn't open the menu again
            // and in order to prevent the masking of fields by the menu (not viewable fields are not autofilled...),
            // set menu height to 1px a
            // console.log(`Hide_A call id=0${n}, force=${!!force}, activeElement.id=${document.activeElement.id}`); // usefull for debug...
            menuEl.setAttribute('data-unvisible', '') // to hide menu immediately
            menuCtrler.freeze()
            state.lastFocusedEl.focus()
            setTimeout(()=>{
                menuEl.removeAttribute('data-show') // hide completly the menu only after fade out in the iframe is over
                menuEl.removeAttribute('data-unvisible')
                menuCtrler.unFreeze()
            }, 600)
        }else{
            // console.log(`Hide_B call id=0${n}, force=${!!force}, activeElement.id=${document.activeElement.id}`); // usefull for debug...
            menuEl.removeAttribute('data-show')
        }
        state.isHidden = true
        return
    }
    setTimeout(() => {
        const target = document.activeElement;
        if (!force && (targetsEl.indexOf(target) != -1 || target.tagName == 'IFRAME' && target.id == 'cozy-menu-in-page')) {
            // Focus is know in iframe or in one of the input => do NOT hide
            // console.log(`Hide_C : After hide, focus is now in iframe or in one of the input => do NOT hide _ call id=0${n}`); // usefull for debug...
            return
        }
        // console.log(`Hide_D :log after timeout concludes DO HIDE call id=0${n}`); // usefull for debug...
        // otherwise, hide
        _setApplyFadeInUrl(false)
        // hide menu element after a delay so that the inner pannel has been scaled to 0 and therefore enables
        // a proper start for the next display of the menu.
        // There is an explanation in MDN but their solution didnot work as well as this one :
        // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Tips#Run_an_animation_again
        setTimeout(()=>{menuEl.removeAttribute('data-show')}, 600)
        state.isHidden = true
    }, 100);
}
menuCtrler.hide = hide


/* --------------------------------------------------------------------- */
// Hide menu and remove the "buttons" in form inputs
function deactivate() {
    if (!menuEl) return; // can happen
    hide(true)
    removeInPageButtons()
    state.isActivated = false;
}
menuCtrler.deactivate = deactivate


/* --------------------------------------------------------------------- */
// Remove the "buttons" in form inputs and their listerners
function removeInPageButtons() {
    for (var el of targetsEl) {
        el.style.backgroundImage = ''
        el.removeEventListener('blur' , _onBlur)
        el.removeEventListener('focus', _onFocus)
        el.removeEventListener('click', _onClick)
        el.removeEventListener('keydown', _onKeyDown);
        el.dataset.fieldTypes = ''
    }
    targetsEl = []
}


/* --------------------------------------------------------------------- */
// Moves selection of +1 or -1  (n=1 || n=-1)
function moveSelection(n) {
    const cipherTypesToSuggest = getPossibleTypesForField(state.lastFocusedEl).cipherTypes
    let newCipherNode
    const selectedCipher = state.selectedCipher
    if (n>0) {
        newCipherNode = selectedCipher.prev;
    } else {
        newCipherNode = selectedCipher.next;
    }
    while (newCipherNode!== selectedCipher) { // we could not find a cipher other than the current selected one
        if(newCipherNode=== null) {      // reach end of the list
            if (n>0) {
                newCipherNode = ciphers.head()
            } else {
                newCipherNode = ciphers.tail()
            }
        }
        if (cipherTypesToSuggest.includes(newCipherNode.data.type)) {
            break
        }
        if (n>0) {
            newCipherNode = newCipherNode.prev;
        } else {
            newCipherNode = newCipherNode.next;
        }
    }
    state.selectedCipher = newCipherNode

    chrome.runtime.sendMessage({
        command      : 'bgAnswerMenuRequest',
        subcommand   : 'menuMoveSelection',
        targetCipher : newCipherNode.data.id,
        sender       : 'menuCtrler',
    });
}
menuCtrler.moveSelection = moveSelection


/* --------------------------------------------------------------------- */
//
function getPossibleTypesForField(fieldEl) {
    const fieldTypesStr = fieldEl.dataset.fieldTypes
    const fieldTypes = fieldTypesStr.split('*')
    const cipherTypes = []
    // cipher.type : 1:login 2:notes  3:Card 4: identities
    if (fieldTypesStr.includes('login_'   )) cipherTypes.push(CipherType.Login)
    if (fieldTypesStr.includes('card_'    )) cipherTypes.push(CipherType.Card)
    if (fieldTypesStr.includes('identity_')) cipherTypes.push(CipherType.Identity)
    return {cipherTypes, fieldTypes }
}


/* --------------------------------------------------------------------- */
// Submit the currently selected cypher for autofill
function submit() {
    chrome.runtime.sendMessage({
        command    : 'bgAnswerMenuRequest',
        subcommand : 'fillFormWithCipher',
        sender     : 'menuCtrler',
        cipherId   : state.selectedCipher.data.id,
    });
}
menuCtrler.submit = submit


/* --------------------------------------------------------------------- */
// Set the height of menuEl (iframe) taking into account the inner margin
function setHeight(h) {
    if (!state.isMenuInited) return // happens if in an iframe without relevant inputs for the menu
    if (state.lastHeight === h )  return
    menuEl.style.height = h + 28 + 'px'
    state.lastHeight = h
}
menuCtrler.setHeight = setHeight


/* --------------------------------------------------------------------- */
// Get a cipher given its id
function getCipher(id) {
    return ciphersById[id]
}
menuCtrler.getCipher = getCipher


/* --------------------------------------------------------------------- */
// Set the ciphers
function setCiphers(newCiphers) {
    ciphers = new LinkedList()
    ciphersById = {}
    for (var cipherListId in newCiphers) {
        if (!newCiphers.hasOwnProperty(cipherListId)) continue
        for (var cipher of newCiphers[cipherListId]) {
            ciphers.append(cipher)
            ciphersById[cipher.id] = cipher
        }
    }
    state.isAutoFillInited = true
    selectFirstCipherToSuggestFor(state.lastFocusedEl)
}
menuCtrler.setCiphers = setCiphers


/* --------------------------------------------------------------------- */
// Run this function so that menuCtrler.state.selectedCipher corresponds
// to the initial selection within the menu
function selectFirstCipherToSuggestFor(fieldEl) {
    if (state.isHidden) return
    if (!ciphers || ciphers._length == 0) return
    if (!fieldEl) return
    let newCipherNode = ciphers.head()
    const cipherTypesToSuggest = getPossibleTypesForField(fieldEl).cipherTypes
    do {
        if (cipherTypesToSuggest.includes(newCipherNode.data.type)) {
            state.selectedCipher = newCipherNode;
            return // found
        }
        newCipherNode = newCipherNode.prev;
    } while (newCipherNode!== null) // we could not find a cipher other than the current selected one
}


/* --------------------------------------------------------------------- */
//
function setMenuType(menuType, isPinLocked) {
    // console.log('setMenuType()', {menuType, isPinLocked});
    if (menuType === state.currentMenuType) {
        _setIframeURL(menuType, isPinLocked)
        _forceIframeRefresh()
        return
    }
    if (menuEl) {
        _setIframeURL(menuType, isPinLocked)
        removeInPageButtons() // remove all "buttons"
        if (menuType === 'autofillMenu' && state.currentMenuType === 'loginMenu' ) {
            if (state.lastFocusedEl) {
                window.setTimeout(()=>{
                    // timeout is required in order to move focus only when iframe url has been setup
                    state.lastFocusedEl.focus()
                },100)
            }
        }
    }
    state.currentMenuType = menuType
    state.isPinLocked = isPinLocked
}
menuCtrler.setMenuType = setMenuType


/* --------------------------------------------------------------------- */
//
function _setIframeURL(menuType, isPinLocked) {
    if (!menuEl) return
    let hash = '';
    const rand = '?' + Math.floor((Math.random()*1000000)+1)
    if (menuEl.src) {
        const location = new URL(menuEl.src)
        hash = location.hash
    }
    if (menuType === 'autofillMenu') {
        menuEl.src = chrome.runtime.getURL('inPageMenu/menu.html' + rand)  + hash
    } else if (menuType === 'loginMenu') {
        let urlParams = ''
        if (isPinLocked) urlParams = '?isPinLocked=true'
        menuEl.src = chrome.runtime.getURL('inPageMenu/loginMenu.html' + urlParams + rand) + hash
    }
}


/* --------------------------------------------------------------------- */
// just modify the random part of the iframe url in order to force refresh
function _forceIframeRefresh() {
    if (!menuEl || !menuEl.src) return
    const url = new URL(menuEl.src)
    const rand = '?' + Math.floor((Math.random()*1000000)+1)
    menuEl.src = url.origin + url.pathname + url.search + rand + url.hash
}


/* --------------------------------------------------------------------- */
//
function _setApplyFadeInUrl(doApply, fieldTypes) {
    if (!menuEl || !menuEl.src) return
    const url = new URL(menuEl.src)
    if (doApply) {
        // console.log('menuCtrler.applyFadeIn()');
        menuEl.src = url.origin + url.pathname + url.search + '#applyFadeIn*' + fieldTypes
    } else {
        // console.log('menuCtrler.removeFadeIn()');
        const currentFieldTypes = menuEl.src.slice(menuEl.src.search(/\*.*/gi))
        menuEl.src = url.origin + url.pathname + url.search + '#dontApplyFadeIn' + currentFieldTypes
    }
}


/* --------------------------------------------------------------------- */
//
function _isCharacterKeyPress(evt) {
    return evt.key.length === 1;
}


/* --------------------------------------------------------------------- */
//
function _hideMenuEl(isHide){
    if (isHide) {
        menuEl.removeAttribute('data-show')
    } else {
        menuEl.setAttribute('data-show','')
    }
}


/* --------------------------------------------------------------------- */
// EXPORT
export default menuCtrler;
