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

    box.on('change', function() {
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
            let tokens = grammar.tokenize(raw);
            let N = cyk(grammar, tokens);
            console.log('Parsed with result:');
            console.log(N);

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
    html += grammars[i].toString();

    html += '<br><strong>Properties</strong><br>';
    let classes = grammars[i].classify();
    if (classes.length > 0) {
        html += '<em>' + classes.map(x => fancyClassName(x)).join('<br>') + '</em>'
    } else {
        html += '<em>No normal forms</em>';
    }
    html += '</div>';

    html += '<div class="col-md-1">'
    html += '<button type="button" class="btn float-right grammar-action" id="grammar-copy-' + i + '">^</button>';
    html += '<button type="button" class="btn float-right grammar-action" id="grammar-remove-' + i + '">X</button>';
    html += '</div>';

    html += '</div>';
    html += '</div>';

    list.append(html);
    $('#grammar-' + i).tab('show');

    $('#grammar-remove-' + i).on('click', function() {
        removeGrammar(i);
        return false;
    });

    $('#grammar-copy-' + i).on('click', function() {
        let text = '';
        for (prod of grammars[i].productions) {
            text += prod.left + ' \u2192 ' + prod.right.join(' ') + '\n';
        }
        $('#grammar-input').val(text);

        let box = $('#grammar-mode');
        box.prop('checked', grammars[i].longSymbols);
        box.trigger('change');
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
