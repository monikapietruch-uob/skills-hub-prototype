/*
  js/core.js — the parts every page shares.

  1. Hub        one global object. Every other script adds to it, so the
                site has one name in the global scope instead of fifty.
  2. Hub.el()   builds page elements without writing HTML in strings.
  3. Hub.store  remembers finished tasks and unfinished writing in this
                browser (localStorage), under one key.
  4. Hub.shell  draws the black bar, the red menu and the footer, so they
                are written once here and not copied into four HTML files.

  Plain script, no modules: it runs when the browser reaches the
  <script> tag, and it works when index.html is opened from a folder.
*/
(function () {
  'use strict';

  var Hub = window.Hub = window.Hub || {};

  Hub.BLOCKS = Hub.BLOCKS || {};   // filled by data/paraphrasing.js, data/summarising.js, data/reports.js
  Hub.KINDS = Hub.KINDS || {};     // filled by js/kinds-quick.js and js/kinds-writing.js

  // The order of the blocks on the home page and in the menu.
  Hub.BLOCK_ORDER = ['paraphrasing', 'summarising', 'reports'];

  /* ------------------------------------------------------------------
     2. Hub.el(tag, attributes, ...children)

     Hub.el('p', { class: 'note' }, 'Hello ', Hub.el('b', null, 'you'))
     makes <p class="note">Hello <b>you</b></p>.

     Text always goes in as text, never as HTML, so whatever a student
     types can be shown on the page safely.
     ------------------------------------------------------------------ */
  Hub.el = function (tag, attrs) {
    var node = document.createElement(tag);
    var key, value, i;
    if (attrs) {
      for (key in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, key)) continue;
        value = attrs[key];
        if (value === null || value === undefined || value === false) continue;
        if (key === 'class') node.className = value;
        else if (key === 'text') node.textContent = value;
        else if (key.slice(0, 2) === 'on') node.addEventListener(key.slice(2), value);
        else if (value === true) node.setAttribute(key, '');
        else node.setAttribute(key, value);
      }
    }
    for (i = 2; i < arguments.length; i++) Hub.add(node, arguments[i]);
    return node;
  };

  // Hub.add(parent, child): child can be an element, a piece of text, or a list of them.
  Hub.add = function (node, child) {
    if (child === null || child === undefined || child === false) return node;
    if (Array.isArray(child)) {
      child.forEach(function (one) { Hub.add(node, one); });
      return node;
    }
    if (typeof child === 'string' || typeof child === 'number') {
      node.appendChild(document.createTextNode(String(child)));
    } else {
      node.appendChild(child);
    }
    return node;
  };

  Hub.clear = function (node) {
    while (node.firstChild) node.removeChild(node.firstChild);
    return node;
  };

  /* ------------------------------------------------------------------
     3. Hub.store — what this browser remembers

     One localStorage key holds one object:
       { done:   { 'para-swap': true, ... },
         drafts: { 'para-format:0': 'As Karel the robot…', ... } }

     The tech hub lives at the same web address, so this site needs a key
     of its own. Every read and write sits in try/catch: in a private
     window, or with storage switched off, the site still works and
     simply forgets.
     ------------------------------------------------------------------ */
  var STORAGE_KEY = 'skillsHubPrototype.v1';
  var memory = { done: {}, drafts: {} };

  function load() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      memory.done = saved.done || {};
      memory.drafts = saved.drafts || {};
    } catch (error) { /* nothing saved, or storage is off */ }
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
    } catch (error) { /* storage is off or full: carry on without it */ }
  }

  load();

  Hub.store = {
    isDone: function (taskId) { return !!memory.done[taskId]; },
    setDone: function (taskId) { memory.done[taskId] = true; save(); },
    draft: function (key) { return memory.drafts[key] || ''; },
    setDraft: function (key, text) {
      if (text) memory.drafts[key] = text; else delete memory.drafts[key];
      save();
    },
    countDone: function (block) {
      return block.tasks.filter(function (task) { return memory.done[task.id]; }).length;
    },
    clear: function () { memory = { done: {}, drafts: {} }; save(); }
  };

  /* ------------------------------------------------------------------
     4. Hub.shell() — the black bar, the red menu, the footer

     Each HTML page has <body data-page="…"> and an empty <main id="main">.
     shell() puts the header before <main> and the footer after it.
     ------------------------------------------------------------------ */
  Hub.PAGES = [
    { id: 'home', href: 'index.html', label: 'Home' },
    { id: 'paraphrasing', href: 'paraphrasing.html', label: 'Paraphrasing' },
    { id: 'summarising', href: 'summarising.html', label: 'Summarising' },
    { id: 'reports', href: 'reports.html', label: 'Report writing' }
  ];

  Hub.shell = function () {
    var el = Hub.el;
    var body = document.body;
    var main = document.getElementById('main');
    var current = body.getAttribute('data-page');

    var skip = el('a', { class: 'skip', href: '#main' }, 'Skip to the content');

    var topbar = el('header', { class: 'topbar' },
      el('div', { class: 'wrap' },
        el('a', { class: 'brand', href: 'index.html' },
          // Official artwork, never redrawn or recoloured (brand guide, pages 8 and 17).
          el('img', { src: 'assets/uob-logo.png', alt: 'University of Bedfordshire', width: '117', height: '37' }),
          el('span', { class: 'brand-words' },
            el('span', null, 'CEFL tech group'),
            el('span', null, 'Skills Practice Hub'))),
        el('p', { class: 'topnote' }, 'Prototype, November 2026')));

    var nav = el('nav', { class: 'nav', 'aria-label': 'Main' },
      el('div', { class: 'wrap' },
        Hub.PAGES.map(function (page) {
          return el('a', {
            href: page.href,
            'aria-current': page.id === current ? 'page' : null
          }, page.label);
        })));

    // "Clear my saved work" asks once more on the page itself, not in a pop-up box.
    var clearArea = el('div', { class: 'footer-clear' });
    function drawClear(asking) {
      Hub.clear(clearArea);
      if (!asking) {
        Hub.add(clearArea, el('button', { type: 'button', class: 'linklike', onclick: function () { drawClear(true); } },
          'Clear my saved work'));
        return;
      }
      Hub.add(clearArea, [
        el('span', null, 'Clear every tick and every draft in this browser? '),
        el('button', { type: 'button', class: 'linklike', onclick: function () { Hub.store.clear(); window.location.reload(); } }, 'Yes, clear it'),
        ' ',
        el('button', { type: 'button', class: 'linklike', onclick: function () { drawClear(false); } }, 'No, keep it')
      ]);
    }
    drawClear(false);

    var footer = el('footer', { class: 'footer' },
      el('div', { class: 'wrap' },
        el('p', { class: 'footer-title' }, 'Skills Practice Hub ', el('span', null, 'Write it.')),
        el('p', { class: 'footer-credit' },
          'Academic Skills Foundation, technology pathway. Centre for English as a Foreign Language, ',
          'University of Bedfordshire. This is a prototype: a small sample of the tasks.'),
        el('div', { class: 'footer-row' },
          el('p', null, 'Your work is saved in this browser only. A lab computer forgets it when you log out.'),
          clearArea)));

    body.insertBefore(nav, main);
    body.insertBefore(topbar, nav);
    body.insertBefore(skip, topbar);
    body.appendChild(footer);
  };

  // "3 of 7 done" — used on the home page, the block page and the task list.
  Hub.progressText = function (block) {
    return Hub.store.countDone(block) + ' of ' + block.tasks.length + ' done';
  };
})();
