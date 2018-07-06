const grammars = new Array();

$(function() {
    let field = $('#grammar-input');
    let alert = $('#grammar-alert');
    let box = $('#grammar-mode');
    let info = $('#grammar-mode-info');

    $('#grammar-form').on('submit', function(e) {
        e.preventDefault();

        try {
            let grammar = parseGrammar(field.val(), box.is(':checked'));
            addGrammar(grammar);

            alert.hide();
            alert.html('');
        } catch (e) {
            alert.html(e);
            alert.show();
        }
    });

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

function addGrammar(grammar) {
    grammars.push(grammar);
    updateGrammarData();
}

function getSelectedGrammarId() {
    for (let i = 0; i < grammars.length; i++) {
        if ($('#grammar-' + i).hasClass('active')) {
            return i;
        }
    }
    return -1;
}

function updateGrammarData() {
    let display = $('#grammars');
    display.html('');
    for (let i = grammars.length - 1; i >= 0; i--) {
        let html = '<div class="list-group-item list-group-item-action" data-toggle="list" id=grammar-' + i + '>';
        html += '<div class="row align-items-center">'

        html += '<div class="col-md-11">'
        html += grammars[i].toString();
        html += '</div>';

        html += '<div class="col-md-1">'
        html += '<button type="button" class="btn grammar-remove" id="grammar-remove-' + i + '">X</button>'
        html += '</div>';

        html += '</div>';
        html += '</div>';

        display.append(html);
    }

    $('.grammar-remove').on('click', function() {
        let i = this.id.replace('grammar-remove-', '');
        grammars.splice(i, 1);
        updateGrammarData();
        return false;
    });
}