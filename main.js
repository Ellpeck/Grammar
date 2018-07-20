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

            console.log(e);
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

    $('#cyk-form').on('submit', function(e) {
        e.preventDefault();

        let grammar = getSelectedGrammar();
        if (grammar !== null) {
            let raw = $('#cyk-input').val();
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
                html += '<td class="terminal-cell">' + formatSymbol(tokens[i], false) + '</td>';
                for (let j = i; j < N.length; j++) {
                    html += '<td class="value-cell">';
                    if (j >= i) {
                        if (N[i][j].size === 0) {
                            html += '<span class="emptyset">&empty;</span>';
                        } else {
                            html += '{' + Array.from(N[i][j]).map(x => formatSymbol(x, true)).join(', ') + '}';
                        }
                    }
                    html += '</td>';
                }
                html += '</tr>';
            }
            $('#cyk-table').html(html);

            $('#cyk-before').html('CYK Output of <span class="word">' + raw + '</span> for grammar ' + grammar.name + ':');
            if (N[0][tokens.length - 1].has(grammar.start)) {
                $('#cyk-after').html('As the parsed word is derivable by the start symbol ' + formatSymbol(grammar.start, true) + ', the word <span class="word">' + raw + '</span> is part of the language.');
            } else {
                $('#cyk-after').html('As the parsed word is <em>not</em> derivable by the start symbol ' + formatSymbol(grammar.start, true) + ', the word <span class="word">' + raw + '</span> is <em>not</em> part of the language.');
            }
        }
    });
});

function addGrammar(grammar) {
    let list = $('#grammars');

    let i = getNextFreeId();
    grammars[i] = grammar;
    let classes = grammar.classify();
    let chomsky = grammar.isChomsky();

    let html = '<div class="list-group-item list-group-item-action" data-toggle="list" id=grammar-' + i + '>';

    html += '<div id="grammar-header-' + i + '">';
    html += '<div class="row">';

    html += '<div class="col-md-1">'
    html += grammar.name;
    html += '</div>';

    html += '<div class="col-md-8 cut-text">'
    html += grammar.prodsToString(true);
    html += '</div>';

    html += '<div class="col-md-3">';
    if (classes.length > 0) {
        html += classes.map(x => fancyClassName(x, true)).join(', ');
    }
    html += '</div>';

    html += '</div>';
    html += '</div>';

    html += '<div class="grammar-content" id="grammar-content-' + i + '">';
    html += '<div class="row align-items-center">'

    html += '<div class="col-md-11">'
    html += grammar.toString();

    html += '<br><strong>Properties</strong><br>';
    if (classes.length > 0) {
        html += '<em>' + classes.map(x => fancyClassName(x, false)).join('<br>') + '</em>'
    } else {
        html += '<em>No normal forms</em>';
    }

    html += '<br>';

    if (!chomsky) {
        html += '<button type="button" class="btn btn-sm btn-default" id="generate-chomsky-' + i + '">Convert to Chomsky Normal Form</button> ';
    }
    if (grammar.containsEpsilons()) {
        html += '<button type="button" class="btn btn-sm btn-default" id="eliminate-epsilons-' + i + '">Eliminate Epsilons</button> ';
    }

    html += '</div>';

    html += '<div class="col-md-1">'
    html += '<button type="button" class="btn float-right grammar-action" id="grammar-copy-' + i + '">^</button>';
    html += '<button type="button" class="btn float-right grammar-action" id="grammar-remove-' + i + '">X</button>';
    html += '</div>';

    html += '</div>';
    html += '</div>';
    html += '</div>';

    list.append(html);

    let cyk = $('#cyk');
    let cykInfo = $('#cyk-info');
    let tab = $('#grammar-' + i);

    tab.on('shown.bs.tab', function(event) {
        let prev = event.relatedTarget;
        if (prev !== undefined) {
            let oldId = prev.id.replace('grammar-', '');
            $('#grammar-header-' + oldId).show();
            $('#grammar-content-' + oldId).hide();
        }

        $('#grammar-header-' + i).hide();
        $('#grammar-content-' + i).show();

        if (chomsky) {
            cyk.show();
            cykInfo.hide();
        }
    });
    tab.on('hidden.bs.tab', function() {
        cyk.hide();
        cykInfo.show();
    });
    tab.tab('show');

    $('#grammar-remove-' + i).on('click', function() {
        removeGrammar(i);

        cyk.hide();
        cykInfo.show();

        return false;
    });

    $('#grammar-copy-' + i).on('click', function() {
        let text = '';
        for (prod of grammar.productions) {
            text += prod.left + ' \u2192 ' + prod.right.join(' ') + '\n';
        }
        $('#grammar-input').val(text);

        let box = $('#grammar-mode');
        box.prop('checked', grammar.longNonterminals);
        box.trigger('change');
    });

    $('#generate-chomsky-' + i).on('click', function() {
        addGrammar(grammar.toChomsky());
        return false;
    });
    $('#eliminate-epsilons-' + i).on('click', function() {
        addGrammar(grammar.eliminateEpsilons());
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
