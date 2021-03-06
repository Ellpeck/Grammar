class Production {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }

    isEpsilon() {
        return this.right.length === 0;
    }

    containsRight(symbol) {
        return this.right.includes(symbol);
    }

    clone() {
        return new Production(this.left, this.right.clone());
    }

    toString() {
        return formatProduction(this);
    }
}

function productionFromJson(json) {
    return new Production(json['left'], json['right']);
}
