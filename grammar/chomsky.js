function generateChomsky(grammar) {
    let out = '<ol>';
    grammar = eliminateEpsilonRules(grammar);
    out += '<li><h3>Eliminate &epsilon;-rules</h3>' + grammar.explanation + '</li>';
    grammar = bloatTerminals(grammar);
    out += '<li><h3>Replace terminals with nonterminals</h3>' + grammar.explanation + '</li>';
    grammar = eliminateDirectRules(grammar);
    out += '<li><h3>Eliminate direct rules</h3>' + grammar.explanation + '</li>';
    grammar = eliminateLongRules(grammar);
    out += '<li><h3>Eliminate long rules</h3>' + grammar.explanation + '</li>';
    out += '</ol>';
    grammar.explanation = out;
    return grammar;
}

// remove all epsilon rules
function eliminateEpsilonRules(grammar) {
    let out = '<p class="intro">We eliminate all rules of the form ' + formatProduction(new Production('A', [])) + '.</p>';

    let newGrammar = grammar.clone();
    let prods = newGrammar.productions;

    do {
        changed = false;
        for (epsilonProd of prods.clone()) {
            if (epsilonProd.isEpsilon()) {
                let toEliminate = epsilonProd.left;

                let newProds = new Array(); // @out

                for (prod of prods) {
                    let tryOptions = function(right, i) {
                        if (i >= right.length) {
                            // add new production if it does not exist!
                            let found = prods.find(p => (p.left === prod.left && arrayEquals(p.right, right)))
                                  || newProds.find(p => (p.left === prod.left && arrayEquals(p.right, right)));
                            if (found === undefined) {
                                let newProd = new Production(prod.left, right);
                                prods.push(newProd);
                                changed = true;

                                newProds.push(newProd); // @out
                            }
                        } else {
                            tryOptions(right, i + 1);
                            if (right[i] === toEliminate) {
                                let eliminatedRight = right.clone();
                                eliminatedRight.splice(i, 1);
                                tryOptions(eliminatedRight, i);
                            }
                        }
                    };
                    tryOptions(prod.right, 0);
                }

                if (newProds.length > 0) {
                    out += '<p><strong>For the rule ' + formatProduction(epsilonProd, grammar);
                    out += '</strong>, we add the ' + pluralize('rule', newProds.length) + ' ';
                    out += formatProductionArray(newProds, grammar) + '.</p>';
                }
            }
        }
    } while (changed);

    out += '<p>After no new rules can be added, we remove all &epsilon;-rules, that is ';
    out += formatProductionArray(prods.filter(prod => prod.isEpsilon()));
    out += ', from our grammar.</p>';

    // actually remove the epsilon productions
    newGrammar.productions = prods.filter(prod => !prod.isEpsilon());

    newGrammar.explanation = out;
    return newGrammar;
}

// converts all terminals into CNF nonterminals
function bloatTerminals(grammar) {
    let out = '<p class="intro">For every terminal ' + formatTerminal('x') + ' in our grammar, add a new nonterminal ' + formatNonterminal('T_x') + '. '
            + 'Then iterate through all rules and replace ' + formatTerminal('x') + ' with ' + formatNonterminal('T_x') + '. '
            + 'Finally, add the production ' + formatProduction(new Production('T_x', ['x'])) + '.</p>';

    let newGrammar = grammar.clone();

    for (terminal of newGrammar.terminals) {
        let nonterminal = 'T_' + terminal;
        while (newGrammar.nonterminals.includes(nonterminal)) {
            nonterminal += '\'';
        }

        for (prod of newGrammar.productions) {
            prod.right = prod.right.map(symbol => (symbol === terminal) ? nonterminal : symbol);
        }
        newGrammar.productions.push(new Production(nonterminal, [terminal]));
        newGrammar.nonterminals.push(nonterminal);
        newGrammar.longNonterminals = true;
    }

    out += '<p>This results in the following grammar:</p>';
    out += newGrammar.toString(true);
    newGrammar.explanation = out;
    return newGrammar;
}

