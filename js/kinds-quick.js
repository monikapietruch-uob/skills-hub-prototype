/*
  js/kinds-quick.js — the five task kinds with exact answers.

    choice     pick one answer for each question (find the bug, which is closest…)
    match      match the left column with the right column
    gap        type or click the missing word
    order      put the lines in order with Move up and Move down
    proofread  click the mistake, then type the correction

  Every kind is one function with the same three arguments:

    Hub.KINDS.name = function (task, mount, api) { … }

    task   the task object from a file in data/
    mount  the empty <div> on the page where the task is drawn
    api    api.done() is called once, when the student has finished

  Hub.ui holds the small pieces several kinds share (a feedback box, a
  quotation, a fold-away reading text).
*/
(function () {
  'use strict';

  var Hub = window.Hub;
  var el = Hub.el;
  var ui = Hub.ui = Hub.ui || {};

  /* ---------------- shared pieces ---------------- */

  // A feedback box. kind: 'pass' (green), 'notyet' (grey box, red border), 'info'.
  // The label is always in words, never colour alone.
  ui.feedback = function (kind, text) {
    var labels = { pass: 'Pass', notyet: 'Not yet', info: 'Note' };
    return el('div', { class: 'fb fb-' + kind },
      el('p', { class: 'fb-label' }, labels[kind]),
      el('p', { class: 'fb-text' }, text));
  };

  // A quotation with a caption: the source text, Karel's attempt, a model answer.
  ui.quote = function (label, text, extraClass) {
    return el('figure', { class: 'quote' + (extraClass ? ' ' + extraClass : '') },
      el('figcaption', null, label),
      el('blockquote', null, text));
  };

  // A reading text that folds away: <details> needs no JavaScript to open and close.
  ui.passage = function (passage) {
    return el('details', { class: 'passage', open: passage.open ? true : null },
      el('summary', null, passage.title),
      el('div', { class: 'passage-text' },
        passage.paragraphs.map(function (paragraph) { return el('p', null, paragraph); })));
  };

  // 'In conclusion, ' -> 'in conclusion'   (so that capitals, spaces and a final comma do not matter)
  ui.normalise = function (text) {
    return String(text || '').toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ')
      .replace(/^[\s"'“”]+|[\s"'“”.,;:!?]+$/g, '');
  };

  var LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  /* ---------------- choice ---------------- */

  Hub.KINDS.choice = function (task, mount, api) {
    var total = task.items.length;
    var solved = 0, firstTime = 0;
    var score = el('p', { class: 'score', 'aria-live': 'polite' });
    var ending = el('div');

    function showScore() {
      score.textContent = solved + ' of ' + total + ' answered. ' + firstTime + ' right first time.';
    }

    function drawItem(item, n) {
      var options = item.options || task.options;
      var short = !item.options;             // the same few labels for every question: draw them as a row
      var tries = 0, locked = false;
      var why = el('p', { class: 'why', 'aria-live': 'polite' });
      var buttons = options.map(function (text, i) {
        var button = el('button', { type: 'button', class: 'opt' },
          short ? null : el('span', { class: 'opt-letter' }, LETTERS[i]),
          el('span', { class: 'opt-text' }, text));
        button.addEventListener('click', function () { choose(i, button); });
        return button;
      });

      function choose(i, button) {
        if (locked) return;
        tries++;
        if (i === item.answer) {
          locked = true;
          button.classList.add('is-right');
          buttons.forEach(function (other) { other.disabled = true; });
          why.className = 'why why-right';
          why.textContent = 'Yes. ' + item.why;
          solved++;
          if (tries === 1) firstTime++;
          showScore();
          if (solved === total) finish();
        } else {
          button.classList.add('is-wrong');
          button.disabled = true;
          why.className = 'why why-wrong';
          why.textContent = 'Not yet. ' + ((item.reasons && item.reasons[i]) || 'Try another answer.');
        }
      }

      return el('li', { class: 'q' },
        el('div', { class: 'q-body' },
          item.source ? ui.quote('Source', item.source) : null,
          item.attempt ? ui.quote(item.attemptLabel || task.attemptLabel || 'Paraphrase', item.attempt, 'quote-attempt') : null,
          item.prompt ? el('p', { class: 'q-prompt' }, item.prompt) : null,
          el('div', { class: 'opts' + (short ? ' opts-row' : ''), role: 'group', 'aria-label': 'Answers for question ' + (n + 1) }, buttons),
          why));
    }

    function finish() {
      Hub.add(ending, ui.feedback('pass',
        (firstTime === total ? 'All ' + total + ' right first time. ' : 'All ' + total + ' answered. ') + (task.after || '')));
      api.done();
    }

    if (task.passage) mount.appendChild(ui.passage(task.passage));
    mount.appendChild(el('ol', { class: 'qs' }, task.items.map(drawItem)));
    mount.appendChild(score);
    mount.appendChild(ending);
    showScore();
  };

  /* ---------------- match ---------------- */

  Hub.KINDS.match = function (task, mount, api) {
    var checks = 0, finished = false;
    var result = el('div', { 'aria-live': 'polite' });
    var showButton = el('button', { type: 'button', class: 'btn', hidden: true }, 'Show me the answers');

    // The right-hand column, in alphabetical order, so the order gives nothing away.
    var choices = task.pairs.map(function (pair, i) { return { text: pair.right, index: i }; })
      .sort(function (a, b) { return a.text.localeCompare(b.text); });

    var rows = task.pairs.map(function (pair, i) {
      var id = task.id + '-row-' + i;
      var select = el('select', { id: id },
        el('option', { value: '' }, 'Choose…'),
        choices.map(function (choice) { return el('option', { value: String(choice.index) }, choice.text); }));
      var mark = el('span', { class: 'mark' });
      var row = el('div', { class: 'match-row' },
        el('label', { for: id, class: 'match-left' }, pair.left),
        select,
        mark);
      select.addEventListener('change', function () { row.classList.remove('is-right', 'is-wrong'); mark.textContent = ''; });
      return { index: i, select: select, mark: mark, row: row };
    });

    function check() {
      if (finished) return;
      var right = 0;
      rows.forEach(function (row) {
        var ok = row.select.value === String(row.index);
        row.row.classList.toggle('is-right', ok);
        row.row.classList.toggle('is-wrong', !ok);
        row.mark.textContent = ok ? '✓ right' : (row.select.value ? '✗ not this one' : '✗ no answer yet');
        if (ok) right++;
      });
      checks++;
      Hub.clear(result);
      if (right === rows.length) {
        finished = true;
        rows.forEach(function (row) { row.select.disabled = true; });
        showButton.hidden = true;
        Hub.add(result, ui.feedback('pass', 'All ' + rows.length + ' matched. ' + (task.after || '')));
        api.done();
      } else {
        Hub.add(result, ui.feedback('notyet', right + ' of ' + rows.length + ' right. Change the ones marked ✗ and check again.'));
        if (checks >= 3) showButton.hidden = false;
      }
    }

    showButton.addEventListener('click', function () {
      rows.forEach(function (row) { row.select.value = String(row.index); });
      check();
    });

    mount.appendChild(el('div', { class: 'match' },
      el('div', { class: 'match-heads', 'aria-hidden': 'true' },
        el('span', null, task.leftLabel || ''), el('span', null, task.rightLabel || '')),
      rows.map(function (row) { return row.row; })));
    mount.appendChild(el('div', { class: 'actions' },
      el('button', { type: 'button', class: 'btn btn-primary', onclick: check }, 'Check my answers'),
      showButton));
    mount.appendChild(result);
  };

  /* ---------------- gap ---------------- */

  Hub.KINDS.gap = function (task, mount, api) {
    var checks = 0, finished = false;
    var lastFocused = null;
    var result = el('div', { 'aria-live': 'polite' });
    var showButton = el('button', { type: 'button', class: 'btn', hidden: true }, 'Show me the answers');

    var rows = task.items.map(function (item, i) {
      var longest = item.accept.reduce(function (most, answer) { return Math.max(most, answer.length); }, 8);
      var input = el('input', {
        type: 'text', class: 'gap-input', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
        'aria-label': 'Gap ' + (i + 1), style: 'width:' + (longest + 4) + 'ch'
      });
      var mark = el('span', { class: 'mark' });
      var row = el('li', { class: 'gap-row' },
        el('span', { class: 'gap-sentence' }, item.before ? item.before + ' ' : '', input, item.after || ''),
        mark);
      input.addEventListener('focus', function () { lastFocused = input; });
      input.addEventListener('input', function () {
        row.classList.remove('is-right', 'is-wrong');
        mark.textContent = '';
        showUsed();
      });
      input.addEventListener('keydown', function (event) { if (event.key === 'Enter') check(); });
      return { item: item, input: input, mark: mark, row: row };
    });

    // The bank: click a phrase and it goes into the gap you were in, or the first empty one.
    var chips = (task.bank || []).map(function (phrase) {
      var chip = el('button', { type: 'button', class: 'chip' }, phrase);
      chip.addEventListener('click', function () {
        if (finished) return;
        var target = (lastFocused && !lastFocused.value) ? lastFocused : null;
        if (!target) {
          var empty = rows.filter(function (row) { return !row.input.value; })[0];
          target = empty ? empty.input : null;
        }
        if (!target) return;
        target.value = phrase;
        target.dispatchEvent(new Event('input'));
        target.focus();
      });
      return { phrase: phrase, node: chip };
    });

    function showUsed() {
      var typed = rows.map(function (row) { return ui.normalise(row.input.value); });
      chips.forEach(function (chip) {
        chip.node.classList.toggle('is-used', typed.indexOf(ui.normalise(chip.phrase)) !== -1);
      });
    }

    function isRight(row) {
      var typed = ui.normalise(row.input.value);
      return row.item.accept.some(function (answer) { return ui.normalise(answer) === typed; });
    }

    function check() {
      if (finished) return;
      var right = 0;
      rows.forEach(function (row) {
        var ok = isRight(row);
        row.row.classList.toggle('is-right', ok);
        row.row.classList.toggle('is-wrong', !ok);
        row.mark.textContent = ok ? '✓ right' : (row.input.value.trim() ? '✗ not yet' : '✗ empty');
        if (ok) right++;
      });
      checks++;
      Hub.clear(result);
      if (right === rows.length) {
        finished = true;
        rows.forEach(function (row) { row.input.readOnly = true; });
        showButton.hidden = true;
        Hub.add(result, ui.feedback('pass', 'All ' + rows.length + ' right. ' + (task.after || '')));
        api.done();
      } else {
        Hub.add(result, ui.feedback('notyet', right + ' of ' + rows.length + ' right. Change the ones marked ✗ and check again.'));
        if (checks >= 3) showButton.hidden = false;
      }
    }

    showButton.addEventListener('click', function () {
      rows.forEach(function (row) { if (!isRight(row)) row.input.value = row.item.accept[0]; });
      showUsed();
      check();
    });

    if (chips.length) {
      mount.appendChild(el('div', { class: 'bank' },
        el('p', { class: 'bank-label' }, 'The bank'),
        el('div', { class: 'bank-chips' }, chips.map(function (chip) { return chip.node; }))));
    }
    mount.appendChild(el('ol', { class: 'gaps' }, rows.map(function (row) { return row.row; })));
    mount.appendChild(el('div', { class: 'actions' },
      el('button', { type: 'button', class: 'btn btn-primary', onclick: check }, 'Check my answers'),
      showButton));
    mount.appendChild(result);
  };

  /* ---------------- order ---------------- */

  Hub.KINDS.order = function (task, mount, api) {
    var order = task.start.slice();       // order[position] = index of the item shown there
    var finished = false, checked = false;
    var list = el('ol', { class: 'order' });
    var result = el('div', { 'aria-live': 'polite' });

    function move(position, step) {
      var to = position + step;
      if (finished || to < 0 || to >= order.length) return;
      var held = order[position];
      order[position] = order[to];
      order[to] = held;
      checked = false;
      draw();
      // keep the keyboard on the line that moved
      var buttons = list.children[to].querySelectorAll('button');
      var wanted = buttons[step < 0 ? 0 : 1];
      (wanted && !wanted.disabled ? wanted : buttons[step < 0 ? 1 : 0]).focus();
    }

    function draw() {
      Hub.clear(list);
      order.forEach(function (itemIndex, position) {
        var item = task.items[itemIndex];
        var right = itemIndex === position;
        var short = item.text.slice(0, 40) + '…';
        list.appendChild(el('li', { class: 'order-row' + (checked ? (right ? ' is-right' : ' is-wrong') : '') },
          el('span', { class: 'order-n' }, String(position + 1)),
          el('span', { class: 'order-text' },
            finished ? el('span', { class: 'order-label' }, item.label) : null,
            item.text),
          checked ? el('span', { class: 'mark' }, right ? '✓ right place' : '✗ wrong place') : null,
          finished ? null : el('span', { class: 'order-moves' },
            el('button', { type: 'button', class: 'btn btn-small', disabled: position === 0 ? true : null,
              'aria-label': 'Move up: ' + short, onclick: function () { move(position, -1); } }, 'Move up'),
            el('button', { type: 'button', class: 'btn btn-small', disabled: position === order.length - 1 ? true : null,
              'aria-label': 'Move down: ' + short, onclick: function () { move(position, 1); } }, 'Move down'))));
      });
    }

    function check() {
      if (finished) return;
      var right = order.filter(function (itemIndex, position) { return itemIndex === position; }).length;
      checked = true;
      Hub.clear(result);
      if (right === order.length) {
        finished = true;
        draw();
        Hub.add(result, ui.feedback('pass', task.after || 'All in the right order.'));
        api.done();
      } else {
        draw();
        Hub.add(result, ui.feedback('notyet', right + ' of ' + order.length + ' in the right place. Move the others and check again.'));
      }
    }

    draw();
    mount.appendChild(list);
    mount.appendChild(el('div', { class: 'actions' },
      el('button', { type: 'button', class: 'btn btn-primary', onclick: check }, 'Check the order')));
    mount.appendChild(result);
  };

  /* ---------------- proofread ---------------- */

  // 'Lab computers {is reset|are reset|verb|why}.' ->
  //   [ { plain: 'Lab computers ' }, { wrong: 'is reset', right: ['are reset'], type: 'verb', why: '…' }, { plain: '.' } ]
  function parseProof(text) {
    var parts = [];
    var pattern = /\{([^}]+)\}/g;
    var last = 0, found, fields;
    while ((found = pattern.exec(text))) {
      if (found.index > last) parts.push({ plain: text.slice(last, found.index) });
      fields = found[1].split('|');
      parts.push({ wrong: fields[0], right: fields[1].split('/'), type: fields[2], why: fields[3] });
      last = pattern.lastIndex;
    }
    if (last < text.length) parts.push({ plain: text.slice(last) });
    return parts;
  }

  Hub.KINDS.proofread = function (task, mount, api) {
    var parts = parseProof(task.text);
    var errors = parts.filter(function (part) { return part.wrong; });
    var picked = null;                       // the mistake the student is correcting now
    var paragraph = el('p', { class: 'proof' });
    var panel = el('div', { class: 'proof-panel', 'aria-live': 'polite' });
    var counter = el('p', { class: 'score', 'aria-live': 'polite' });
    var fixes = el('ol', { class: 'fixes' });
    var ending = el('div');

    errors.forEach(function (error) { error.found = false; error.tries = 0; error.buttons = []; });

    function wordButton(word, error) {
      var button = el('button', { type: 'button', class: 'w' }, word);
      button.addEventListener('click', function () {
        if (error) pick(error);
        else fine(word, button);
      });
      if (error) error.buttons.push(button);
      return button;
    }

    // Every word is a button, so nothing on the page shows which words are wrong.
    parts.forEach(function (part) {
      if (part.wrong) {
        part.holder = el('span', { class: 'proof-chunk' });
        part.wrong.split(' ').forEach(function (word, i) {
          if (i) part.holder.appendChild(document.createTextNode(' '));
          part.holder.appendChild(wordButton(word, part));
        });
        paragraph.appendChild(part.holder);
        return;
      }
      part.plain.split(/(\s+)/).forEach(function (token) {
        var pieces = token.match(/^([("“‘']*)(.*?)([.,;:!?)"”’']*)$/);
        if (!token || /^\s+$/.test(token) || !pieces || !pieces[2]) {
          paragraph.appendChild(document.createTextNode(token));
          return;
        }
        if (pieces[1]) paragraph.appendChild(document.createTextNode(pieces[1]));
        paragraph.appendChild(wordButton(pieces[2], null));
        if (pieces[3]) paragraph.appendChild(document.createTextNode(pieces[3]));
      });
    });

    function left() { return errors.filter(function (error) { return !error.found; }); }

    function showCounter() {
      var remaining = left();
      var byType = {};
      remaining.forEach(function (error) { byType[error.type] = (byType[error.type] || 0) + 1; });
      var stillToFind = Object.keys(task.types).filter(function (type) { return byType[type]; })
        .map(function (type) { return task.types[type].toLowerCase() + ' ' + byType[type]; });
      counter.textContent = (errors.length - remaining.length) + ' of ' + errors.length + ' fixed.' +
        (stillToFind.length ? ' Still to find: ' + stillToFind.join(', ') + '.' : '');
    }

    function unpick() {
      if (picked) picked.buttons.forEach(function (button) { button.classList.remove('is-picked'); });
      picked = null;
    }

    function fine(word, button) {
      unpick();
      Hub.clear(panel);
      Hub.add(panel, el('p', { class: 'proof-msg' }, '"' + word + '" is fine as it is. Look at the verbs, the passives and the articles.'));
      button.classList.add('is-fine');
      window.setTimeout(function () { button.classList.remove('is-fine'); }, 700);
    }

    function pick(error) {
      if (error.found) return;
      unpick();
      picked = error;
      error.buttons.forEach(function (button) { button.classList.add('is-picked'); });
      var id = task.id + '-fix';
      var input = el('input', { type: 'text', id: id, class: 'gap-input', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
      var message = el('p', { class: 'proof-msg' });
      var showMe = el('button', { type: 'button', class: 'btn btn-small', hidden: true }, 'Show me');
      var form = el('form', { class: 'proof-form' },
        el('label', { for: id }, 'You picked "' + error.wrong + '". Type the correction: '),
        input,
        el('button', { type: 'submit', class: 'btn btn-primary btn-small' }, 'Fix it'),
        showMe);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var typed = ui.normalise(input.value);
        if (error.right.some(function (answer) { return ui.normalise(answer) === typed; })) {
          fix(error, false);
        } else {
          error.tries++;
          message.textContent = 'Not yet. Think about ' + task.types[error.type].toLowerCase() + '.';
          if (error.tries >= 2) showMe.hidden = false;
        }
      });
      showMe.addEventListener('click', function () { fix(error, true); });
      Hub.clear(panel);
      Hub.add(panel, [form, message]);
      input.focus();
    }

    function fix(error, shown) {
      error.found = true;
      picked = null;
      Hub.clear(error.holder);
      error.holder.className = 'proof-chunk is-fixed';
      error.holder.textContent = error.right[0];
      fixes.appendChild(el('li', null,
        el('s', null, error.wrong), ' → ', el('strong', null, error.right[0]),
        el('span', { class: 'fix-why' }, ' ' + task.types[error.type] + '. ' + error.why + (shown ? ' (shown)' : ''))));
      Hub.clear(panel);
      Hub.add(panel, el('p', { class: 'proof-msg' }, 'Fixed.'));
      showCounter();
      if (!left().length) {
        Hub.clear(panel);
        hintButton.hidden = true;
        Hub.add(ending, ui.feedback('pass', task.after || 'All fixed.'));
        api.done();
      }
    }

    var hintButton = el('button', { type: 'button', class: 'btn', onclick: function () {
      var next = left()[0];
      if (next) pick(next);
    } }, 'Show me where one is');

    mount.appendChild(paragraph);
    mount.appendChild(counter);
    mount.appendChild(panel);
    mount.appendChild(el('div', { class: 'actions' }, hintButton));
    mount.appendChild(el('div', { class: 'fixes-wrap' }, el('h2', { class: 'small-head' }, 'Your corrections'), fixes));
    mount.appendChild(ending);
    showCounter();
  };
})();
