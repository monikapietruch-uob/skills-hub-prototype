/*
  tests/checks.test.js — does the checker agree with the answer keys?

  Run it from the repository folder:   node tests/checks.test.js

  It needs nothing but Node. The idea is simple: every model answer from
  the slides must pass the automatic checks, and every known bad answer
  (Karel's attempts, the summary that copies, the summary that comments)
  must fail them. If you change a limit in js/checks.js or a text in
  data/, run this again.
*/
const test = require('node:test');
const assert = require('node:assert');

// The site's scripts expect a browser, where the global object is called "window".
globalThis.window = globalThis;
const checks = require('../js/checks.js');
require('../data/paraphrasing.js');
require('../data/summarising.js');
require('../data/reports.js');
const BLOCKS = globalThis.Hub.BLOCKS;

const task = (block, id) => BLOCKS[block].tasks.find((t) => t.id === id);
const failed = (tests) => tests.filter((t) => t.auto.some((f) => f.state === 'bad')).map((t) => t.id);
const amber = (tests) => tests.flatMap((t) => t.auto.filter((f) => f.state === 'maybe').map((f) => f.text));

test('words are counted the way a person counts them', () => {
  assert.strictEqual(checks.count('The drone stopped. Its battery – sadly – was empty!'), 8);
  assert.strictEqual(checks.count('first-year students don’t save'), 4);
  assert.strictEqual(checks.count(''), 0);
});

test('the stemmer treats different endings as one word', () => {
  for (const [a, b] of [['loop', 'loops'], ['test', 'testing'], ['copy', 'copied'], ['use', 'used'],
    ['run', 'running'], ['make', 'making'], ['error', 'errors'], ['stop', 'stopped']]) {
    assert.strictEqual(checks.stem(a), checks.stem(b), a + ' / ' + b);
  }
  assert.notStrictEqual(checks.stem('loop'), checks.stem('circle'));
});

test('every model paraphrase passes the automatic checks, with no amber note', () => {
  for (const t of BLOCKS.paraphrasing.tasks.filter((x) => x.kind === 'paraphrase')) {
    for (const item of t.items) {
      for (const model of item.models) {
        const result = checks.paraphrase(item, model, { factsCounted: item.facts });
        assert.deepStrictEqual(failed(result), [], t.id + ': ' + model + '\n' + JSON.stringify(result, null, 1));
        assert.deepStrictEqual(amber(result), [], t.id + ': a model answer should not even get an amber note: ' + model);
      }
    }
  }
});

test('copying the source fails "Changes"', () => {
  for (const t of BLOCKS.paraphrasing.tasks.filter((x) => x.kind === 'paraphrase')) {
    for (const item of t.items) {
      assert.ok(failed(checks.paraphrase(item, item.source)).includes('changes'), item.source);
    }
  }
});

test("Karel's attempts fail where the answer key says they fail", () => {
  const bugs = task('paraphrasing', 'para-bugs').items;
  const run = (n) => checks.paraphrase({ source: bugs[n].source }, bugs[n].attempt);
  assert.ok(failed(run(0)).includes('changes'), 'one word changed is too close');
  assert.ok(failed(run(1)).includes('changes'), 'a for circle is a dictionary disaster');
  assert.ok(failed(run(3)).includes('information'), 'the reason is missing: much shorter');
  assert.ok(failed(run(5)).includes('changes'), 'an insect is a dictionary disaster');
  assert.deepStrictEqual(failed(run(6)), [], 'the good paraphrase passes');
});

test('small words, numbers and technical terms are noticed', () => {
  const karel = task('paraphrasing', 'para-format').items[0];
  const withoutOnly = 'As Karel the robot is able to turn left, it has to make three left turns in order to turn right.';
  assert.ok(amber(checks.paraphrase(karel, withoutOnly)).some((text) => text.includes('"only"')));
  const withoutThree = 'As Karel the robot is only able to turn left, it has to make several left turns in order to turn right.';
  assert.ok(amber(checks.paraphrase(karel, withoutThree)).some((text) => text.includes('number 3')));

  const loops = task('paraphrasing', 'para-guided').items[0];
  const noTerm = 'A lot of students find it challenging to understand this kind of repetition at the beginning.';
  assert.ok(failed(checks.paraphrase(loops, noTerm)).includes('changes'));
});

test('a long copied stretch is noticed even when it is full of technical terms', () => {
  const karel = task('paraphrasing', 'para-format').items[0];
  const halfCopied = 'Karel the robot can only turn left so it needs three left turns.';
  const result = checks.paraphrase(karel, halfCopied);
  assert.ok(amber(result).some((text) => text.includes('karel the robot can only turn left so')), JSON.stringify(result[2]));
  // …but a technical term on its own is never a problem
  assert.deepStrictEqual(amber(checks.paraphrase(karel, karel.models[0])), []);
});

