require('./menu.scss');

// Globals
var ciphers                    ,
    panel                      ,
    arrow                      ,
    currentArrowOffset  = null ,
    resizeListener = null      ,
    lastSentHeight             ,
    titleEl                    ,
    i18nGetMessage             ,
    currentArrowOffset         ,
    focusedFieldTypes;

const loginRowTemplate = `
<div class="row-main">
    <div class="row-icon icon-login"></div>
    <div class="row-main-content">
        <div class="row-text">site description</div>
        <div class="row-detail">account login</div>
    </div>
</div>
`;
const cardRowTemplate = `
<div class="row-main">
    <div class="row-icon icon-card"></div>
    <div class="row-main-content">
        <div class="row-text">site description</div>
        <div class="row-detail">account login</div>
    </div>
</div>
`;

const idsRowTemplate = `
<div class="row-main">
    <i class="row-icon icon-identity"></i>
    <div class="row-main-content">
        <div class="row-text">site description</div>
        <div class="row-detail">account login</div>
    </div>
</div>
`;


document.addEventListener('DOMContentLoaded', () => {

    // 1- get elements references
    panel = document.querySelector('.panel')
    arrow = document.getElementById('arrow')
    titleEl = document.getElementById('title-content')

    // 2- prepare i18n and apply
    var i18n = {};
    var lang = window.navigator.language;
    if (typeof safari !== 'undefined') { // not implemented for safari for now
        // const responseCommand = 'notificationBarFrameDataResponse';
        // sendPlatformMessage({
        //     command: 'bgGetDataForTab',
        //     responseCommand: responseCommand
        // });
        // safari.self.addEventListener('message', (msgEvent) => {
        //     const msg = JSON.parse(msgEvent.message.msg);
        //     if (msg.command === responseCommand && msg.data) {
        //         i18n = msg.data.i18n;
        //         load();
        //     }
        // }, false);
    } else {
        // retrieve i18n values and set elements textcontent
        lang = chrome.i18n.getUILanguage();
        i18nGetMessage = chrome.i18n.getMessage
        titleEl.textContent = i18nGetMessage('inPageMenuSelectAnAccount')
    }

    // 3- listen to the commands and ciphers sent by the addon
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        /*
        @override by Cozy : this log is very useful for reverse engineering the code, keep it for tests
        console.log('menu.js HEARD : ', {
            'command': msg.command,
            'subcommand': msg.subcommand,
            'sender': sender.url ? new URL(sender.url).pathname : sender,
            "msg": msg,
            "heard in": document.location.pathname
        });
        */
        if (msg.command !== 'updateMenuCiphers' && msg.command !== 'menuAnswerRequest') return

        if (msg.command === 'updateMenuCiphers') {
            ciphers = msg.data.ciphers
            document.getElementById('logo-link').href = msg.data.cozyUrl
            updateAllRows()
            // then request to adjust the menu height
            adjustMenuHeight()
            // then update the height each time the iframe window is resized
            if (!resizeListener) {
                resizeListener = window.addEventListener('resize', ()=>{
                    adjustMenuHeight()
                });
            }

        } else if (msg.command === 'menuAnswerRequest') {
            switch (msg.subcommand) {
                case 'menuSetSelectionOnCipher':
                    setSelectionOnCipher(msg.targetCipher)
                    break;
                case 'menuSelectionValidate':
                    requestFormFillingWithCipher(document.querySelector('.selected').dataset.cipherId)
                    break;
            }
        }
    })

    // 4- request ciphers to the background scripts
    chrome.runtime.sendMessage({
        command   : 'bgAnswerMenuRequest',
        subcommand: 'getCiphersForTab'   ,
        sender    : 'menu.js'            ,
    });

    // 5- listen to click on the close menu button
    const closeIcon = document.querySelector('.close-icon')
    closeIcon.addEventListener('click',()=>{
        chrome.runtime.sendMessage({
            command   : 'bgAnswerMenuRequest',
            subcommand: 'closeMenu'          ,
            force     : true                 ,
            sender    : 'menu.js'            ,
        });
    })

    // 6- listen to click on the rows
    document.querySelectorAll('#login-rows-list, #card-rows-list, #ids-rows-list').forEach( list => {
        list.addEventListener('click',(e)=>{
            const rowEl = e.target.closest('.row-main')
            requestFormFillingWithCipher(rowEl.dataset.cipherId)
        })
    })

    // 7- detect when to apply the fadeIn effect
    window.addEventListener('hashchange', _testHash)
    _testHash()

})


/* --------------------------------------------------------------------- */
// Request the background to autofill the page with a cipher
function requestFormFillingWithCipher(cipherId) {
    chrome.runtime.sendMessage({
        command   : 'bgAnswerMenuRequest',
        subcommand: 'fillFormWithCipher' ,
        cipherId  : cipherId             ,
        sender    : 'menu.js'            ,
    });
}


/* --------------------------------------------------------------------- */
// Update all rows
function updateAllRows() {
    updateRows('login')
    updateRows('card')
    updateRows('ids')
    selectFirstVisibleRow()
}


