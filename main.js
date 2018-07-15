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

    $('#generate-chomsky').on('click', function() {
        let grammar = getSelectedGrammar();
        if (grammar !== null) {
            let chomskyGrammar = generateChomsky(grammar);
            addGrammar(chomskyGrammar);
        }
    });
    $('#parse-word').on('click', function() {
        let grammar = getSelectedGrammar();
        if (grammar !== null) {
            let raw = $('#parse-raw').val();
            let tokenized = raw.split('');
            let N = cyk(grammar, tokenized);
            console.log('Parsed with result:');
            console.log(N);
            let tokens = grammar.longSymbols ? raw.split(' +') : raw.split(''); // TODO! get this from somewhere

            // build table
            let html = '';
            for (let i = 0; i < N.length; i++) {
                html += '<tr>';
                for (let j = 0; j < i; j++) {
                    html += '<td></td>';
                }
                html += '<td class="terminal-cell">' + tokens[i] + '</td>';
                for (let j = i; j < N.length; j++) {
                    html += '<td class="value-cell">';
                    if (j >= i) {
                        html += '{' + Array.from(N[i][j]).join(', ') + '}';
                    }
                    html += '</td>';
                }
                html += '</tr>';
            }
            $('#cyk-table').html(html);
        }
    });
});

function addGrammar(grammar) {
    let list = $('#grammars');

    let i = getNextFreeId();
    grammars[i] = grammar;

    let html = '<div class="list-group-item list-group-item-action" data-toggle="list" id=grammar-' + i + '>';
    html += '<div class="row align-items-center">'

    html += '<div class="col-md-11">'
    html += '<i>' + grammars[i].classify().join(', ') + '</i><br>'
    html += grammars[i].toString();
    html += '</div>';

    html += '<div class="col-md-1">'
    html += '<button type="button" class="btn" id="grammar-remove-' + i + '">X</button>'
    html += '</div>';

    html += '</div>';
    html += '</div>';

    list.append(html);
    $('#grammar-' + i).tab('show');

    $('#grammar-remove-' + i).on('click', function() {
        removeGrammar(i);
        return false;
    });
}

function removeGrammar(i) {
    grammars[i] = null;
    $('#grammar-' + i).remove();
}

function getNextFreeId() {
    for (let i = 0; i < grammars.length; i++) {
        if (grammars[i] === null) {
            return i;
        }
    }
    return grammars.length;
}

function getSelectedGrammar() {
    for (let i = 0; i < grammars.length; i++) {
        if ($('#grammar-' + i).hasClass('active')) {
            return grammars[i];
        }
    }
    return null;
}
