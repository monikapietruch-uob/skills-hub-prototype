# Skills Practice Hub: prototype

A small trial version of the academic-skills practice site for the CEFL tech
group (Academic Skills Foundation, technology pathway, University of
Bedfordshire). It exists to show what the site could look like and how the
tasks could work. It is not the finished site.

Three blocks, 20 sample tasks:

| Block | Weeks | Tasks |
|---|---|---|
| Paraphrasing | 2 to 4 | the explanation swap, word shape, Karel's attempts, which is closest, a guided paraphrase, test format, the rover's diary |
| Summarising | 6 to 8 | Karel's rules, signposts, main idea or detail, three summaries, the first sentence, an article summary, a listening summary |
| Report writing | 9 to 11 | report order, three introductions, linking words, proofreading, a report planner, a structure checker |

Live address, once it is published: **https://monikapietruch-uob.github.io/skills-hub-prototype/**

## Look at it on your own computer

Double-click `index.html`. That is all: there is no build step, no npm and
no server. (The Tech Practice Hub needs a server because it fetches task
files. This site keeps its tasks in ordinary scripts, so it does not.)

## Run the tests

```bash
cd ~/projects/skills-hub-prototype
node tests/checks.test.js
```

17 tests. They check that every model answer from the slides passes the
automatic checks and that every known bad answer fails them.

## Publish it on GitHub Pages

1. On github.com, signed in as `monikapietruch-uob`: **New repository**,
   name `skills-hub-prototype`, **Public**, no README, **Create repository**.
2. In Terminal:

   ```bash
   cd ~/projects/skills-hub-prototype
   git init -b main
   git config user.name "Monika Pietruch"
   git config user.email "monikauob@gmail.com"
   git add .
   git commit -m "Skills Practice Hub prototype: three blocks, 20 sample tasks"
   git remote add origin https://github.com/monikapietruch-uob/skills-hub-prototype.git
   git push -u origin main
   ```

3. On github.com, in the new repository: **Settings → Pages → Build and
   deployment → Source: Deploy from a branch → Branch: `main`, folder
   `/ (root)` → Save**. After about a minute the site is at the address above.

Later changes: `git add . && git commit -m "…" && git push`.

## What is in the folder

```
index.html            the home page
paraphrasing.html     block 1   (the three block pages are the same, apart from one name)
summarising.html      block 2
reports.html          block 3
css/site.css          the one stylesheet
js/core.js            shared: the Hub object, el(), saved work, header and footer
js/checks.js          the tests a computer can run on writing (no page code in it)
js/kinds-quick.js     task kinds with exact answers: choice, match, gap, order, proofread
js/kinds-writing.js   task kinds where you write: paraphrase, summary, planner, structure
js/block.js           draws a block page: the task list, or one task
js/home.js            fills in the numbers on the home page
data/*.js             the rules and the tasks of each block: this is where content lives
tests/checks.test.js  the tests for js/checks.js
assets/, fonts/       the logo, the favicon, Bebas Neue and Univers 55
GUIDE.md              how the code works, file by file
```

To add or change a task you only edit a file in `data/`. `GUIDE.md` explains
the format.

## Where the content comes from

- **Paraphrasing and summarising:** the rules and most of the sentences are
  from the week 4 and week 6 slides and handouts. The HTTPS text is the
  summary task from the Tech Practice Hub. The talk "What happens when you
  press Enter?" is new.
- **Report writing:** there are no report slides yet, so these rules are a
  draft built from the term schedule and the site plan. The page says so.
  The word ranges and the 250-word minimum are placeholders.
- **Not here, on purpose:** the mock papers and the real test papers. The
  site is public, so only practice material belongs on it.

## Things to know

- The site is public but not listed: every page asks search engines not to
  index it. Anyone with the link can open it. GitHub Pages cannot limit a
  site to one group.
- Work is saved in the browser only. Lab computers forget it at logout, so
  the planner and the structure checker have Copy and Download buttons.
- The listening task is read by the browser's own voice. A recording would
  be better and would replace one function (`makePlayer` in
  `js/kinds-writing.js`).
- Univers 65 Bold is not in `fonts/` yet, so bold text is the browser's
  thickened Roman. To use the real bold, copy `lte50140.ttf` from the
  marketing folder into `fonts/` and add one `@font-face` rule with
  `font-weight: 700` at the top of `css/site.css`.
- The logo and the Univers font belong to the University. They are here for
  this site only.
