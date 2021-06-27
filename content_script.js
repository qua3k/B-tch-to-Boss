// throttling global variables
let replaceWait = false;
let replaceWaitTime = 250; // quarter of a second
let replaceQueue = [];

// language configuration
let useLang = 'en';
let supportedLangs = ['en', 'de', 'fr'];
let htmlLang = document.documentElement.lang ? document.documentElement.lang.slice(0,2).toLowerCase() : 'en'; // english if not declared
let firstLang = '';

const re = (input) => {
    let firstLetter = input[0];
    let rest = input.slice(1);
    return new RegExp(`\\b(${firstLetter})(${rest})\\b`, 'gi');
};

const casing = (input) => {
    let firstLetter = input[0];
    let firstLetterUpper = firstLetter.toUpperCase(); // we use ASCII because all first letters are ASCII.
    let rest = input.slice(1);
    return [`${firstLetter}${rest}`, `${firstLetterUpper}${rest}`];
};

const data = {
    'de': {
        'singular': {
            'terms': [
                re('schlampe'),
                re('hure'),
                re('nutte'),
                re('fotze'),
                re('drecksfotze'),
                re('tussi'),
                re('trulla'),
                re('schnalle'),
                re('luder'),
                re('hexe'),
                re('flittchen'),
                re('dumme Kuh'),
                re('mistst[uü]ck'),
                re('biest'),
                re('zicke'),
                re('rabenmutter'),
                re('manns?weib'),
                re('kratzb[uü]rste'),
                re('feminazi'),
                re('xanthippe'),
                re('bitterfotze'),
                re('weib'),
                re('dreckss?chlampe'),
                re('furie'),
                re('muschi'),
            ],
            'replacement': casing('Heldin'),
        },
        'plural': {
            'terms': [
                re('schlampen'),
                re('huren'),
                re('nutten'),
                re('fotzen'),
                re('drecksfotzen'),
                re('tussis'),
                re('trullas'),
                re('schnallen'),
                re('hexen'),
                re('dumme kühe'),
                re('mistst[uü]cke'),
                re('biester'),
                re('zicken'),
                re('rabenm[uü]tter'),
                re('mannsweiber'),
                re('kratzb[uü]rsten'),
                re('feminazis'),
                re('xanthippen'),
                re('bitterfotzen'),
                re('weiber'),
                re('drecksss?chlampen'),
                re('furien'),
                re('muschis'),
            ],
            'replacement': casing('Heldinnen'),
        },
    },
    'fr': {
        'singular': {
            'terms': [
                re('garce'),
                re('pute'),
                re('salope'),
                re('connasse'),
                re('chauffeuse'),
                re('chaudasse'),
                re('chienne'),
                re('cochonne'),
                re('prostituée'),
                re('putain'),
                re('allumeuse'),
                re('femme facile'),
                re('fille facile'),
                re('chiennasse'),
                re('gouinasse'),
                re('tepu'),
                re('mal bais[eé]e'),
                re('hyst[eé]rique'),
                re('conne'),
                re('grognasse'),
                re('gourdasse'),
                re('bouche [aà] bite'),
                re('suceuse de bite'),
                re('greluche'),
                re('pouf'),
                re('pouffiasse'),
                re('radasse'),
                re('p[eé]tasse')
            ],
            'replacement': casing('guerrière'),
        },
        'plural': {
            'terms': [
                re('garces'),
                re('putes'),
                re('salopes'),
                re('connasses'),
                re('chauffeuses'),
                re('chaudasses'),
                re('bimbos'),
                re('chiennes'),
                re('cochonnes'),
                re('prostituées'),
                re('putains'),
                re('allumeuses'),
                re('femmes faciles'),
                re('filles faciles'),
                re('chiennasses'),
                re('gouinasses'),
                re('tepus'),
                re('mal bais[eé]es'),
                re('hyst[eé]riques'),
                re('connes'),
                re('grognasses'),
                re('gourdasses'),
                re('bouches [aà] bite'),
                re('suceuses de bite'),
                re('greluches'),
                re('poufs'),
                re('pouffiasses'),
                re('radasses'),
                re('p[eé]tasses')
            ],
            'replacement': casing('guerrières'),
        },
    },
    'en': {
        'singular': {
            'terms': [
                re('whore'),
                re('slut'),
                re('snatch'),
                re('thot'),
                re('ho'),
                re('cunt'),
                re('twat'),
                re('transtrender'),
                re('shemale'),
                re('squaw'),
                re('milf'),
                re('welfare queen'),
                re('yummy mommy'),
                re('battleaxe'),
                re('hooker'),
                re('prostitute'),
                re('bi[ao]tch'),
                re('be[ao]tch'),
            ],
            'replacement': casing('boss'),
        },
        'plural': {
            'terms': [
                re('whores'),
                re('sluts'),
                re('snatchs'),
                re('thots'),
                re('hos'),
                re('cunts'),
                re('twats'),
                re('transtrenders'),
                re('shemales'),
                re('squaws'),
                re('milfs'),
                re('welfare queens'),
                re('yummy mommys'),
                re('yummy mommies'),
                re('bimbos'),
                re('battleaxes'),
                re('hookers'),
                re('prostititues'),
                re('bi[ao]tches'),
                re('be[ao]tches')
            ],
            'replacement': casing('bosses'),
        },
    },
};

