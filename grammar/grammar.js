class Grammar {
    constructor(productions, nonterminals, terminals, start, longSymbols) {
        this.productions = productions;
        this.nonterminals = nonterminals;
        this.terminals = terminals;
        this.start = start;
        this.longSymbols = longSymbols;
    }

    getProductionsFor(left) {
        return this.productions.filter(prod => prod.left === left);
    }

    isNonterminal(symbol) {
        return this.nonterminals.includes(symbol);
    }

    isTerminal(symbol) {
        return this.terminals.includes(symbol);
    }

    // creates a deep copy
    clone() {
        let productions = this.productions.map(prod => prod.clone());
        let nonterminals = this.nonterminals.slice(0);
        let terminals = this.terminals.slice(0);
        return new Grammar(productions, nonterminals, terminals, this.start, this.longSymbols);
    }

    toString() {
        let text = '';
        text += 'G = (N, T, P, ' + formatSymbol(this.start, true) + ') <em>where</em><br>';
        text += 'N = {' + this.nonterminals.map(x => formatSymbol(x, true)).join(', ') + '}<br>';
        text += 'T = {' + this.terminals.map(x => formatSymbol(x, false)).join(', ') + '}<br>';

        text += 'P = {<br><span class="prod-display">';
        for (let i = 0; i < this.productions.length; i++) {
            let prod = this.productions[i];

            let right = prod.right.length <= 0 ? '&epsilon;' : prod.right.map(x => formatSymbol(x, this.isNonterminal(x))).join(' ');
            text += formatSymbol(prod.left, true) + ' &rarr; ' + right;

            if (i < this.productions.length - 1) {
                text += ', ';
            }

            text += '<br>';
        }
        text += '</span>}<br>';

        return text;
    }
}

function formatSymbol(x, isNonterm) {
    let result;

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

    if (isNonterm) {
        result = '<span class="nonterm">' + result + '</span>';
    }
    return result;
}

function parseGrammar(text, longNames) {
    let grammar = new Grammar(new Array(), new Array(), new Array(), undefined, longNames);

    let lines = text.split('\n');
    parseNonterminals(grammar, lines, longNames);
    parseProductions(grammar, lines, longNames);

    return grammar;
}

function parseProductions(grammar, lines, longNames) {
    for (line of lines) {
        if (line.length > 0) {
            let parts = makeParts(line);
            let left = makeLeft(parts, longNames);
            let right = parts[1].trim();

            let rightArray = new Array();
            if (longNames) {
                let split = right.split(' ');
                for (let i = 0; i < split.length; i++) {
                    let part = split[i];
                    rightArray = addPart(grammar, rightArray, left, part);
                }
            } else {
                for (let i = 0; i < right.length; i++) {
                    let part = right.charAt(i);
                    rightArray = addPart(grammar, rightArray, left, part);
                }
            }

            grammar.productions.push(new Production(left, rightArray));
        }
    }
}

function addPart(grammar, rightArray, left, part) {
    if (part !== ' ') {
        if (part === '|') {
            grammar.productions.push(new Production(left, rightArray));
            rightArray = new Array();
        } else {
            if (!grammar.nonterminals.includes(part) && !grammar.terminals.includes(part)) {
                grammar.terminals.push(part);
            }
            rightArray.push(part);
        }
    }
    return rightArray;
}

function parseNonterminals(grammar, lines, longNames) {
    for (line of lines) {
        if (line.length > 0) {
            let parts = makeParts(line);
            let left = makeLeft(parts, longNames);

            if (grammar.start === undefined) {
                grammar.start = left;
            }

            if (!grammar.nonterminals.includes(left)) {
                grammar.nonterminals.push(left);
            }
        }
    }
}

function makeParts(line) {
    let parts = line.split(/->|\u2192/);
    if (parts.length <= 1) {
        throw 'Line <strong>' + line + '</strong> didn\'t contain an arrow';
    } else if (parts.length > 2) {
        throw 'Line <strong>' + line + '</strong> contained too many arrows';
    }

    return parts;
}

function makeLeft(parts, longNames) {
    let left = parts[0].trim();
    if (longNames ? left.includes(' ') : left.length != 1) {
        throw 'Productions must only have one nonterminal on the left side (line <strong>' + line + '</strong>)';
    }
    return left;
}