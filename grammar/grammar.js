class Grammar {
    constructor(productions, nonterminals, terminals, start) {
        this.productions = productions;
        this.nonterminals = nonterminals;
        this.terminals = terminals;
        this.start = start;
    }

    // creates a deep copy
    clone() {
        let productions = this.productions.map(prod => prod.clone());
        let nonterminals = this.nonterminals.slice(0);
        let terminals = this.terminals.slice(0);
        return new Grammar(productions, nonterminals, terminals, this.start);
    }

    toString() {
        let text = '';
        text += 'G = (N, T, P, S) <em>where</em><br>';
        text += 'N = {' + this.nonterminals.join(', ') + '}<br>';
        text += 'T = {' + this.terminals.join(', ') + '}<br>';

        text += 'P = {';
        for (let i = 0; i < this.productions.length; i++) {
            let prod = this.productions[i];

            let right = prod.right.length <= 0 ? '&epsilon;' : prod.right.join(' ');
            text += prod.left + ' &rarr; ' + right;

            if (i < this.productions.length - 1) {
                text += ', ';
            }
        }
        text += '}<br>';

        text += 'S = ' + this.start + '';
        return text;
    }
}

function parseGrammar(text, longNames) {
    let grammar = new Grammar(new Array(), new Array(), new Array(), undefined);

    let lines = text.split('\n');
    parseNonterminals(grammar, lines, longNames);
    parseProductions(grammar, lines, longNames);

    return grammar;
}

function parseProductions(grammar, lines, longNames) {
    for (line of lines) {
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

function makeParts(line) {
    let parts = line.split('->');
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