// eliminates all rules of the form A -> B where A, B are nonterminals
function eliminateDirectRules(grammar) {
    let out = '<p class="intro">We want to eliminate all direct rules of the form ' + formatProduction(new Production('A', ['B'])) + ' where ' + formatNonterminal('A') + ', ' + formatNonterminal('B') + ' are nonterminals. '
            + 'This is done by constructing a reachability graph for each nonterminal symbol. We then start with an empty rule set and add a new rule for every leaf that is reachable from a nonterminal on this graph.</p>';

    let newProds = new Array();

    for (nonterminal of grammar.nonterminals) {
        let reachableStrings = new Array(); // @out
        let reachableProds = new Array(); // @out

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
                    let newProd = new Production(nonterminal, prod.right);
                    newProds.push(newProd);

                    reachableStrings.push(prod.right); // @out
                    reachableProds.push(newProd); // @out
                }
            }
        }

        if (reachableStrings.length === 0) {
            out += '<p>For the nonterminal ' + formatSymbol(nonterminal, true) + ', there are no reachable nodes. Therefore we add no new rules.</p>';
        } else {
            out += '<p>For the nonterminal ' + formatSymbol(nonterminal, true) + ', we can reach the ' + pluralize('leave', reachableStrings.length) + ' ';
            out += formatArray(reachableStrings, str => formatSymbolArray(str, grammar), ', ', ' and ');
            out += '; therefore we add the ' + pluralize('rule', reachableProds.length) + ' ';
            out += formatProductionArray(reachableProds);
            out += ' to our grammar.</p>';
        }
    }

    return new Grammar(newProds, grammar.nonterminals.clone(), grammar.terminals.clone(), grammar.start, grammar.longNonterminals, grammar.longTerminals, out);
}

// split all rules with more than two right side symbols into chain of two symbols
function eliminateLongRules(grammar) {
    let out = '<p class="intro">We replace all rules of the form A &rarr; B<sub>0</sub>B<sub>1</sub>...B<sub>n</sub>, n > 2, '
            +'with separate rules A &rarr; B<sub>0</sub>A<sub>0</sub>, A<sub>0</sub> &rarr; B<sub>1</sub>A<sub>1</sub>, ..., A<sub>n-1</sub> &rarr; B<sub>n-1</sub>B<sub>n</sub>.</p>';
    out += '<p>The following rules are too long and must be replaced:</p>';

    let newProds = new Array();
    let newNonterminals = grammar.nonterminals.clone();
    for (prod of grammar.productions) {
        if (prod.right.length > 2) {
            let newProdsForThisProd = new Array(); // @out
            let newNonterminalsForThisProd = new Array(); // @out

            let left = prod.left;
            let right = prod.right;
            let lastSymbol = prod.left;
            for (let i = 0; i < right.length - 1; i++) {
                let beforeSymbol = lastSymbol;
                if (i == right.length - 2) {
                    lastSymbol = right[right.length - 1];
                } else {
                    // create new nonterminal
                    lastSymbol = left + '_' + i;
                    while (newNonterminals.includes(lastSymbol)) {
                        lastSymbol += '\'';
                    }
                    newNonterminals.push(lastSymbol);
                    newNonterminalsForThisProd.push(lastSymbol);
                }
                let newProd = new Production(beforeSymbol, [right[i], lastSymbol]);
                newProds.push(newProd);
                newProdsForThisProd.push(newProd); // @out
            }

            out += '<p><strong>Eliminate ' + formatProduction(prod, grammar) + '</strong> by adding the ';
            out += pluralize('rule', newProdsForThisProd.length) + ' ' + formatProductionArray(newProdsForThisProd);
            out += ' and new ' + pluralize('nonterminal', newNonterminalsForThisProd.length) + ' ' + formatNonterminalArray(newNonterminalsForThisProd) + '.</p>';
        } else {
            newProds.push(prod.clone());
        }
    }

    return new Grammar(newProds, newNonterminals, grammar.terminals.clone(), grammar.start, true, grammar.longTerminals, out);
}

// determines whether the language generated by a given grammar can derive
// the epsilon word
function includesEpsilonWord(grammar) {
    let epsilonNonterminals = new Set();

    let changed;
    do {
        changed = false;
        prodLoop:
        for (let prod of grammar.productions) {
            if (epsilonNonterminals.has(prod.left)) {
                continue prodLoop;
            }
            for (let symbol of prod.right) {
                if (grammar.isTerminal(symbol) || !epsilonNonterminals.has(symbol)) {
                    continue prodLoop;
                }
            }
            // rule fully epsilonizable
            epsilonNonterminals.add(prod.left);
            changed = true;
        }
    } while (changed && !epsilonNonterminals.has(grammar.start));

    return epsilonNonterminals.has(grammar.start);
}
