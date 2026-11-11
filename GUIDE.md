# How the prototype works

A guide to the code of the Skills Practice Hub prototype, written to be read
with the files open next to it. It goes in the order the browser goes: a page
loads, a task list is drawn, a task is opened, an answer is checked, the
result is saved.

Sizes, so you know what you are facing: about 2,100 lines of JavaScript, 530
of CSS, 1,100 of content in `data/`. The longest file is 713 lines.

Contents

1. The idea in one picture
2. What happens when a page loads
3. `js/core.js`: the shared parts
4. The content: `data/*.js`
5. `js/block.js`: the list and the task
6. The task kinds
7. `js/checks.js`: what the site can test
8. The look: `css/site.css`
9. Saved work
10. Tests
11. How to add things
12. What is missing on purpose
13. What could come next
14. Words used in this guide

---

## 1. The idea in one picture

```
data/paraphrasing.js      WHAT       the rules and the tasks, as plain data
        │
        ▼
js/block.js               WHERE      draws the task list, or opens one task
        │   "this task's kind is 'gap'"
        ▼
js/kinds-quick.js         HOW        one function per kind of task
js/kinds-writing.js                  (choice, match, gap, order, proofread,
        │                             paraphrase, summary, planner, structure)
        │   "is this paraphrase too close?"
        ▼
js/checks.js              JUDGE      pure functions: text in, findings out
        │
        ▼
js/core.js                REMEMBER   Hub.store saves "done" and drafts
```

Three rules hold the design together:

- **Content is data.** A task is an object in a file in `data/`. No task has
  its own HTML page or its own code.
- **One function per kind.** Every kind of task is one function with the same
  three arguments. The page does not know how a kind works; it only calls it.
- **Checking is separate from drawing.** `js/checks.js` never touches the
  page, so it can be tested in Node without a browser.

It is the shape you decided on for the rebuilt Tech Practice Hub (one page
shell, one task format, one progress store, one checker), tried out small.

---

## 2. What happens when a page loads

Open `paraphrasing.html`. It is almost empty:

```html
<body data-page="paraphrasing" data-block="paraphrasing">
<main id="main" tabindex="-1"></main>

<script src="js/core.js"></script>
<script src="js/checks.js"></script>
<script src="js/kinds-quick.js"></script>
<script src="js/kinds-writing.js"></script>
<script src="data/paraphrasing.js"></script>
<script src="js/block.js"></script>
```

The browser runs the scripts from top to bottom, one after another. The order
matters, because each one uses what the ones above it created:

| Script | What it adds |
|---|---|
| `core.js` | the object `Hub`, with `Hub.el`, `Hub.store`, `Hub.shell` |
| `checks.js` | `Hub.checks` |
| `kinds-quick.js` | `Hub.ui` and five entries in `Hub.KINDS` |
| `kinds-writing.js` | four more entries in `Hub.KINDS` (it uses `Hub.ui` and `Hub.checks`) |
| `data/paraphrasing.js` | `Hub.BLOCKS.paraphrasing` |
| `block.js` | nothing new: it starts the page |

`summarising.html` and `reports.html` are the same file with a different
name in `data-block` and a different data script. That is the whole
difference between the three block pages.

### Why plain scripts and one global object

These are plain `<script>` tags, not ES modules (your decision 7 for the
rebuild). Two consequences:

- The site works when you double-click `index.html`. Modules and `fetch()`
  are both blocked on `file://` pages, which is why the Tech Practice Hub
  needs `python3 -m http.server`.
- Every script shares one global scope. To avoid fifty global names, every
  script puts its things on one object, `Hub`.

Every file is wrapped like this:

```js
(function () {
  'use strict';
  var Hub = window.Hub;
  // … everything else …
})();
```

This is a function that is defined and called at once (an IIFE). Variables
declared inside it are private to the file. Only what is attached to `Hub`
can be seen from other files. `'use strict'` makes the browser complain
about mistakes that it would otherwise ignore, such as assigning to a
variable that was never declared.

