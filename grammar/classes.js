const CLASS_CHOMSKY = 'chomsky';
const CLASS_GREIBACH = 'greibach';
const CLASS_RIGHT_LINEAR = 'right-linear';
const CLASS_LEFT_LINEAR = 'left-linear';

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
    }
}