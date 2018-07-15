function cyk(grammar, word) {
    if (!grammar.isChomsky()) {
        throw 'Grammar must be in Chomsky normal form';
    }

    let N = new Array();
    for (let i = 0; i < word.length; i++) {
        N[i] = new Array();
        for (let j = i; j < word.length; j++) {
            N[i][j] = new Set();
        }
    }

    for (let jMax = 0; jMax < word.length; jMax++) {
        for (let i = 0; i < word.length - jMax; i++) {
            let j = i + jMax;
            if (i == j) {
                parseTerminal(grammar, N[i][j], word[i]);
            } else {
                for (let k = i; k < j; k++) {
                    parseNonterminal(grammar, N[i][j], N[i][k], N[k + 1][j])
                }
            }
        }
    }

    return N;
}

function parseTerminal(grammar, result, symbol) {
    for (let prod of grammar.productions) {
        if (prod.right.length === 1 && prod.right[0] === symbol) {
            result.add(prod.left);
        }
    }
    return result;
}

function parseNonterminal(grammar, result, leftSymbols, rightSymbols) {
    for (let left of leftSymbols) {
        for (let right of rightSymbols) {
            for (let prod of grammar.productions) {
                if (prod.right.length === 2 && prod.right[0] === left && prod.right[1] === right) {
                    result.add(prod.left);
                }
            }
        }
    }
}
