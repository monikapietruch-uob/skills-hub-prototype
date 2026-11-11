/*
  js/home.js — the home page.

  The words of the home page are in index.html. This script adds the
  shared header and footer, and fills in the numbers that depend on the
  data files and on what this browser remembers:

    <span data-count="paraphrasing"></span>     ->  "7 tasks"
    <span data-progress="paraphrasing"></span>  ->  "3 of 7 done"
    <span data-total></span>                    ->  "19"
*/
(function () {
  'use strict';

  var Hub = window.Hub;

  Hub.shell();

  var total = 0;
  Hub.BLOCK_ORDER.forEach(function (id) {
    var block = Hub.BLOCKS[id];
    total += block.tasks.length;
    document.querySelectorAll('[data-count="' + id + '"]').forEach(function (node) {
      node.textContent = block.tasks.length + ' tasks';
    });
    document.querySelectorAll('[data-progress="' + id + '"]').forEach(function (node) {
      node.textContent = Hub.progressText(block);
    });
  });
  document.querySelectorAll('[data-total]').forEach(function (node) { node.textContent = String(total); });
})();
