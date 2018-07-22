let counter = 1;

class Grammar {
    constructor(productions, nonterminals, terminals, start, longNonterminals, longTerminals, explanation) {
        this.productions = productions;
        this.nonterminals = nonterminals;
        this.terminals = terminals;
        this.start = start;

        this.longNonterminals = longNonterminals;
        this.longTerminals = longTerminals;
        this.name = '<strong>G<sub>' + counter++ + '</sub></strong>';
        this.explanation = explanation;
    }

    // finds all productions that derive a given non-terminal
    getProductionsFor(left) {
        return this.productions.filter(prod => prod.left === left);
    }

    // checks whether a symbol is a non-terminal
    isNonterminal(symbol) {
        return this.nonterminals.includes(symbol);
    }

    // checks whether a symbol is a terminal
    isTerminal(symbol) {
        return this.terminals.includes(symbol);
    }

    // determines the class of this grammar
    // lazy evaluated on first call
    classify() {
        if (this.class !== undefined) {
            return this.class;
        }
        this.class = classify(this);
        return this.class;
    }

    // whether this grammar contains epsilon rules
    containsEpsilonRules() {
        return this.productions.find(p => p.isEpsilon()) !== undefined;
    }

    // whether this grammar contains rules mapping one nonterminal to exactly one
    // other nonterminal
    containsDirectRules() {
        return this.productions.find(p => p.right.length == 1 && this.isNonterminal(p.right[0])) !== undefined;
    }

    // whether this grammar contains rules with length longer than two
    containsLongRules() {
        return this.productions.find(p => p.right.length > 2) !== undefined;
    }

    // generates an equivalent grammar (except for the epsilon-word)
    // without epsilon rules
    eliminateEpsilonRules() {
        return eliminateEpsilonRules(this);
    }

    // generates an equivalent grammar without direct rules
    eliminateDirectRules() {
        return eliminateDirectRules(this);
    }

    // generates an equivalent grammar by replacing all long rules with multiple
    // rules of length 2
    eliminateLongRules() {
        return eliminateLongRules(this);
    }

    // checks whether this grammar is in Chomsky Normal Form
    isChomsky() {
        return this.classify().includes(CLASS_CHOMSKY);
    }

    // generates an equivalent grammar (except for the epsilon-word)
    // in Chomsky Normal Form (or this grammar if it already is in CNF)
    toChomsky() {
        if (this.isChomsky()) {
            return this;
        } else {
            return generateChomsky(this);
        }
    }

    // takes a given input string and turns it into an array of non-terminals
    tokenize(raw) {
        if (this.longTerminals) {
            return raw.split(/ +/);
        } else {
            return raw.split('');
        }
    }

    // checks whether the epsilon word is derivable using this grammar
    includesEpsilonWord() {
        return includesEpsilonWord(this);
    }

    // tokenizes a given string and checks whether the language created by
    // this grammar includes it
    includesString(raw) {
        return this.includesWord(this.tokenize(raw));
    }

    // checks whether the language generated by this grammar includes a given
    // word (that is an array of non-terminals)
    includesWord(symbols) {
        if (symbols.length === 0) { // epsilon word
            return this.includesEpsilonWord();
        } else {
            let N = cyk(this.toChomsky(), symbols);
            return N[0][symbols.length - 1].has(this.start);
        }
    }

    // creates a deep copy, without name + explanation
    clone() {
        let productions = this.productions.map(prod => prod.clone());
        let nonterminals = this.nonterminals.clone();
        let terminals = this.terminals.clone();
        return new Grammar(productions, nonterminals, terminals, this.start, this.longNonterminals, this.longTerminals, undefined);
    }

    toString() {
        let text = '';
        text += this.name + ' = (N, T, P, ' + formatSymbol(this.start, true) + ') <em>where</em><br>';
        text += 'N = {' + this.nonterminals.map(x => formatSymbol(x, true)).join(', ') + '}<br>';
        text += 'T = {' + this.terminals.map(x => formatSymbol(x, false)).join(', ') + '}<br>';

        text += this.prodsToString(false);
        text += '<br>';

        return text;
    }

    prodsToString(inline) {
        let text = 'P = {' + (inline ? '' : '<br>') + '<span' + (inline ? '' : ' class="prod-display"') + '>';
        for (let i = 0; i < this.productions.length; i++) {
            let prod = this.productions[i];
            text += formatProduction(prod, this);
            if (i < this.productions.length - 1) {
                text += ', ';
            }

            if (!inline) {
                text += '<br>';
            }
        }
        text += '</span>}';

        return text;
    }
}

function formatSymbol(x, isNonterm) {
    let result;

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

function formatProduction(prod, grammar) {
    let right;
    if (prod.right.length === 0) {
        right = '&epsilon;';
    } else {
        right = prod.right.map(x => formatSymbol(x, grammar.isNonterminal(x))).join(' ');
    }
    return formatSymbol(prod.left, true) + ' &rarr; ' + right;
}

function parseGrammar(text, longNames) {
    let grammar = new Grammar(new Array(), new Array(), new Array(), undefined, longNames, longNames);

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
                    let part = split[i].trim();
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
    if (part.length > 0 && part !== ' ') {
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
    let hasStart = false;

    for (line of lines) {
        if (line.length > 0) {
            let parts = makeParts(line);
            let left = makeLeft(parts, longNames);

            if (grammar.start === undefined) {
                grammar.start = left;
                hasStart = true;
            }

            if (!grammar.nonterminals.includes(left)) {
                grammar.nonterminals.push(left);
            }
        }
    }

    if (!hasStart) {
        throw 'No start symbol found, input at least one production';
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
