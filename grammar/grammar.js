class Grammar {
    constructor(productions, nonterminals, terminals, start) {
        this.productions = productions;
        this.nonterminals = nonterminals;
        this.terminals = terminals;
        this.start = start;
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

    // lazy evaluated on first call
    classify() {
        if (this.class !== undefined) {
            return this.class;
        }
        let chomsky = true;
        let greibach = true;
        let leftLinear = true;
        let rightLinear = true;
        for (let prod of this.productions) {
            if (prod.right.length > 2) {
                chomsky = false;
                leftLinear = false;
                rightLinear = false;
            } else if (prod.right.length == 2) {
                let leftTerminal = this.isTerminal(prod.right[0]);
                let rightTerminal = this.isTerminal(prod.right[1]);
                chomsky &= !leftTerminal && !rightTerminal;
                leftLinear &= leftTerminal && !rightTerminal;
                rightLinear &= !leftTerminal && rightTerminal;
            } else if (prod.right.length == 1) {
                let terminal = this.isTerminal(prod.right[0]);
                chomsky &= terminal;
                leftLinear &= terminal;
                rightLinear &= terminal;
            } else { // prod.right.isEpsilon
                chomsky = false;
                leftLinear = false;
                rightLinear = false;
            }

            greibach &= !prod.isEpsilon() && this.isTerminal(prod.right[0]);
            for (let i = 1; i < prod.right.length; i++) {
                greibach &= this.isNonterminal(prod.right[i]);
            }
        }

        this.class = new Array();
        if (chomsky) {
            this.class.push(CLASS_CHOMSKY);
        }
        if (greibach) {
            this.class.push(CLASS_GREIBACH);
        }
        if (leftLinear) {
            this.class.push(CLASS_LEFT_LINEAR);
        }
        if (rightLinear) {
            this.class.push(CLASS_RIGHT_LINEAR);
        }
        return this.class;
    }

    // creates a deep copy
    clone() {
        let productions = this.productions.map(prod => prod.clone());
        let nonterminals = this.nonterminals.clone();
        let terminals = this.terminals.clone();
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
