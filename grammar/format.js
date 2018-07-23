
function formatSymbol(x, isNonterm) {
    let result;
    // allow second argument to be grammar
    if (isNonterm instanceof Grammar) {
        isNonterm = isNonterm.isNonterminal(x);
    }
    // if isNonterm is undefined, handle as false.

    // subscript text after underscore
    if (x.length >= 3) {
        let subs = '';

        let split = x.split('_');
        result = split[0];
        for (let i = 1; i < split.length; i++) {
            result += '<sub>' + split[i];
            subs += '</sub>';
        }
        result += subs;
    } else {
        result = x;
    }

    let classes = isNonterm ? 'nonterm' : 'term';
    return '<span class="' + classes + '">' + result + '</span>';
}

function formatTerminal(symbol) {
    return formatSymbol(symbol, false);
}

function formatNonterminal(symbol) {
    return formatSymbol(symbol, true);
}

function formatProduction(prod, grammar) {
    return formatSymbol(prod.left, true) + ' &rarr; ' + formatSymbolString(prod.right, grammar);
}

function formatSymbolString(string, grammar) {
    if (string.length === 0) {
        return '&epsilon;';
    } else {
        return string.map(symbol => formatSymbol(symbol, grammar)).join(' ');
    }
}