The code uses `var` and `function () {}` instead of `let`, `const` and arrow
functions. That is a style choice to keep it close to the code of the
current hub; nothing depends on it.

---

## 3. `js/core.js`: the shared parts

### `Hub.el`: building the page without HTML strings

Almost every line that draws something uses this one helper:

```js
Hub.el('p', { class: 'note' }, 'Hello ', Hub.el('b', null, 'you'))
// makes  <p class="note">Hello <b>you</b></p>
```

First the tag, then an object of attributes, then any number of children. A
child can be text, another element, a list of those, or `null` (ignored,
which is handy for "show this only if…").

Three special cases in the attributes:

- `class` sets the class.
- A name that starts with `on` adds an event listener:
  `{ onclick: function () { … } }`.
- `true` writes the attribute with no value (`hidden`, `disabled`); `false`,
  `null` and `undefined` leave it out.

Why not `innerHTML` with a string? Because students type text that is then
shown on the page ("You picked …"). With `el`, text always goes in as text,
so nothing a student types can turn into HTML.

### `Hub.store`: what the browser remembers

See section 9.

### `Hub.shell`: header, menu and footer

Each HTML file has only `<main>`. `Hub.shell()` builds the black bar, the red
menu and the footer and puts them around it. The menu is made from the list
`Hub.PAGES`; the current page gets `aria-current="page"`, which the CSS
turns dark red. The idea is the same as `js/layout.js` in the current hub.

"Clear my saved work" does not use `confirm()`. It redraws itself as a
question with two buttons on the page. Pop-up boxes stop everything else and
cannot be styled.

---

## 4. The content: `data/*.js`

A block is one object:

```js
Hub.BLOCKS.paraphrasing = {
  id: 'paraphrasing',
  title: 'Paraphrasing',
  weeks: 'Weeks 2 to 4',
  goal: 'Portfolio task 1',
  intro: '…one or two sentences for the page head…',
  sockLine: '…the line at the end of the task list…',
  rules: [ /* rule cards */ ],
  tasks: [ /* tasks */ ]
};
```

### Rule cards

The rules are a list of cards. There are five types, enough for everything
on the slides:

