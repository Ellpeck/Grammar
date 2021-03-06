Array.prototype.clone = function() {
    return this.slice(0);
}

function setLocalStorage(key, data) {
    localStorage.setItem(key, data);
}

function getLocalStorage(key) {
    return localStorage.getItem(key);
}

// from https://stackoverflow.com/a/16436975/2766231
function arrayEquals(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}
