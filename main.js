$(function() {
    let field = $('#grammar-input');
    let display = $('#grammar-display');
    let alert = $('#grammar-alert');

    $('#grammar-form').on('submit', function(e) {
        e.preventDefault();

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

    let box = $('#grammar-mode');
    let info = $('#grammar-mode-info');

    box.on('click', function() {
        let checked = box.is(':checked');

        if (checked) {
            info.show();
            field.attr('placeholder', 'P -> a B c | d');
        } else {
            info.hide();
            field.attr('placeholder', 'P -> aBc | d');
        }
    });
});