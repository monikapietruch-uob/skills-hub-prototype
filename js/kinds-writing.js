/*
  js/kinds-writing.js — the four task kinds where the student writes.

    paraphrase  a sentence, a pair or a paragraph, then the four test cases
    summary     read or listen, take notes in a frame, write, then the five test cases
    planner     six questions in, a report skeleton out
    structure   a report in six boxes, checked section by section

  The checking itself is in js/checks.js. This file only draws: it asks
  checks.js for the results and shows them in the "test run" panel.
*/
(function () {
  'use strict';

  var Hub = window.Hub;
  var el = Hub.el;
  var ui = Hub.ui;
  var checks = Hub.checks;

  /* ------------------------------------------------------------------
     The test run panel.

     tests:    what Hub.checks.paraphrase() / summary() returned
     onChange: called with true when every test passes, false when not
               (again after each tick, because a tick can change the result)
     ------------------------------------------------------------------ */
  ui.testRun = function (tests, onChange, options) {
    var title = (options && options.title) || 'Test run';
    var noun = (options && options.noun) || 'tests';
    var PILL = { pass: 'Pass', fail: 'Fail', yours: 'Your turn' };
    var MARK = { ok: '✓', bad: '✗', maybe: '!' };
    var ticks = {};
    var total = el('p', { class: 'testrun-total' });

    var rows = tests.map(function (test, n) {
      var failing = test.auto.some(function (finding) { return finding.state === 'bad'; });
      var pill = el('span', { class: 'pill' });
      var tick = null;
      if (test.ask) {
        var box = el('input', { type: 'checkbox', disabled: failing ? true : null });
        box.addEventListener('change', function () { ticks[test.id] = box.checked; update(); });
        tick = el('label', { class: 'tick' + (failing ? ' is-off' : '') }, box,
          el('span', null, test.ask, failing ? el('em', null, ' Fix the points above first.') : null));
      }
      var findings = test.auto.length
        ? el('ul', { class: 'findings' }, test.auto.map(function (finding) {
          return el('li', { class: 'f-' + finding.state },
            el('span', { class: 'f-mark', 'aria-hidden': 'true' }, MARK[finding.state]), finding.text);
        }))
        : el('p', { class: 'findings-none' }, 'A computer cannot run this test. You can.');
      var row = el('li', { class: 'test' }, pill,
        el('div', { class: 'test-body' },
          el('p', { class: 'test-name' }, (n + 1) + ' ' + test.name),
          findings,
          tick));
      return { test: test, row: row, pill: pill };
    });

    function update() {
      var passing = 0, failing = 0;
      rows.forEach(function (entry) {
        var status = checks.statusOf(entry.test, ticks[entry.test.id]);
        entry.row.className = 'test is-' + status;
        entry.pill.className = 'pill pill-' + status;
        entry.pill.textContent = PILL[status];
        if (status === 'pass') passing++;
        if (status === 'fail') failing++;
      });
      if (passing === rows.length) total.textContent = 'All ' + rows.length + ' ' + noun + ' pass.';
      else if (failing) total.textContent = passing + ' of ' + rows.length + ' ' + noun + ' pass. Debug it and run the ' + noun + ' again.';
      else total.textContent = passing + ' of ' + rows.length + ' ' + noun + ' pass. Run the others yourself and tick them.';
      onChange(passing === rows.length);
    }

    var panel = el('section', { class: 'testrun' },
      el((options && options.heading) || 'h3', null, title),
      el('ol', { class: 'tests' }, rows.map(function (entry) { return entry.row; })),
      total);
    update();
    return panel;
  };

  // "0 words. The source has 15."   The count turns into words, never only a colour.
  function countLine(node, n, text) {
    node.textContent = n + (n === 1 ? ' word. ' : ' words. ') + text;
  }

  // A textarea that remembers what was typed (Hub.store) and tells us when it changes.
  function draftArea(key, rows, label, onInput) {
    var id = 'ta-' + key.replace(/[^a-z0-9]+/gi, '-');
    var area = el('textarea', { id: id, rows: String(rows), spellcheck: 'true' });
    area.value = Hub.store.draft(key);
    area.addEventListener('input', function () {
      Hub.store.setDraft(key, area.value);
      if (onInput) onInput(area.value);
    });
    return { area: area, label: el('label', { for: id, class: 'field-label' }, label) };
  }

  /* ---------------- copy and download (lab computers forget) ---------------- */

  ui.copy = function (text, done) {
    function oldWay() {
      var area = el('textarea', { class: 'offscreen', 'aria-hidden': 'true' });
      var ok = false;
      area.value = text;
      document.body.appendChild(area);
      area.select();
      try { ok = document.execCommand('copy'); } catch (error) { ok = false; }
      document.body.removeChild(area);
      done(ok);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, oldWay);
    } else {
      oldWay();
    }
  };

  ui.download = function (filename, text) {
    var url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    var link = el('a', { href: url, download: filename, class: 'offscreen' });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  };

  // Two buttons, "Copy …" and "Download …". getText() is called at the moment of the click.
  ui.exportButtons = function (what, filename, getText) {
    var status = el('span', { class: 'export-status', 'aria-live': 'polite' });
    return el('div', { class: 'actions' },
      el('button', { type: 'button', class: 'btn', onclick: function () {
        ui.copy(getText(), function (ok) {
          status.textContent = ok ? 'Copied. Paste it into Word or OneDrive.' : 'Copying is blocked here. Use Download.';
        });
      } }, 'Copy ' + what),
      el('button', { type: 'button', class: 'btn', onclick: function () {
        ui.download(filename, getText());
        status.textContent = 'Downloaded as ' + filename + '.';
      } }, 'Download ' + what),
      status);
  };

  /* ------------------------------------------------------------------
     paraphrase
     ------------------------------------------------------------------ */

  Hub.KINDS.paraphrase = function (task, mount, api) {
    var passed = task.items.map(function () { return false; });
    function report(n, ok) {
      passed[n] = ok;
      if (passed.every(Boolean)) api.done();
    }
    task.items.forEach(function (item, n) {
      mount.appendChild(drawItem(task, item, n, report));
    });
  };

  function drawItem(task, item, n, report) {
    var guided = !!task.guided;
    var key = task.id + ':' + n;
    var sourceCount = checks.count(item.source);
    var ran = false;

    function stage(name, hidden) {
      return el('div', { class: 'stage', hidden: hidden ? true : null }, el('h3', { class: 'stage-name' }, name));
    }
    function open(node) {
      node.hidden = false;
      var first = node.querySelector('button, textarea, input');
      if (first) first.focus();
    }

    /* stage 1: read (and, in a guided task, show that you understood) */
    var read = stage(guided ? '1 Read and understand' : 'Read');
    read.appendChild(ui.quote('Source', item.source));
    if (item.tip) read.appendChild(el('p', { class: 'tip' }, item.tip));

    /* stage 2 (guided only): highlight the words you can change */
    var highlight = guided ? stage('2 Highlight the words you can change', true) : null;

    /* stage 3: rewrite */
    var rewrite = stage(guided ? '3 Rewrite' : 'Rewrite', guided);
    var count = el('p', { class: 'count' });
    var draft = draftArea(key, sourceCount > 30 ? 7 : (sourceCount > 18 ? 5 : 3), 'Your paraphrase', function (text) {
      countLine(count, checks.count(text), 'The source has ' + sourceCount + '.');
      if (ran) {
        ran = false;
        Hub.clear(panel);
        Hub.add(panel, el('p', { class: 'stale' }, 'You changed your text. Run the tests again.'));
        report(n, false);
      }
    });
    countLine(count, checks.count(draft.area.value), 'The source has ' + sourceCount + '.');
    if (item.tries) {
      rewrite.appendChild(el('details', { class: 'hints', open: guided ? true : null },
        el('summary', null, 'Hints'),
        el('ul', null, item.tries.split(' · ').map(function (hint) { return el('li', null, hint); }))));
    }
    var facts = null;
    if (item.facts) {
      var factsId = 'facts-' + task.id + '-' + n;
      facts = el('input', { type: 'number', id: factsId, min: '1', max: '20', class: 'facts-input' });
      rewrite.appendChild(el('p', { class: 'facts' },
        el('label', { for: factsId }, 'Count first: how many pieces of information are in the source? '), facts));
    }
    Hub.add(rewrite, [draft.label, draft.area, count]);

    /* stage 4: run the tests, then compare with a model */
    var check = stage(guided ? '4 Check' : 'Check', guided);
    var panel = el('div', { class: 'testrun-holder', 'aria-live': 'polite' });
    var model = el('div', { class: 'model', hidden: true },
      ui.quote('Source', item.source),
      item.models.map(function (text) { return ui.quote('A model answer', text, 'quote-model'); }),
      el('p', { class: 'model-note' }, 'Yours can be different and still be correct. ' + (item.watch || '')));
    var modelButton = el('button', { type: 'button', class: 'btn', hidden: true, onclick: function () {
      model.hidden = false;
      modelButton.hidden = true;
    } }, 'Show a model answer');

    function run() {
      var answer = draft.area.value;
      Hub.clear(panel);
      if (checks.count(answer) < 3) {
        Hub.add(panel, ui.feedback('notyet', 'Write your paraphrase first. Then run the tests.'));
        report(n, false);
        return;
      }
      ran = true;
      var tests = checks.paraphrase(item, answer, { factsCounted: facts ? facts.value : null });
      Hub.add(panel, ui.testRun(tests, function (allPass) { report(n, allPass); }));
      if (model.hidden) modelButton.hidden = false;
    }

    Hub.add(check, [
      el('div', { class: 'actions' },
        el('button', { type: 'button', class: 'btn btn-primary', onclick: run }, 'Run the four tests'),
        modelButton),
      panel,
      model
    ]);

    if (guided) {
      buildUnderstand(read, item, function () { open(highlight); });
      buildHighlight(highlight, item, function () { rewrite.hidden = false; check.hidden = false; draft.area.focus(); });
    }

    return el('article', { class: 'write' },
      el('h2', { class: 'write-head' }, el('span', { class: 'write-n' }, String(n + 1)), item.label),
      read, highlight, rewrite, check);
  }

  // Guided stage 1: one quick question, so "read and understand" is not just a button.
  function buildUnderstand(stage, item, next) {
    var message = el('p', { class: 'why', 'aria-live': 'polite' });
    if (!item.understand) {
      stage.appendChild(el('div', { class: 'actions' },
        el('button', { type: 'button', class: 'btn btn-primary', onclick: next }, 'I understand it')));
      return;
    }
    var locked = false;
    var buttons = item.understand.options.map(function (text, i) {
      var button = el('button', { type: 'button', class: 'opt' }, el('span', { class: 'opt-text' }, text));
      button.addEventListener('click', function () {
        if (locked) return;
        if (i === item.understand.answer) {
          locked = true;
          button.classList.add('is-right');
          buttons.forEach(function (other) { other.disabled = true; });
          message.className = 'why why-right';
          message.textContent = 'Yes. You understand the source. Now highlight.';
          next();
        } else {
          button.classList.add('is-wrong');
          button.disabled = true;
          message.className = 'why why-wrong';
          message.textContent = 'Not yet. Read the source again.';
        }
      });
      return button;
    });
    Hub.add(stage, [
      el('p', { class: 'q-prompt' }, item.understand.question),
      el('div', { class: 'opts', role: 'group', 'aria-label': 'Which is true?' }, buttons),
      message
    ]);
  }

  // Guided stage 2: every word of the source is a switch. The words in item.change are the
  // ones "in red on the slide"; the words in item.keep are technical terms and must stay.
  function buildHighlight(stage, item, next) {
    var tokens = item.source.split(/\s+/);
    var plain = tokens.map(function (token) { return checks.words(token).join(' '); });
    var role = tokens.map(function () { return null; });      // null | 'keep' | index into item.change
    var keep = (item.keep || []).map(function (entry) { return Array.isArray(entry) ? entry[0] : entry; });

    function claim(phrase, value) {
      var wanted = checks.words(phrase);
      var i, j, hit;
      for (i = 0; i + wanted.length <= plain.length; i++) {
        hit = true;
        for (j = 0; j < wanted.length; j++) if (plain[i + j] !== wanted[j]) { hit = false; break; }
        if (hit) for (j = 0; j < wanted.length; j++) role[i + j] = value;
      }
    }
    keep.forEach(function (phrase) { claim(phrase, 'keep'); });
    (item.change || []).forEach(function (phrase, index) { claim(phrase, index); });

    var finished = false, tries = 0;
    var message = el('div', { 'aria-live': 'polite' });
    var buttons = tokens.map(function (token) {
      var button = el('button', { type: 'button', class: 'pick', 'aria-pressed': 'false' }, token);
      button.addEventListener('click', function () {
        if (finished) return;
        button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      });
      return button;
    });
    var line = el('p', { class: 'picks' });
    buttons.forEach(function (button, i) {
      if (i) line.appendChild(document.createTextNode(' '));
      line.appendChild(button);
    });

    function picked(i) { return buttons[i].getAttribute('aria-pressed') === 'true'; }

    function reveal() {
      finished = true;
      buttons.forEach(function (button, i) {
        button.setAttribute('aria-pressed', typeof role[i] === 'number' ? 'true' : 'false');
        button.disabled = true;
        if (role[i] === 'keep') button.classList.add('is-term');
      });
      showButton.hidden = true;
      checkButton.hidden = true;
    }

    function check() {
      if (finished) return;
      tries++;
      Hub.clear(message);
      var termPicked = tokens.some(function (token, i) { return role[i] === 'keep' && picked(i); });
      var missing = (item.change || []).filter(function (phrase, index) {
        return !tokens.some(function (token, i) { return role[i] === index && picked(i); });
      });
      if (termPicked) {
        Hub.add(message, ui.feedback('notyet', '"' + keep.join('", "') + '" is a technical term. It stays. Take it out of your highlighting.'));
      } else if (missing.length) {
        Hub.add(message, ui.feedback('notyet', missing.length === 1
          ? 'Nearly. There is one more word or phrase you can change.'
          : 'There are ' + missing.length + ' more words or phrases you can change.'));
      } else {
        var extra = tokens.filter(function (token, i) { return role[i] === null && picked(i); });
        reveal();
        Hub.add(message, ui.feedback('pass', 'These are the words to change: ' + item.change.join(', ') + '.' +
          (extra.length ? ' You also picked "' + extra.join('", "').replace(/[.,]/g, '') + '": that can stay or change. Your choice.' : '')));
        next();
        return;
      }
      if (tries >= 2) showButton.hidden = false;
    }

    var checkButton = el('button', { type: 'button', class: 'btn btn-primary', onclick: check }, 'Check my highlighting');
    var showButton = el('button', { type: 'button', class: 'btn', hidden: true, onclick: function () {
      reveal();
      Hub.clear(message);
      Hub.add(message, ui.feedback('info', 'The words to change: ' + item.change.join(', ') + '.' +
        (keep.length ? ' Technical terms that stay: ' + keep.join(', ') + '.' : '')));
      next();
    } }, 'Show me');

    Hub.add(stage, [
      el('p', { class: 'stage-help' }, 'Click every word you can change. Leave technical terms alone.'),
      line,
      el('div', { class: 'actions' }, checkButton, showButton),
      message
    ]);
  }

  /* ------------------------------------------------------------------
     summary  (reading or listening)
     ------------------------------------------------------------------ */

  Hub.KINDS.summary = function (task, mount, api) {
    var isTalk = task.source.type === 'talk';
    var sourceCount = checks.count(task.source.text);
    var ran = false;

    function stage(name) { return el('div', { class: 'stage' }, el('h2', { class: 'stage-name' }, name)); }

    /* 1 read or listen */
    var first = stage(isTalk ? '1 Listen' : '1 Read');
    if (isTalk) {
      first.appendChild(el('p', { class: 'stage-help' }, 'Talk: ' + task.source.title));
      first.appendChild(makePlayer(task.source));
    } else {
      first.appendChild(el('figure', { class: 'reading' },
        el('figcaption', null, task.source.title + ' (' + sourceCount + ' words)'),
        task.source.text.split(/\n\s*\n/).map(function (paragraph) { return el('p', null, paragraph); })));
    }

    /* 2 notes */
    var second = stage('2 Take notes');
    second.appendChild(el('p', { class: 'stage-help' }, 'Key words, not sentences. Symbols and abbreviations are welcome.'));
    var frame = el('div', { class: 'frame' });
    task.frame.forEach(function (row, i) {
      var note = draftArea(task.id + ':note' + i, /points/i.test(row.label) ? 4 : 2, row.label);
      note.label.appendChild(el('span', { class: 'field-hint' }, row.hint));
      frame.appendChild(el('div', { class: 'frame-row' }, note.label, note.area));
    });
    second.appendChild(frame);

    /* 3 write */
    var third = stage('3 Write your summary');
    var count = el('p', { class: 'count' });
    var aim = 'Aim for ' + task.range[0] + ' to ' + task.range[1] + ', in one paragraph.';
    var draft = draftArea(task.id + ':summary', 6, 'Your summary, from your notes', function (text) {
      countLine(count, checks.count(text), aim);
      if (ran) {
        ran = false;
        Hub.clear(panel);
        Hub.add(panel, el('p', { class: 'stale' }, 'You changed your text. Run the test cases again.'));
      }
    });
    countLine(count, checks.count(draft.area.value), aim);
    Hub.add(third, [draft.label, draft.area, count]);

    /* 4 check */
    var fourth = stage('4 Check');
    var panel = el('div', { class: 'testrun-holder', 'aria-live': 'polite' });
    var model = el('div', { class: 'model model-summary', hidden: true },
      el('div', { class: 'model-cols' },
        el('figure', { class: 'quote notes-model' },
          el('figcaption', null, 'Model notes'),
          el('ul', null, task.modelNotes.map(function (line) { return el('li', null, line); }))),
        el('div', null,
          ui.quote('Model summary (' + checks.count(task.model) + ' words)', task.model, 'quote-model'),
          el('p', { class: 'model-note' }, task.kept),
          el('p', { class: 'model-note' }, task.deleted))),
      isTalk ? ui.passage({ title: 'Read the script of the talk', paragraphs: task.source.text.split(/\n\s*\n/) }) : null);
    var modelButton = el('button', { type: 'button', class: 'btn', hidden: true, onclick: function () {
      model.hidden = false;
      modelButton.hidden = true;
    } }, isTalk ? 'Show the model notes, the model summary and the script' : 'Show the model notes and the model summary');

    function run() {
      var answer = draft.area.value;
      Hub.clear(panel);
      if (checks.count(answer) < 5) {
        Hub.add(panel, ui.feedback('notyet', 'Write your summary first. Then run the test cases.'));
        return;
      }
      ran = true;
      Hub.add(panel, ui.testRun(checks.summary(task, answer), function (allPass) { if (allPass) api.done(); },
        { title: 'Test run: five test cases' }));
      if (model.hidden) modelButton.hidden = false;
    }

    Hub.add(fourth, [
      el('div', { class: 'actions' },
        el('button', { type: 'button', class: 'btn btn-primary', onclick: run }, 'Run the five test cases'),
        modelButton),
      panel,
      model
    ]);

    Hub.add(mount, [first, second, third, fourth]);
  };

  // The talk, read aloud by the browser (the Web Speech API). No sound file is needed, but the
  // voice is different on every computer. A recording would replace this function.
  function makePlayer(source) {
    var synth = window.speechSynthesis;
    var canSpeak = !!synth && typeof window.SpeechSynthesisUtterance !== 'undefined';
    var plays = 0, playing = false;
    var status = el('p', { class: 'player-status', 'aria-live': 'polite' });
    var playButton = el('button', { type: 'button', class: 'btn btn-primary' }, 'Play the talk');
    var stopButton = el('button', { type: 'button', class: 'btn', disabled: true }, 'Stop');
    // Plan B, shown only when the computer has no voice: the script to read.
    var script = ui.passage({ title: 'No sound? Read the script once, then close it', paragraphs: source.text.split(/\n\s*\n/) });
    script.hidden = canSpeak;

    function show() {
      playButton.disabled = playing || !canSpeak;
      stopButton.disabled = !playing;
      playButton.textContent = plays === 0 ? 'Play the talk' : (plays === 1 ? 'Play it again' : 'Play it once more');
      if (!canSpeak) status.textContent = 'This browser cannot read the talk aloud. Ask your teacher to read it to you, or read the script below.';
      else if (playing) status.textContent = 'Playing: listening ' + plays + (plays <= 2 ? ' of 2' : '') + '. Take notes.';
      else if (plays === 0) status.textContent = 'Not played yet. In the test you hear the talk twice.';
      else if (plays === 1) status.textContent = 'Played once. Play it again, then write.';
      else if (plays === 2) status.textContent = 'Played twice. Now write your summary from your notes.';
      else status.textContent = 'Played ' + plays + ' times. In the test you hear it twice.';
    }

    function finished() {
      if (!playing) return;
      playing = false;
      show();
    }

    // The computer has the feature but cannot speak (no voice installed, or sound is blocked).
    function failed() {
      if (!playing) return;
      synth.cancel();
      playing = false;
      plays--;
      canSpeak = false;
      script.hidden = false;
      show();
    }

    function voice() {
      var voices = synth.getVoices() || [];
      return voices.filter(function (v) { return /^en[-_]GB/i.test(v.lang); })[0] ||
        voices.filter(function (v) { return /^en/i.test(v.lang); })[0] || null;
    }

    playButton.addEventListener('click', function () {
      if (playing || !canSpeak) return;
      plays++;
      playing = true;
      show();
      if (synth.speaking || synth.pending) synth.cancel();
      // One sentence at a time: some browsers stop in the middle of a long text.
      var sentences = (source.say || source.text).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) || [];
      var chosen = voice();
      var started = false;
      sentences.forEach(function (sentence, i) {
        var line = new window.SpeechSynthesisUtterance(sentence.trim());
        line.lang = chosen ? chosen.lang : 'en-GB';
        line.rate = 0.9;
        if (chosen) line.voice = chosen;
        line.onstart = function () { started = true; };
        // "end" without a "start" means that nothing was said.
        if (i === sentences.length - 1) line.onend = function () { if (started) finished(); else failed(); };
        line.onerror = function (event) {
          if (event.error !== 'interrupted' && event.error !== 'canceled') failed();
        };
        synth.speak(line);
      });
      // Nothing started after four seconds: give up and offer the script.
      window.setTimeout(function () { if (!started) failed(); }, 4000);
    });

    stopButton.addEventListener('click', function () {
      synth.cancel();
      finished();
    });

    show();
    return el('div', { class: 'player' }, el('div', { class: 'actions' }, playButton, stopButton), status, script);
  }

  /* ------------------------------------------------------------------
     planner
     ------------------------------------------------------------------ */

  Hub.KINDS.planner = function (task, mount, api) {
    var inputs = {};
    var message = el('div', { 'aria-live': 'polite' });
    var out = el('div', { class: 'plan-out' });

    var rows = task.fields.map(function (field) {
      var id = task.id + '-' + field.id;
      var key = task.id + ':' + field.id;
      var input;
      if (field.type === 'select') {
        input = el('select', { id: id }, field.options.map(function (option) { return el('option', { value: option }, option); }));
        if (Hub.store.draft(key)) input.value = Hub.store.draft(key);
      } else {
        input = el('input', { type: 'text', id: id, autocomplete: 'off' });
        input.value = Hub.store.draft(key);
      }
      input.addEventListener('change', function () { Hub.store.setDraft(key, input.value); });
      inputs[field.id] = input;
      return el('div', { class: 'plan-row' },
        el('label', { for: id, class: 'field-label' }, field.label,
          field.hint ? el('span', { class: 'field-hint' }, field.hint) : null),
        input);
    });

    function values() {
      var result = {};
      task.fields.forEach(function (field) { result[field.id] = inputs[field.id].value.trim(); });
      return result;
    }

    function fill(text, given) {
      return text.replace(/\{(\w+)\}/g, function (all, id) { return given[id] || '…'; });
    }

    function build(event) {
      event.preventDefault();
      var given = values();
      var missing = task.fields.filter(function (field) { return field.required && !given[field.id]; });
      Hub.clear(message);
      if (missing.length) {
        Hub.add(message, ui.feedback('notyet', 'The plan needs: ' + missing.map(function (field) { return field.label.toLowerCase(); }).join('; ') + '.'));
        return;
      }
      var lines = ['REPORT PLAN', ''];
      Hub.clear(out);
      out.appendChild(el('h2', { class: 'small-head' }, 'Your report skeleton'));
      task.skeleton.forEach(function (part) {
        var notes = part.notes.map(function (note) { return fill(note, given); });
        out.appendChild(el('section', { class: 'plan-part' },
          el('h3', null, part.head, el('span', { class: 'plan-words' }, part.words)),
          el('p', { class: 'plan-label' }, 'Your notes'),
          el('ul', { class: 'plan-notes' }, notes.map(function (note) { return el('li', null, note); })),
          el('p', { class: 'plan-label' }, 'Phrases for this section'),
          el('ul', { class: 'plan-phrases' }, part.phrases.map(function (phrase) { return el('li', null, phrase); }))));
        lines.push(part.head.toUpperCase() + ' (' + part.words + ')');
        notes.forEach(function (note) { lines.push('  Notes: ' + note); });
        part.phrases.forEach(function (phrase) { lines.push('  Phrase: ' + phrase); });
        lines.push('');
      });
      out.appendChild(ui.exportButtons('my plan', 'report-plan.txt', function () { return lines.join('\n'); }));
      Hub.add(message, ui.feedback('pass', 'Your skeleton is below. Copy or download it before you log out.'));
      api.done();
    }

    var form = el('form', { class: 'planner' }, rows,
      el('div', { class: 'actions' }, el('button', { type: 'submit', class: 'btn btn-primary' }, 'Build my skeleton')));
    form.addEventListener('submit', build);

    Hub.add(mount, [form, message, out]);
  };

  /* ------------------------------------------------------------------
     structure
     ------------------------------------------------------------------ */

  Hub.KINDS.structure = function (task, mount, api) {
    var linkers = task.linkers.reduce(function (all, group) { return all.concat(group.words); }, []);
    var total = el('p', { class: 'count count-total' });
    var panel = el('div', { class: 'testrun-holder', 'aria-live': 'polite' });
    var ran = false;

    var boxes = task.sections.map(function (spec) {
      var count = el('p', { class: 'count' });
      var aim = 'Aim for ' + spec.range[0] + ' to ' + spec.range[1] + '.';
      var draft = draftArea(task.id + ':' + spec.id, 6, spec.label, function (text) {
        countLine(count, checks.count(text), aim);
        showTotal();
        if (ran) {
          ran = false;
          Hub.clear(panel);
          Hub.add(panel, el('p', { class: 'stale' }, 'You changed your text. Check the report again.'));
        }
      });
      draft.label.appendChild(el('span', { class: 'field-hint' }, spec.hint));
      countLine(count, checks.count(draft.area.value), aim);
      return { spec: spec, area: draft.area, node: el('div', { class: 'section-box' }, draft.label, draft.area, count) };
    });

    function wholeText() {
      return boxes.map(function (box) { return box.spec.label.toUpperCase() + '\n' + box.area.value.trim(); }).join('\n\n');
    }
    function bodyText() {
      return boxes.map(function (box) { return box.area.value; }).join('\n\n');
    }
    function showTotal() {
      countLine(total, checks.count(bodyText()), 'The whole report needs at least ' + task.minTotal + '.');
    }
    showTotal();

    var model = el('div', { class: 'model', hidden: true },
      el('h2', { class: 'small-head' }, 'A model report'),
      el('p', { class: 'model-title' }, task.model.title),
      task.sections.map(function (spec) { return ui.quote(spec.label, task.model.sections[spec.id], 'quote-model'); }));
    var modelButton = el('button', { type: 'button', class: 'btn', hidden: true, onclick: function () {
      model.hidden = false;
      modelButton.hidden = true;
    } }, 'Show a model report');

    function run() {
      var n = checks.count(bodyText());
      Hub.clear(panel);
      if (!n) {
        Hub.add(panel, ui.feedback('notyet', 'Nothing to check yet. Write the introduction first.'));
        return;
      }
      ran = true;
      var tests = boxes.map(function (box) {
        return { id: box.spec.id, name: box.spec.label, auto: checks.section(box.spec, box.area.value, linkers), ask: null };
      });
      tests.push({ id: 'style', name: 'Academic style', auto: checks.style(bodyText()), ask: null });
      tests.push({ id: 'length', name: 'Length', ask: null, auto: [n >= task.minTotal
        ? { state: 'ok', text: n + ' words: at least ' + task.minTotal + '.' }
        : { state: 'bad', text: n + ' words. The report needs at least ' + task.minTotal + '.' }] });
      Hub.add(panel, ui.testRun(tests, function (allPass) { if (allPass) api.done(); },
        { title: 'Structure check', noun: 'checks', heading: 'h2' }));
      if (model.hidden) modelButton.hidden = false;
    }

    Hub.add(mount, [
      el('div', { class: 'bank bank-groups' },
        el('p', { class: 'bank-label' }, 'Linking words'),
        task.linkers.map(function (group) {
          return el('p', { class: 'bank-group' }, el('strong', null, group.head + ': '), group.words.join(', '));
        })),
      el('div', { class: 'section-boxes' }, boxes.map(function (box) { return box.node; })),
      total,
      el('div', { class: 'actions' },
        el('button', { type: 'button', class: 'btn btn-primary', onclick: run }, 'Check my report'),
        modelButton),
      panel,
      ui.exportButtons('my report', 'my-report.txt', wholeText),
      model
    ]);
  };
})();
