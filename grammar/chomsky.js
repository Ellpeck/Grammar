function generateChomsky(grammar) {
    // eliminate epsilons
    grammar = eliminateEpsilons(grammar);
    grammar = bloatTerminals(grammar);

    // @todo not done yet!
    return grammar;
}

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
