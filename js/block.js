/*
  js/block.js — one block page (paraphrasing.html, summarising.html, reports.html).

  The three pages are the same file with a different data-block on <body>.
  This script reads that name, finds the block in Hub.BLOCKS and draws one
  of two screens into <main id="main">:

    the list   page head, the rules, the task list      address ends  …html
    one task   task bar, brief, the activity            address ends  …html#/task-id

  The part after # is the "route". Changing it does not reload the page:
  the browser fires "hashchange" and route() redraws <main>.
*/
(function () {
  'use strict';

  var Hub = window.Hub;
  var el = Hub.el;

  Hub.shell();

  var main = document.getElementById('main');
  var block = Hub.BLOCKS[document.body.getAttribute('data-block')];

  var KIND_LABEL = {
    choice: 'Choose', match: 'Match', gap: 'Fill the gaps', order: 'Put in order', proofread: 'Find and fix',
    paraphrase: 'Write', summary: 'Notes and summary', planner: 'Plan', structure: 'Write'
  };

  /* ---------------- the rule cards ---------------- */

  var RULE = {
    columns: function (card) {
      return el('div', { class: 'rule-columns' }, card.columns.map(function (column) {
        return el('div', { class: 'rule-column' },
          el('h4', null, column.head),
          el('ul', null, column.points.map(function (point) { return el('li', null, point); })));
      }));
    },
    flow: function (card) {
      return el('ol', { class: 'rule-flow' + (card.joiner ? ' rule-flow-plus' : '') }, card.steps.map(function (step) {
        return el('li', null,
          el('h4', null, step.head),
          el('ul', null, step.lines.map(function (line) { return el('li', null, line); })));
      }));
    },
    list: function (card) {
      return el(card.numbered ? 'ol' : 'ul', { class: 'rule-list' + (card.numbered ? ' is-numbered' : '') }, card.items.map(function (item) {
        return el('li', null, el('strong', null, item.head), el('span', null, item.text));
      }));
    },
    table: function (card) {
      return el('div', { class: 'rule-table-wrap' },
        el('table', { class: 'rule-table' },
          el('thead', null, el('tr', null, card.columns.map(function (head) { return el('th', { scope: 'col' }, head); }))),
          el('tbody', null, card.rows.map(function (row) {
            return el('tr', null, row.map(function (cell, i) { return el(i === 0 ? 'th' : 'td', i === 0 ? { scope: 'row' } : null, cell); }));
          }))));
    },
    note: function (card) {
      return el('p', { class: 'rule-note' }, card.text);
    }
  };

  function ruleCards() {
    return el('div', { class: 'rule-grid' }, block.rules.map(function (card) {
      return el('section', { class: 'rule' + (card.wide ? ' is-wide' : '') },
        el('h3', null, card.title),
        RULE[card.type](card),
        card.foot ? el('p', { class: 'rule-foot' }, card.foot) : null);
    }));
  }

  /* ---------------- screen 1: the list ---------------- */

  function showList() {
    document.title = block.title + ' – Skills Practice Hub';

    var done = Hub.store.countDone(block);
    var head = el('section', { class: 'pagehead' },
      el('div', { class: 'wrap' },
        el('p', { class: 'pagehead-meta' }, el('span', null, block.weeks), el('span', null, block.goal)),
        el('h1', { tabindex: '-1' }, block.title),
        el('p', { class: 'pagehead-intro' }, block.intro),
        el('p', { class: 'pagehead-progress' },
          el('span', { class: 'meter', 'aria-hidden': 'true' },
            block.tasks.map(function (task) { return el('span', { class: Hub.store.isDone(task.id) ? 'is-done' : null }); })),
          el('span', null, Hub.progressText(block) + (done === block.tasks.length ? '. Every task finished.' : '')),
          el('a', { class: 'pagehead-jump', href: '#rules' }, 'Read the rules first'))));

    var rules = el('section', { class: 'rules', id: 'rules' },
      el('div', { class: 'wrap' },
        el('details', { class: 'rules-fold', open: true },
          el('summary', null, el('h2', null, 'The rules'),
            el('span', { class: 'fold-hint' }, block.rulesNote || 'From the slides. They are also inside every task.')),
          ruleCards())));

    // Tasks are listed under their group name, in the order they appear in the data file.
    var groups = [];
    block.tasks.forEach(function (task, index) {
      var last = groups[groups.length - 1];
      if (!last || last.name !== task.group) { last = { name: task.group, tasks: [] }; groups.push(last); }
      last.tasks.push({ task: task, number: index + 1 });
    });

    var tasks = el('section', { class: 'tasks' },
      el('div', { class: 'wrap' },
        el('h2', null, 'The tasks'),
        groups.map(function (group) {
          return el('div', { class: 'group' },
            el('h3', null, group.name),
            el('ol', { class: 'tasklist' }, group.tasks.map(function (entry) {
              var task = entry.task;
              var isDone = Hub.store.isDone(task.id);
              return el('li', null,
                el('a', { class: 'taskrow' + (isDone ? ' is-done' : ''), href: '#/' + task.id },
                  el('span', { class: 'taskrow-n' }, String(entry.number)),
                  el('span', { class: 'taskrow-main' },
                    el('span', { class: 'taskrow-title' }, task.title),
                    el('span', { class: 'taskrow-does' }, task.does)),
                  el('span', { class: 'taskrow-kind' }, KIND_LABEL[task.kind]),
                  el('span', { class: 'taskrow-time' }, task.minutes + ' min'),
                  el('span', { class: 'taskrow-state' }, isDone ? 'Done ✓' : 'Start')));
            })));
        }),
        el('p', { class: 'sockline' }, block.sockLine)));

    Hub.add(Hub.clear(main), [head, tasks, rules]);
  }

  /* ---------------- screen 2: one task ---------------- */

  function showTask(task) {
    var index = block.tasks.indexOf(task);
    var previous = block.tasks[index - 1];
    var next = block.tasks[index + 1];
    var listHref = '#/';

    document.title = task.title + ' – ' + block.title + ' – Skills Practice Hub';

    var bar = el('div', { class: 'taskbar' },
      el('div', { class: 'wrap' },
        el('a', { class: 'taskbar-back', href: listHref }, 'All ' + block.title.toLowerCase() + ' tasks'),
        el('span', { class: 'taskbar-where' }, 'Task ' + (index + 1) + ' of ' + block.tasks.length),
        el('span', { class: 'taskbar-nav' },
          previous ? el('a', { href: '#/' + previous.id }, 'Previous') : el('span', { class: 'is-off' }, 'Previous'),
          next ? el('a', { href: '#/' + next.id }, 'Next') : el('span', { class: 'is-off' }, 'Next'))));

    var doneBox = el('div', { class: 'task-done', hidden: true, 'aria-live': 'polite' });
    var finished = false;

    // Every kind calls api.done() when the student has finished. Calling it twice is harmless.
    var api = {
      done: function () {
        if (finished) return;
        finished = true;
        Hub.store.setDone(task.id);
        Hub.add(doneBox, [
          el('p', { class: 'task-done-title' }, 'Task done'),
          el('p', null, Hub.progressText(block) + ' in ' + block.title.toLowerCase() + '.'),
          el('div', { class: 'actions' },
            next ? el('a', { class: 'btn btn-primary', href: '#/' + next.id }, 'Next task: ' + next.title) : null,
            el('a', { class: 'btn', href: listHref }, 'Back to the task list'))
        ]);
        doneBox.hidden = false;
      }
    };

    var activity = el('div', { class: 'activity kind-' + task.kind });

    var article = el('article', { class: 'task' },
      el('div', { class: 'wrap' },
        el('header', { class: 'task-head' },
          el('p', { class: 'task-meta' },
            el('span', null, task.group), el('span', null, KIND_LABEL[task.kind]), el('span', null, 'about ' + task.minutes + ' minutes'),
            Hub.store.isDone(task.id) ? el('span', { class: 'task-meta-done' }, 'Done before ✓') : null),
          el('h1', { tabindex: '-1' }, task.title),
          el('div', { class: 'brief' }, task.brief.map(function (paragraph) { return el('p', null, paragraph); }))),
        el('details', { class: 'rules-drawer' },
          el('summary', null, el('h2', null, 'The rules for ' + block.title.toLowerCase())),
          ruleCards()),
        activity,
        doneBox));

    Hub.add(Hub.clear(main), [bar, article]);
    Hub.KINDS[task.kind](task, activity, api);
  }

  /* ---------------- the router ---------------- */

  var drawn = false;

  function route() {
    var hash = window.location.hash;
    // "#main" is the skip link, not a route: leave the screen as it is.
    if (drawn && hash && hash.slice(0, 2) !== '#/') return;

    var id = hash.slice(0, 2) === '#/' ? decodeURIComponent(hash.slice(2)) : '';
    var task = block.tasks.filter(function (one) { return one.id === id; })[0];

    if (window.speechSynthesis) window.speechSynthesis.cancel();   // stop a talk that is still playing
    if (task) showTask(task); else showList();

    window.scrollTo(0, 0);
    if (drawn) {
      var heading = main.querySelector('h1');
      if (heading) heading.focus({ preventScroll: true });
    }
    drawn = true;
  }

  window.addEventListener('hashchange', route);
  route();
})();
