function generateChomsky(grammar) {
    grammar = eliminateEpsilons(grammar);
    grammar = bloatTerminals(grammar);
    grammar = eliminateDirectRules(grammar);
    grammar = reduceRuleLength(grammar);
    return grammar;
}

// remove all epsilon rules
function eliminateEpsilons(grammar) {
    let newGrammar = grammar.clone();
    let prods = newGrammar.productions;

    let changed;
    do {
        changed = false;
        for (epsilonProd of prods) {
            if (epsilonProd.isEpsilon()) {
                var left = epsilonProd.left;
                for (prod of prods) {
                    let newRight = prod.right.filter(symbol => symbol !== left);
                    if (newRight.length !== prod.right.length) {
                        prod.right = newRight;
                        changed = true;
                    }
                }
            }
        }
    } while (changed);

    // actually remove the epsilon productions
    newGrammar.productions = prods.filter(prod => !prod.isEpsilon());
    return newGrammar;
}

// converts all terminals into CNF nonterminals
function bloatTerminals(grammar) {
    let newGrammar = grammar.clone();

    for (terminal of newGrammar.terminals) {
        let nonterminal = 'T<sub>' + terminal + '</sub>';
        while (newGrammar.nonterminals.includes(nonterminal)) {
            nonterminal += '\'';
        }

        for (prod of newGrammar.productions) {
            prod.right = prod.right.map(symbol => (symbol === terminal) ? nonterminal : symbol);
        }
        newGrammar.productions.push(new Production(nonterminal, [terminal]));
        newGrammar.nonterminals.push(nonterminal);
    }

    return newGrammar;
}

// eliminates all rules of the form A -> B where A, B are nonterminals
function eliminateDirectRules(grammar) {
    let newProds = new Array();

    for (nonterminal of grammar.nonterminals) {
        // implement DFS
        let seen = new Set();
        let toVisit = new Set();
        toVisit.add(nonterminal);

        while (toVisit.size > 0) {
            let left = toVisit.values().next().value;
            toVisit.delete(left);
            seen.add(left);
            for (prod of grammar.getProductionsFor(left)) {
                if (prod.right.length === 1 && grammar.isNonterminal(prod.right[0])) {
                    let right = prod.right[0];
                    if (!seen.has(right)) {
                        toVisit.add(right);
                    }
                } else {
                    newProds.push(new Production(nonterminal, prod.right));
                }
            }
        }
    }

    return new Grammar(newProds, grammar.nonterminals.clone(), grammar.terminals.clone(), grammar.start);
}

// split all rules with more than two right side symbols into chain of two symbols
function reduceRuleLength(grammar) {
    let newProds = new Array();
    let newNonterminals = grammar.nonterminals.clone();
    for (prod of grammar.productions) {
        if (prod.right.length > 2) {
            let left = prod.left;
            let right = prod.right;
            let lastSymbol = prod.left;
            for (let i = 0; i < right.length - 1; i++) {
                let beforeSymbol = lastSymbol;
                if (i == right.length - 2) {
                    lastSymbol = right[right.length - 1];
                } else {
                    // create new nonterminal
                    lastSymbol = left + '<sub>' + i + '</sub>';
                    while (newNonterminals.includes(lastSymbol)) {
                        lastSymbol += '\'';
                    }
                    newNonterminals.push(lastSymbol);
                }
                newProds.push(new Production(beforeSymbol, [right[i], lastSymbol]));
            }
        } else {
            newProds.push(prod.clone());
        }
    }

    return new Grammar(newProds, newNonterminals, grammar.terminals.clone(), grammar.start);
}
