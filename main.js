$(function() {
    $('#grammar-form').on('submit', function(e) {
        e.preventDefault();

        let field = $('#grammar-input');
        let display = $('#grammar-display');

        let grammar = parseGrammar(field.val());
        display.html(grammar.toString());
    });
});