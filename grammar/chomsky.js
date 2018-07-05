function generateChomsky(grammar) {
    // eliminate epsilons
    grammar = eliminateEpsilons(grammar);

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