/* --------------------------------------------------------------------- */
// Update login rows.
// Existing rows will be deleted
// rowsListType = 'login' or 'card' or 'ids'
function updateRows(rowsListType) {
    let rowsList, rowTemplate, rowsCiphers
    // 1- generate rows
    switch (rowsListType) {
        case 'login':
            if (!ciphers || !ciphers.logins) return
            rowsCiphers = ciphers.logins
            rowsList = document.querySelector('#login-rows-list')
            rowTemplate = loginRowTemplate
            break;
        case 'card':
            if (!ciphers || !ciphers.cards) return
            rowsCiphers = ciphers.cards
            rowsList = document.querySelector('#card-rows-list')
            rowTemplate = cardRowTemplate
            break;
        case 'ids':
            if (!ciphers || !ciphers.identities) return
            rowsCiphers = ciphers.identities
            rowsList = document.querySelector('#ids-rows-list')
            rowTemplate = idsRowTemplate
            break;
    }
    // 2- remove all previous rows
    while (rowsList.firstElementChild) {rowsList.firstElementChild.remove();}
    // 3- add rows
    rowsCiphers.forEach((cipher, i) => {
        rowsList.insertAdjacentHTML('beforeend', rowTemplate)
        const row = rowsList.lastElementChild
        const text = row.querySelector('.row-text')
        const detail = row.querySelector('.row-detail')
        row.dataset.cipherId = cipher.id
        switch (rowsListType) {
            case 'login':
                text.textContent = cipher.name
                detail.textContent = cipher.login.username
                break;
            case 'card':
                text.textContent = cipher.name
                detail.textContent = cipher.card[focusedFieldTypes.card]
                break;
            case 'ids':
                text.textContent = cipher.name
                detail.textContent = cipher.identity[focusedFieldTypes.identity]
                break;
        }
    });
}


/* --------------------------------------------------------------------- */
// Select the first visible row
function selectFirstVisibleRow() {
    if (!ciphers) return // no received ciphers yet, rows are not ready
    const hash = window.location.hash
    const currentSelection = document.querySelector('.selected')
    if(currentSelection) currentSelection.classList.remove('selected')
    if (hash.includes('login_')) {
        document.querySelector('#login-rows-list').firstElementChild.classList.add('selected')
        return
    }
    if (hash.includes('card_')) {
        document.querySelector('#card-rows-list').firstElementChild.classList.add('selected')
        return
    }
    if (hash.includes('identity_')) {
        document.querySelector('#ids-rows-list').firstElementChild.classList.add('selected')
        return
    }
}

/* --------------------------------------------------------------------- */
// Ask parent page to adjuste iframe height
// Width is constraint by the parent page, but height is decided by the
// iframe content
function adjustMenuHeight() {
    if (lastSentHeight === panel.offsetHeight) return
    lastSentHeight = panel.offsetHeight
    chrome.runtime.sendMessage({
        command   : 'bgAnswerMenuRequest' ,
        subcommand: 'setMenuHeight'       ,
        height    : lastSentHeight        ,
        sender    : 'menu.js'             ,
    });
}



/* --------------------------------------------------------------------- */
// Select the row corresponding to a Cipher ID
function setSelectionOnCipher(targetCipherId) {
    // 1- remove current selection
    document.querySelector('.selected').classList.remove('selected')
    // 2- set new selection
    document.querySelector(`[data-cipher-id="${targetCipherId}"]`).classList.add('selected')
}


/* --------------------------------------------------------------------- */
// Test if iframe content should fadeIn or not
// and display rows corresponding to the fieldtypes of the focused field
// content of the hash = {
//    login:"username",
//    identity:"email",
//    card: "",
//    applyFadeIn:[boolean],
//    arrowD:[Float],
// }
function _testHash(){
    let hash = window.location.hash
    if (hash) {
        hash = JSON.parse(decodeURIComponent(hash).slice(1))
    }
    focusedFieldTypes = hash

    const typesOptions = [
        {
            fieldType:'card',
            title:i18nGetMessage('inPageMenuSelectACard'),
            updateFn: () => updateRows('card'),
            selector:'#card-rows-list',
        },
        {
            fieldType:'identity',
            title:i18nGetMessage('inPageMenuSelectAnIdentity'),
            updateFn: () => updateRows('ids'),
            selector:'#ids-rows-list',
        },
        {
            fieldType:'login',
            title:i18nGetMessage('inPageMenuSelectAnAccount'),
            updateFn: () => updateRows('login'),
            selector:'#login-rows-list',
        },
    ]

    for (let options of typesOptions) {
        const rowsEl = document.querySelector(options.selector)
        if (focusedFieldTypes[options.fieldType]) {
            titleEl.textContent = options.title
            options.updateFn()
            rowsEl.classList.remove('hidden')
        } else {
            rowsEl.classList.add('hidden')
        }
    }

    if (hash.applyFadeIn) {
        adjustMenuHeight()
        panel.classList.add('fade-in')
    } else {
        panel.className = "panel";
    }

    if (hash.arrowD !== undefined && hash.arrowD !== currentArrowOffset ) {
        currentArrowOffset = hash.arrowD
        arrow.style.right = 10 - hash.arrowD + 'px'
    }

    selectFirstVisibleRow()

}
