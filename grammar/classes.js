const CLASS_CHOMSKY = 'chomsky';
const CLASS_GREIBACH = 'greibach';
const CLASS_RIGHT_LINEAR = 'right-linear';
const CLASS_LEFT_LINEAR = 'left-linear';

// determines the classes of a given grammar
function classify(grammar) {
    let chomsky = true;
    let greibach = true;
    let leftLinear = true;
    let rightLinear = true;
    for (let prod of grammar.productions) {
        if (prod.right.length > 2) {
            chomsky = false;
            leftLinear = false;
            rightLinear = false;
        } else if (prod.right.length == 2) {
            let leftTerminal = grammar.isTerminal(prod.right[0]);
            let rightTerminal = grammar.isTerminal(prod.right[1]);
            chomsky &= !leftTerminal && !rightTerminal;
            leftLinear &= leftTerminal && !rightTerminal;
            rightLinear &= !leftTerminal && rightTerminal;
        } else if (prod.right.length == 1) {
            let terminal = grammar.isTerminal(prod.right[0]);
            chomsky &= terminal;
            leftLinear &= terminal;
            rightLinear &= terminal;
        } else { // prod.right.isEpsilon
            chomsky = false;
            leftLinear = false;
            rightLinear = false;
        }

        greibach &= !prod.isEpsilon() && grammar.isTerminal(prod.right[0]);
        for (let i = 1; i < prod.right.length; i++) {
            greibach &= grammar.isNonterminal(prod.right[i]);
        }
    }

    let classes = new Array();
    if (chomsky) {
        classes.push(CLASS_CHOMSKY);
    }
    if (greibach) {
        classes.push(CLASS_GREIBACH);
    }
    if (leftLinear) {
        classes.push(CLASS_LEFT_LINEAR);
    }
    if (rightLinear) {
        classes.push(CLASS_RIGHT_LINEAR);
    }
    return classes;
}

function fancyClassName(name) {
    switch (name) {
        case CLASS_CHOMSKY:
            return 'Chomsky Normal Form';
        case CLASS_GREIBACH:
            return 'Greibach Normal Form';
        case CLASS_RIGHT_LINEAR:
            return 'Right-Linear';
        case CLASS_LEFT_LINEAR:
            return 'Left-Linear';
        default:
            return name;
    }
}