| `type` | What it draws | Fields |
|---|---|---|
| `columns` | boxes side by side (Accurate / Your own English; Do / Don't) | `columns: [{ head, points: [] }]` |
| `flow` | boxes joined by arrows (Input → Process → Output → Tests) | `steps: [{ head, lines: [] }]`, `joiner: '+'` for plus signs |
| `list` | a name and an explanation on each line | `items: [{ head, text }]`, `numbered: true` |
| `table` | a table | `columns: []`, `rows: [[]]` |
| `note` | one paragraph | `text` |

Every card has a `title`, and can have `wide: true` (full width) and a
`foot` (a grey line at the bottom).

### Tasks

Every task has the same first fields:

```js
{
  id: 'para-swap',          // unique on the whole site; also the address: paraphrasing.html#/para-swap
  group: 'Toolkit',         // the heading it sits under in the task list
  kind: 'match',            // which function draws it
  title: 'The explanation swap',
  minutes: 5,
  does: 'One line for the task list.',
  brief: ['A paragraph of instructions.', 'A second one if needed.'],
  // …then the fields of its kind…
}
```

The fields of each kind:

| `kind` | Fields |
|---|---|
| `choice` | `items: [{ source, attempt, prompt, options, answer, why, reasons }]`. `options` can sit on the task (the same for every item) or on the item. `answer` is a position in `options`, counted from 0. `reasons: { 0: '…' }` gives a wrong option its own message. Optional `passage: { title, paragraphs, open }` for a text to read. |
| `match` | `leftLabel`, `rightLabel`, `pairs: [{ left, right }]` |
| `gap` | `items: [{ before, after, accept: [] }]`, optional `bank: []` |
| `order` | `items: [{ label, text }]` in the right order, and `start: [3, 0, 5, …]`, the mixed order shown first |
| `proofread` | `text` with marks like `{is reset\|are reset\|verb\|why}`, and `types: { verb: 'Verb forms', … }` |
| `paraphrase` | `guided: true` or not, and `items: [{ label, source, change, keep, allow, mustKeep, facts, tries, models, watch, tip, understand }]` |
| `summary` | `source: { type: 'text' or 'talk', noun, title, text, say }`, `frame`, `range: [min, max]`, `keep`, `ideas`, `details`, `modelNotes`, `model`, `kept`, `deleted` |
| `planner` | `fields: [{ id, label, hint, type, options, required }]`, `skeleton: [{ head, words, notes, phrases }]` |
| `structure` | `sections: [{ id, label, range, hint, needs }]`, `linkers`, `minTotal`, `model` |

The fields of a `paraphrase` item are the ones worth understanding, because
they are what the checker reads:

| Field | Meaning | From the slides |
|---|---|---|
| `source` | the sentence, pair or paragraph | |
| `change` | the words that can be changed | "words in red can be changed" |
| `keep` | technical terms that must stay. `['syntax error', 'syntax errors']` means either form will do | "Careful: technical terms" |
| `allow` | phrases that may be copied without counting as copying, for example `'three left turns'` | |
| `mustKeep` | small words that carry meaning: `{ label: 'only', any: ['only', 'just', 'solely'] }` | "Small words carry meaning" |
| `facts` | how many pieces of information a paragraph has | "Count the facts" |
| `tries` | the hints, separated by ` · ` | the "Try:" lines |
| `models` | one or more model answers | the answer slides |
| `watch` | a note shown with the model | the "Watch for…" column |

---

## 5. `js/block.js`: the list and the task

`block.js` draws one of two screens into `<main>`:

- **the list**: page head, task list, rules (`showList`)
- **one task**: task bar, title, brief, the rules folded away, the activity
  (`showTask`)

### The router

Which screen? That is decided by the part of the address after `#`:

```
paraphrasing.html            the list
paraphrasing.html#/para-swap the task with the id 'para-swap'
```

Changing the part after `#` does not reload the page. The browser fires an
event called `hashchange`, and `route()` listens for it:

```js
function route() {
  var hash = window.location.hash;
  if (drawn && hash && hash.slice(0, 2) !== '#/') return;   // "#main", "#rules": not a route

  var id = hash.slice(0, 2) === '#/' ? decodeURIComponent(hash.slice(2)) : '';
  var task = block.tasks.filter(function (one) { return one.id === id; })[0];

  if (task) showTask(task); else showList();
  …
}
window.addEventListener('hashchange', route);
route();
```

So a link to a task is an ordinary link: `<a href="#/para-swap">`. The Back
button works for free, and a task has an address you can put on a slide.

The second line of `route()` matters. The "Skip to the content" link goes to
`#main`, and "Read the rules first" goes to `#rules`. Those are not routes.
Without that line, pressing the skip link in the middle of a task would
redraw the task and lose the student's answers.

### How a task is started

This is the centre of the design, at the end of `showTask`:

```js
Hub.KINDS[task.kind](task, activity, api);
```

`Hub.KINDS` is an object whose values are functions. `task.kind` is a string
such as `'gap'`. So this line looks up the function for this kind and calls
it with three things:

- `task`: the object from the data file
- `activity`: an empty `<div>` to draw into
- `api`: an object with one function, `api.done()`

When the student finishes, the kind calls `api.done()`. That saves the task
as done and shows the green "Task done" box with a link to the next task.
`api.done()` may be called more than once; only the first call counts.

`block.js` knows nothing about gaps or paraphrases, and the kinds know
nothing about the task list. That is why a new kind does not need a change
in `block.js`.

---

## 6. The task kinds

All nine are written the same way. Take the smallest useful one, `match`,
as the model for reading the others:

```js
Hub.KINDS.match = function (task, mount, api) {
  var checks = 0, finished = false;          // 1. state: ordinary variables

  var rows = task.pairs.map(function (pair, i) {   // 2. build the page from the data
    var select = el('select', …);
    …
    return { index: i, select: select, mark: mark, row: row };
  });

  function check() {                         // 3. a function that reads the page and judges
    …
    if (right === rows.length) { …; api.done(); }
  }

  mount.appendChild(…);                      // 4. put it on the page
};
```

1. **State** is kept in variables inside the function. Because `check` is
   defined inside the same function, it can still read and change those
   variables later, when a button is clicked. That is a closure. There is no
   framework and no global state.
2. **The page is built from the data** with `map`: one row for each pair.
   Each row keeps references to its own elements, so `check` does not have
   to search the page for them.
3. **One function judges.**
4. **Then everything is added to `mount`.**

What is particular to each kind:

**choice.** Each question locks when the right answer is clicked. A wrong
option is crossed out and disabled, and the student keeps trying. The score
counts answers that were right the first time. If the options are the same
for every question (`task.options`), they are drawn as a row of short
buttons; if each question has its own, they are stacked with letters.

**match.** The right-hand choices are sorted alphabetically, so their order
gives nothing away, and it is the same on every computer. After three
failed checks a "Show me the answers" button appears.

**gap.** `ui.normalise` makes `'In conclusion, '` and `'in conclusion'`
equal, so capitals, spaces and a final comma do not matter. A click on a
phrase in the bank fills the gap you were in if it is empty, otherwise the
first empty gap.

**order.** The state is one list, `order`, where `order[position]` is the
number of the item shown there. "Move up" swaps two entries and redraws the
list. After the redraw the code puts the keyboard focus back on the line
that moved; without that, a keyboard user would lose their place at every
step.

**proofread.** `parseProof` cuts the marked text into plain pieces and
mistakes. Then *every* word becomes a button, right and wrong alike, so
hovering, tabbing and clicking feel the same for every word and nothing on
the screen gives the mistakes away. A mistake of two words (`is reset`) is
two buttons that both select the same mistake.

**paraphrase.** `drawItem` builds up to four stages for each item. In a
guided task, stages 2 to 4 start with the attribute `hidden` and are opened
one by one. `buildHighlight` turns every word of the source into a switch
(`aria-pressed`), and compares what was picked with `item.change` and
`item.keep`. When the text changes after a test run, the old results are
removed: results that no longer match the text would be worse than none.

**summary.** The same four stages for every summary: read or listen, notes,
write, check. `makePlayer` reads the talk with the browser's speech
synthesis, one sentence at a time. If nothing starts within four seconds
(no voice installed), it gives up and offers the script instead.

**planner.** The skeleton in the data has placeholders such as `{problem}`.
`fill` replaces each one with what the student typed, or with `…`.

**structure.** Each section is checked by `checks.section`, then the whole
text by `checks.style`, then the length. The results are shown in the same
panel as a test run, so the student learns one way of reading results.

### The test run panel

`ui.testRun` (top of `kinds-writing.js`) draws the results for the writing
kinds. Each test has one of three states:

| State | When | Looks like |
|---|---|---|
| Fail | the computer found something wrong | red outline, the word FAIL |
| Your turn | the computer found nothing wrong, and the student has not ticked the test | amber, YOUR TURN |
| Pass | nothing wrong and ticked, or a test with no tick box | green, PASS |

The rule is in one small function, `checks.statusOf`. The tick box of a
failing test is disabled: a student cannot tick their way past a failure.

---

## 7. `js/checks.js`: what the site can test

This is the file to read most carefully, because it decides what students
are told about their writing. It has no page code in it. Every function
takes text and returns facts.

### The building blocks

| Function | What it does |
|---|---|
| `words(text)` | lower case, then a list of words: `'The drone STOPPED.'` → `['the', 'drone', 'stopped']` |
| `count(text)` | how many words |
| `stem(word)` | cuts endings so that `loop`/`loops`, `test`/`testing`, `copy`/`copied` compare as equal. The result is not always a word (`'giv'`); it only has to be the same for both forms |
| `hasPhrase(text, phrase)` | is the phrase in the text? Compared by stem, so `'while loop'` finds "while loops" |
| `hasExact(text, phrase)` | the same, but the exact word forms |
| `copiedRuns(source, answer, allow)` | runs of three or more words that are in both, in the same order |
| `overlap(source, answer, allow)` | how many of the answer's key words are also in the source |
| `numbersIn(text)` | digits and number words: `'three'` and `'3'` both give `'3'` |

"Key words" means everything except small grammar words (the list `STOP`:
the, of, it, can, only…) and allowed phrases.

### A paraphrase: four test cases

`checks.paraphrase(item, answer)` returns your four test cases. What the
computer does in each:

| Test | The computer checks | The student ticks |
|---|---|---|
| 1 Meaning | nothing: it cannot | same meaning: cause and effect, order, certainty |
| 2 Information | length; every number in the source is still there; each `mustKeep` idea is still there; the fact count | every fact is there |
| 3 Changes | technical terms kept; no dictionary disaster; not copied; the `change` words were changed; the share of key words that are the same | the grammar changed too |
| 4 Grammar | three traps from the slides ("discuss about", "enable to", "do a mistake"); a capital letter and a full stop | accurate sentences |

A finding has one of three states: `ok`, `bad` (fails the test) or `maybe`
(amber: the computer is not sure, so it asks).

How "too close" is decided, in this order:

1. The answer is the source: fail.
2. A long copied run: fail at weight 6, amber at weight 4. In the weight, an
   ordinary word counts 1 and a word of a technical term counts a half. So
   "Karel the robot" alone weighs 1.5 and is fine, but "Karel the robot can
   only turn left so" weighs 5.5 and gets an amber note.
3. More than half of the `change` words are still there, in exactly the same
   form: fail, and the message names them. "Test" → "testing" counts as
   changed, because word shape is one of the five changes.
4. 80% or more of the key words are also in the source: fail. From 65%:
   amber.

All the numbers are in one object at the top of the file, `LIMITS`.

**How the numbers were chosen.** Not by taste. I ran every model answer
from your slides through the checks and moved the limits until all of them
passed with no red and no amber, while Karel's attempts and the "copies" and
"comments" summaries still failed. Two things your own models taught the
checker:

- "There are still no aliens on Mars." (7 words) has a 14-word model answer.
  So "much longer" only fails when the answer is over 160% of the source
  *and* more than 8 words longer.
- The model for the syntax-error pair keeps "the program runs but": four
  words in a row. So a fixed rule of "three copied words" would have failed
  your own answer key. That is why technical terms weigh half and why the
  fail limit is 6.

`tests/checks.test.js` repeats this every time it runs. If you change a
limit or a text and a model answer stops passing, a test fails and tells
you which one.

### A summary: five test cases

`checks.summary(task, answer)`:

| Test | The computer checks | The student ticks |
|---|---|---|
| 1 Main ideas | each `details` entry is absent (fail if present); each `ideas` entry is present (amber if not found) | all the main ideas, no details |
| 2 Nothing added | opinion words: I think, in my opinion, terrible… | no opinion, no new information |
| 3 Own words | copied runs (fail at 5, amber at 4); technical terms kept | vocabulary and grammar changed |
| 4 Same meaning, same order | nothing | nothing stronger, weaker or reordered |
| 5 Form | the first sentence has a source word and a reporting verb; one paragraph; the word range | no tick: fully automatic |

A missing main idea is only amber, never a fail. The check looks for key
words (`any: ['encrypt', 'encryption', 'scramble', 'key']`), and a good
summary may say the idea in words nobody predicted. A detail that is still
there is a fail, because "padlock" or "404" cannot be there by accident.

### A report

`checks.section` checks one section: the word range, at least one linking
phrase from the bank, and the phrases the section needs (`needs`).
`checks.style` checks the whole text for opinion words, short forms and
exclamation marks.

### What the checks cannot do

They do not understand anything. They cannot tell that cause and effect
have been swapped, that a sentence is ungrammatical, or that a main idea is
wrong. A paraphrase full of mistakes can show four ticks if the student
ticks dishonestly. That is why meaning and grammar are tick boxes, why the
home page says what the site checks and what it does not, and why a model
answer always follows. The site is practice between lessons, not marking.

---

## 8. The look: `css/site.css`

One file, in nine numbered parts. The things worth knowing:

**Colours are variables**, defined once at the top (`:root`). The brand
values are there as decided on 11 November: `--red: #C8102E`,
`--maroon: #800029`, `--green: #64A70B` with black text on it.

**Each block has one colour**, and the whole page follows it through two
variables:

```css
body[data-block="paraphrasing"] { --accent: var(--blue);   --accent-tint: #E6EDF5; }
body[data-block="summarising"]  { --accent: var(--teal);   --accent-tint: #E6EEED; }
body[data-block="reports"]      { --accent: var(--purple); --accent-tint: #F0E9F1; }
```

Everything coloured on a block page (the page head, the task numbers, the
headings, the bank) uses `var(--accent)`. To try another colour for a block
you change one line. The three colours are from the secondary palette of the
brand guide (page 33), and the tints are 10% tints of them, which the guide
allows. How many colours the site uses is still your decision; this file
shows one answer and makes it cheap to change.

**Results are never colour alone** (guide, page 49): pass, fail and "your
turn" each have a word, and findings have ✓, ✗ or !.

**"Not yet" is light grey with a red border and a red heading** (your
decision 16). There is no pale red anywhere.

**Kerning is off for body text.** This is the one strange line:

```css
body { … font-kerning: none; }
```

The Univers file has kerning pairs that pull a space towards a capital T,
V, W or Y, hard. With kerning on, "it. Then" is drawn as "it.Then". The
current hub loads the same file without this line, so it is worth a look
there too. Kerning is switched back on wherever Bebas Neue is used.

**Univers 65 Bold is missing.** Only 55 Roman is in `fonts/` (it was the one
in the old repository). Bold text is the browser's thickened Roman for now.

**Contrast**, measured: white on the red 5.9, on the blue 8.5, on the teal
8.3, on the purple 9.9; black on the green 7.1, on the amber 12.1; grey text
on white 6.7. The red "Write it." in the footer is 3.6 on black, which is
enough for text that large and not for small text.

---

## 9. Saved work

`Hub.store` keeps one object under one `localStorage` key:

```js
// key: 'skillsHubPrototype.v1'
{ done:   { 'para-swap': true, 'sum-https': true },
  drafts: { 'para-format:0': 'As Karel the robot…', 'rep-planner:problem': '…' } }
```

- `done` drives the ticks in the task list and the "3 of 7 done" counts.
- `drafts` holds everything typed into a text box, saved at every keystroke
  (`draftArea` in `kinds-writing.js`), so a reload does not lose work.
- Every read and write is inside `try … catch`. In a private window, or
  with storage switched off, the site still works and simply forgets.
- The key has its own name because every site at
  `monikapietruch-uob.github.io` shares one storage area. Without its own
  key this site and the tech hub could overwrite each other.

`localStorage` is per browser, per computer. Lab computers wipe it at
logout. So the two tasks that produce something worth keeping (the planner,
the structure checker) have Copy and Download buttons (`ui.exportButtons`).

---

## 10. Tests

```bash
node tests/checks.test.js
```

17 tests, no packages needed. They load `js/checks.js` and the three data
files into Node and check, among other things:

- every model paraphrase passes, with no amber
- copying the source fails "Changes"
- Karel's attempts fail in the place the answer key says
- a lost "only", a lost number and a lost technical term are each noticed
- both model summaries pass and are inside their word range, and the word
  range is about a third of the source
- the summary that copies and the summary that comments both fail
- the model report passes its own structure checker
- the proofreading paragraph has exactly eight mistakes, and fixing them
  gives the model paragraph, letter for letter
- task ids are unique

The last line of `js/checks.js` is what lets Node load a browser file:

```js
if (typeof module !== 'undefined' && module.exports) module.exports = Hub.checks;
```

In a browser `module` does not exist, so nothing happens. In Node it does,
so `require('../js/checks.js')` gets the functions. Your MiniPy file uses
the same trick.

Before handing this over I also drove the real pages in Chrome with a
script: every task done the right way, several done the wrong way, the
Back button, the skip link, saved drafts, the download. 90 checks passed
with no errors in the console, and no page scrolls sideways at phone width.
That script needs Playwright, so it is not in the repository; say so if you
want it added.

---

## 11. How to add things

**A task of an existing kind.** Copy a task of that kind in the data file,
give it a new `id`, change the content. Run the tests. For a `paraphrase`
item, fill in `change`, `keep` and `models` at least; if a model answer of
yours fails the tests, either the item needs an `allow` phrase or the model
really is close to the source.

**A rule card.** Add an object to `rules` with one of the five types.

**A new block.** Three steps: a new `data/name.js` with
`Hub.BLOCKS.name = {…}`; a copy of `paraphrasing.html` with the two names
changed; one line each in `Hub.PAGES` and `Hub.BLOCK_ORDER` in `core.js`,
plus an accent colour in `site.css` and a band in `index.html`.

**A new kind.** Write `Hub.KINDS.name = function (task, mount, api) {…}` in
one of the kinds files, add a label for it in `KIND_LABEL` in `block.js`,
and add its name to the list in the last test. Nothing else changes.

**A recording instead of the browser voice.** Replace `makePlayer` with a
function that returns an `<audio>` element and counts its `ended` events.

---

## 12. What is missing on purpose

- **Report rules from your slides.** There are none yet, so that block is a
  draft and says so on the page.
- **Mock papers and test papers.** Nothing from them is on the site.
- **The "how it is marked" percentages** for summaries. Your teacher's notes
  say to check them against the Portfolio task 2 criteria first.
- **Padlet.** No reflection question and no Padlet button yet.
- **A teachers' page.** The answers are in the data files, as on the hub.
- **Listening with a real recording.**
- **Univers 65 Bold and the Masters logo file**, which are on the ELT drive.
  The logo here is the file the current hub uses.

---

## 13. What could come next

In chunks, each one useful by itself:

1. **Decide the look.** The block colours, the name, the home page. Cheap
   to change now, expensive later.
2. **Paraphrasing, complete.** The rest of the toolkit (synonyms,
   collocations) and the grammar tools from revision session 2 (active and
   passive, linking words, joining pairs, count the facts).
3. **Summarising, complete.** A recording for the talk, the cookies text
   from the hub, Talk 1 with Zara's and Tomasz's notes.
4. **Report writing, real.** Replace the draft rules with the Week 9 and 10
   slides; one pack for each sector.
5. **Around the tasks.** The Padlet step, a teachers' page, the revision
   room, the cover lessons from the site plan.
6. **Its permanent home.** `cefl-foundation.github.io/skills/`, sharing a
   core with the rebuilt tech hub, or the React version you want to build
   for your portfolio. The data files would move across as they are: they
   are plain objects, and a React component can read them as easily as
   these functions do.

---

## 14. Words used in this guide

| Word | Meaning here |
|---|---|
| IIFE | a function that is defined and called at once, used to keep a file's variables private |
| closure | a function that still has access to the variables of the function it was created in, after that function has finished |
| callback | a function you hand to something else to call later (`onclick`, `map`, `api.done`) |
| event listener | a callback that the browser calls when something happens (a click, a keystroke, `hashchange`) |
| hash | the part of an address after `#`; changing it does not reload the page |
| route | here: the hash, read as "which screen to show" |
| localStorage | a small store of text that a browser keeps for one website on one computer |
| pure function | a function whose result depends only on its arguments and that changes nothing outside itself; easy to test |
| stem | a word with its ending cut off, so that different forms compare as equal |
| regular expression | a pattern for finding text, written between slashes: `/\d+/` means "one or more digits" |
