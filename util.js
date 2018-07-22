Array.prototype.clone = function() {
    return this.slice(0);
}

function setCookieData(data, lifespan) {
    let date = new Date();
    date.setTime(date.getTime() + (lifespan * 24 * 60 * 60 * 1000));
    let expires = 'expires=' + date.toUTCString();
    document.cookie = 'data=' + data + ';' + expires + ';path=/';
}

function getCookieData() {
    return document.cookie.substring(5);
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