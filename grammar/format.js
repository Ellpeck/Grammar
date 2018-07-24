
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
    return '<span class="prod">' + formatSymbol(prod.left, true) + '&nbsp;&rarr;&nbsp;' + formatSymbolString(prod.right, grammar) + '</span>';
}

function formatSymbolString(string, grammar) {
    if (string.length === 0) {
        return '&epsilon;';
    } else {
        return string.map(symbol => formatSymbol(symbol, grammar)).join('&nbsp;');
    }
}

function formatGrammar(grammar, inline) {
    let classes = inline ? ' grammar-inline' : ' grammar-box';
    let text = '<div class="grammar' + classes + '">';
    text += grammar.name + ' = (N, T, P, ' + formatSymbol(grammar.start, true) + ') <span class="text">where</span><br>';
    text += 'N = {' + grammar.nonterminals.map(x => formatSymbol(x, true)).join(', ') + '}<br>';
    text += 'T = {' + grammar.terminals.map(x => formatSymbol(x, false)).join(', ') + '}<br>';

    text += prodsToString(grammar, inline);
    text += '</div>';

    return text;
}

function prodsToString(grammar, inline) {
    let text = 'P = {' + (inline ? '' : '<br>') + '<span class="math ' + (inline ? 'prod-display-inline' : 'prod-display') + '">';
    for (let i = 0; i < grammar.productions.length; i++) {
        let prod = grammar.productions[i];
        text += formatProduction(prod, this);
        if (i < grammar.productions.length - 1) {
            text += ', ';
        }

        if (!inline) {
            text += '<br>';
        }
    }
    text += '</span>}';

    return text;
}


function pluralize(word, amount, plural) {
    if (amount === 1) {
        return word;
    } else {
        if (plural !== undefined) {
            return plural;
        } else {
            return word + 's';
        }
    }
}

function formatArray(array, formatter, separator, lastSeparator) {
    if (formatter === undefined) {
        formatter = (x => String(x));
    }
    if (separator === undefined) {
        separator = ', ';
    }
    if (lastSeparator === undefined) {
        lastSeparator = separator;
    }

    if (array.length > 1) {
        let formatted = array.map(formatter);
        return formatted.slice(0, -1).join(separator) + lastSeparator + formatted.slice(-1);
    } else if (array.length === 1) {
        return formatter.call(undefined, array[0]);
    } else { // array.length === 0
        return '';
    }
}

function formatProductionArray(productions, grammar) {
    return formatArray(productions, prod => formatProduction(prod, grammar), ', ', ' and ');
}

function formatSymbolArray(symbols, grammar) {
    return formatArray(symbols, symbol => formatSymbol(symbol, grammar), ', ', ' and ');
}
function formatNonterminalArray(symbols) {
    return formatArray(symbols, symbol => formatSymbol(symbol, true), ', ', ' and ');
}
function formatTerminalArray(symbols, grammar) {
    return formatArray(symbols, symbol => formatSymbol(symbol, false), ', ', ' and ');
}
