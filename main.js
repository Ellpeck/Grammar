$(function() {
    $('#grammar-form').on('submit', function(e) {
        e.preventDefault();

        let field = $('#grammar-input');
        let text = field.val();

        let grammar = parseGrammar(text);
        console.log(grammar);
    });
});