test('grammar traps from the slides are caught', () => {
  const item = { source: 'Good programmers discuss their ideas with the team.' };
  const result = checks.paraphrase(item, 'Skilled developers discuss about their ideas with the team.');
  assert.ok(failed(result).includes('grammar'));
});

test('both model summaries pass, inside their word range', () => {
  for (const id of ['sum-https', 'sum-enter']) {
    const t = task('summarising', id);
    const result = checks.summary(t, t.model);
    assert.deepStrictEqual(failed(result), [], id + '\n' + JSON.stringify(result, null, 1));
    assert.deepStrictEqual(amber(result), [], id + ' should find every main idea in its own model');
    const n = checks.count(t.model);
    assert.ok(n >= t.range[0] && n <= t.range[1], id + ' model has ' + n + ' words');
  }
});

test('the word ranges are about a third of the source', () => {
  for (const id of ['sum-https', 'sum-enter']) {
    const t = task('summarising', id);
    const third = checks.count(t.source.text) / 3;
    assert.ok(t.range[0] <= third && third <= t.range[1], id + ': a third is ' + Math.round(third) + ' words');
  }
});

test('a summary that copies, and a summary that comments, both fail', () => {
  const three = task('summarising', 'sum-three');
  const ux = { source: { text: three.passage.paragraphs.join(' '), noun: 'text' }, range: [30, 60] };
  const copies = checks.summary(ux, three.items[0].attempt);
  const comments = checks.summary(ux, three.items[1].attempt);
  const winner = checks.summary(ux, three.items[2].attempt);
  assert.ok(failed(copies).includes('own'), 'Summary A copies');
  assert.ok(failed(comments).includes('added'), 'Summary B gives opinions');
  assert.deepStrictEqual(failed(winner), [], 'Summary C passes');
});

test('the talk and the version for the computer voice say the same thing', () => {
  const t = task('summarising', 'sum-enter');
  const plain = checks.count(t.source.text);
  const spoken = checks.count(t.source.say);
  // The spoken version spells out letters (D N S, H T M L), so it is a little longer.
  assert.ok(Math.abs(plain - spoken) < 25, plain + ' words written, ' + spoken + ' words spoken');
});

test('the model report passes its own structure checker', () => {
  const t = task('reports', 'rep-structure');
  const linkers = t.linkers.flatMap((group) => group.words);
  let total = 0;
  for (const spec of t.sections) {
    const text = t.model.sections[spec.id];
    const findings = checks.section(spec, text, linkers);
    assert.deepStrictEqual(findings.filter((f) => f.state === 'bad'), [], spec.label);
    total += checks.count(text);
  }
  assert.ok(total >= t.minTotal, 'the model has ' + total + ' words');
  const whole = t.sections.map((spec) => t.model.sections[spec.id]).join('\n\n');
  assert.deepStrictEqual(checks.style(whole).filter((f) => f.state !== 'ok'), []);
});

test('report style: opinion and short forms are caught', () => {
  assert.ok(checks.style('I think the labs don’t work.').filter((f) => f.state === 'bad').length === 2);
});

test('the proofreading paragraph has eight mistakes, and fixing them gives the model paragraph', () => {
  const proof = task('reports', 'rep-proof');
  const marks = proof.text.match(/\{[^}]+\}/g);
  assert.strictEqual(marks.length, 8);
  const fixed = proof.text.replace(/\{([^|}]+)\|([^|}]+)\|[^}]+\}/g, (all, wrong, right) => right.split('/')[0]);
  assert.strictEqual(fixed, task('reports', 'rep-structure').model.sections.problem);
});

test('every gap accepts the phrase the bank offers for it', () => {
  const links = task('reports', 'rep-links');
  links.items.forEach((item, n) => {
    assert.ok(item.accept.includes(links.bank[n].toLowerCase()), 'gap ' + (n + 1));
  });
});

test('task ids are unique and every task has a kind the site knows', () => {
  const kinds = ['choice', 'match', 'gap', 'order', 'proofread', 'paraphrase', 'summary', 'planner', 'structure'];
  const seen = new Set();
  for (const block of Object.values(BLOCKS)) {
    for (const t of block.tasks) {
      assert.ok(!seen.has(t.id), 'two tasks are called ' + t.id);
      seen.add(t.id);
      assert.ok(kinds.includes(t.kind), t.id + ' has the unknown kind ' + t.kind);
    }
  }
});