const data_multi = {
    'singular': {
        'terms': [
            re('bitch'),
            re('pussy'),
            re('bimbo'),
        ],
        'replacement': data[useLang].singular.replacement,
    },
    'plural': {
        'terms': [
            re('bitches'),
            re('pussies'),
            re('bimbos'),
        ],
        'replacement': data[useLang].plural.replacement,
    },
};

function replaceText(v) {

    for (let lang in data) {
        for (let category in data[lang]) {
            let [replacement, replacementUpper] = data[lang][category].replacement;
            for (let term of data[lang][category].terms) {
                v = v.replace(term, (match, firstLetter) => firstLetter == firstLetter.toUpperCase() ? replacementUpper : replacement);
            }
        }
    }

    for (let category in data_multi) {
        for (let term of data_multi[category].terms) {
            let [replacement, replacementUpper] = data_multi[category].replacement;

            v = v.replace(term, (match, firstLetter) => firstLetter == firstLetter.toUpperCase() ? replacementUpper : replacement);
        }
    }

    return v;
}

function processQueue() {
    // clone queue
    let queue = replaceQueue.slice(0);
    // empty queue
    replaceQueue = [];
    // loop through clone
    queue.forEach( (mutations) => {
        replaceNodes(mutations);
    });
}

function setWait() {
    replaceWait = true;
    setTimeout(function () {
        replaceWait = false;
        timerCallback();
    }, replaceWaitTime);
}

function timerCallback() {
    if(replaceQueue.length > 0) {
        // if there are queued items, process them
        processQueue();
        // then set wait to do next batch
        setWait();
    } else {
        // if the queue has been empty for a full timer cycle
        // remove the wait time to process the next action
        replaceWait = false;
    }
}

// The callback used for the document body and title observers
function observerCallback(mutations) {
    // add to queue
    replaceQueue.push(mutations);
    if(!replaceWait) {
        processQueue();
        setWait();
    } // else the queue will be processed when the timer finishes
}

function walk(rootNode) {
    // Find all the text nodes in rootNode
    let walker = document.createTreeWalker(
        rootNode,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                return /^(STYLE|SCRIPT)$/.test(node.parentElement.tagName) || /^\s*$/.test(node.data) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
            }
        },
        false
    ),
    node;

    // Modify each text node's value
    while (node = walker.nextNode()) {
        handleText(node);
    }
}

function handleText(textNode) {
    textNode.nodeValue = replaceText(textNode.nodeValue);
}

// Returns true if a node should *not* be altered in any way
const forbiddenTagNames = ['textarea', 'input', 'script', 'noscript', 'template', 'style'];
function isForbiddenNode(node) {
    if (node.isContentEditable) {
        return true;
    } else if (node.parentNode && node.parentNode.isContentEditable) {
        return true;
    } else {
        return forbiddenTagNames.includes(node.tagName.toLowerCase());
    }
}

// The callback used for the document body and head observers
function replaceNodes(mutations) {
    let i, node;

    mutations.forEach(function(mutation) {
        for (i = 0; i < mutation.addedNodes.length; i++) {
            node = mutation.addedNodes[i];
            if (isForbiddenNode(node)) {
                // Should never operate on user-editable content
                continue;
            } else if (node.nodeType === 3) {
                // Replace the text for text nodes
                handleText(node);
            } else {
                // Otherwise, find text nodes within the given node and replace text
                walk(node);
            }
        }
    });
}

// Walk the doc (document) body, replace the title, and observe the body and head
function walkAndObserve(doc) {
    let docHead = doc.getElementsByTagName('head')[0],
    observerConfig = {
        characterData: true,
        childList: true,
        subtree: true
    },
    bodyObserver, headObserver;

    // Do the initial text replacements in the document body and title
    walk(doc.body);
    doc.title = replaceText(doc.title);

    // Observe the body so that we replace text in any added/modified nodes
    bodyObserver = new MutationObserver(observerCallback);
    bodyObserver.observe(doc.body, observerConfig);

    // Observe the title so we can handle any modifications there
    if (docHead) {
        headObserver = new MutationObserver(observerCallback);
        headObserver.observe(docHead, observerConfig);
    }
}

// Runtime
// only if the lanuage is supported
if (supportedLangs.includes(htmlLang) === true) {
    browser.i18n.getAcceptLanguages().then((languages) => {
        let firstLang = languages.length > 0 ? languages[0] : '';

        if (htmlLang.startsWith('de')) {
            useLang = 'de';
        } else if (htmlLang.startsWith('fr')) {
            useLang = 'fr';
        } else if (htmlLang.startsWith('en')) {
            useLang = 'en';
        } else if (firstLang.startsWith('de')) {
            useLang = 'de';
        } else if (firstLang.startsWith('fr')) {
            useLang = 'fr';
        }

        walkAndObserve(document);
    });
}
