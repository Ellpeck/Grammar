$(function() {
    $('#grammar-form').on('submit', function(e) {
        e.preventDefault();

        let field = $('#grammar-input');
        let display = $('#grammar-display');
        let alert = $('#grammar-alert');

        try {
            let grammar = parseGrammar(field.val());

            alert.hide();
            alert.html('');

            display.html(grammar.toString());
            display.show();
        } catch (e) {
            alert.html(e);
            alert.show();

            display.hide();
            display.html('');
        }
    });
});