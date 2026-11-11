/*
  js/checks.js — the tests a computer can run on a piece of writing.

  Nothing in this file touches the page. Every function takes text and
  returns facts about it, which is why the same file also loads in Node
  for tests/checks.test.js (see the last lines).

  What a computer can check:   copied words, technical terms, numbers,
                               length, the first sentence, word counts.
  What it cannot check:        meaning and grammar. Those stay with the
                               student, as a tick box they must answer.

  Each test is returned in this shape:
    { id: 'changes',
      name: 'Changes',
      auto: [ { state: 'ok' | 'bad' | 'maybe', text: '…' }, … ],
      ask:  'The question the student answers with a tick' or null }
  'bad' fails the test. 'maybe' is amber: the computer is not sure, so
  the student decides.
*/
(function (root) {
  'use strict';

  var Hub = root.Hub = root.Hub || {};

  // Every number the checks use, in one place, so they are easy to tune.
  var LIMITS = {
    lengthMin: 0.6,        // a paraphrase shorter than 60% of the source has lost information
    lengthMax: 1.6,        // longer than 160% is too much explanation…
    lengthSlack: 8,        // …but only if that is more than 8 extra words (short sentences grow easily)
    sameFail: 0.8,         // 80% of the key words are also in the source: too close
    sameWarn: 0.65,        // 65%: amber
    runFail: 6,            // paraphrase: six copied words in a row (a technical-term word counts half)
    runWarn: 4,            // paraphrase: four copied words in a row is amber
    summaryRunFail: 5,     // summary: five copied words in a row
    summaryRunWarn: 4
  };

  // Small grammar words. They are in every sentence, so they are left out
  // when we measure how much vocabulary has changed.
  var STOP = {};
  ('a an the and or but so if of to in on at by for with from as is are was were be been being ' +
   'it its this that these those they them their there he she his her we our you your i my me ' +
   'not no do does did has have had can could will would may might must should than then when ' +
   'while which who whom whose what where why how also very just into out up down over under ' +
   'again once each other some any all both more most such only own same too')
    .split(' ').forEach(function (word) { STOP[word] = true; });

  // Number words we can compare with digits. "one" is left out on purpose:
  // it is usually a pronoun ("the third one").
  var NUMBER_WORDS = {
    two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9',
    ten: '10', eleven: '11', twelve: '12', twenty: '20', thirty: '30', forty: '40',
    fifty: '50', hundred: '100', thousand: '1000'
  };

  // "Dictionary disasters" from the week 4 slides.
  var DISASTERS = [
    { term: 'loop', wrong: ['circle', 'ring'], say: 'A loop is not a circle.' },
    { term: 'bug', wrong: ['insect', 'beetle'], say: 'A bug is not an insect.' },
    { term: 'string', wrong: ['rope', 'cord'], say: 'A string is not a piece of rope.' },
    { term: 'function', wrong: ['duty'], say: 'A function is not a duty.' },
    { term: 'rover', wrong: ['wanderer'], say: 'A rover is not a wanderer.' }
  ];

  // Grammar traps named on the slides. A synonym can bring different grammar with it.
  var TRAPS = [
    { any: ['discuss about', 'discussed about', 'discusses about', 'discussing about'], say: '"Discuss about": we discuss something. No "about".' },
    { any: ['enable to', 'enables to', 'enabled to'], say: '"Enable to": enable someone to do something, for example "enable programmers to work faster".' },
    { any: ['do a mistake', 'did a mistake', 'does a mistake', 'do mistakes', 'did mistakes', 'doing mistakes'], say: 'We make a mistake. We do not "do" one.' }
  ];

  var OPINION = ['I think', 'in my opinion', 'I believe', 'I feel', 'in my experience', 'personally',
    'I agree', 'I disagree', 'terrible', 'amazing', 'interesting', 'boring', 'great idea', 'we should all'];

  var SOURCE_WORD = /\b(speaker|talk|article|author|text|writer|passage|lecture|presenter|report)\b/i;
  var REPORTING_VERB = /\b(explains?|describes?|argues?|points? out|gives?|recommends?|warns?|claims?|states?|outlines?|discuss(es)?|shows?|suggests?|reports?|presents?|notes?|identif(y|ies)|compares?|introduces?)\b/i;

  var CONTRACTION = /\b[a-z]+n['’]t\b|\b(it|that|there|he|she|what|who|let)['’]s\b|\b(i|you|we|they)['’](m|re|ve|ll|d)\b/i;

  /* ---------------- words ---------------- */

  // 'The drone STOPPED.' -> ['the', 'drone', 'stopped']
  function words(text) {
    return String(text || '').toLowerCase().replace(/[’‘]/g, "'")
      .match(/[a-z0-9À-ɏ]+(?:['-][a-z0-9À-ɏ]+)*/g) || [];
  }

  function count(text) { return words(text).length; }

  // A light "stemmer": it cuts endings so that loop/loops, test/tested/testing
  // and copy/copies/copied count as the same word. The result is not always
  // a real word ('giv', 'us'). It only has to be the same for both forms.
  function stem(word) {
    var w = word;
    if (w.length > 4 && /ie[sd]$/.test(w)) w = w.slice(0, -3) + 'y';
    else if (w.length > 3 && /s$/.test(w) && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1);
    if (w.length > 4 && /ing$/.test(w)) w = w.slice(0, -3);
    else if (w.length > 3 && /[^e]ed$/.test(w)) w = w.slice(0, -2);
    if (w.length > 2 && /e$/.test(w)) w = w.slice(0, -1);
    if (w.length > 2 && w[w.length - 1] === w[w.length - 2] && !/[aeiou]/.test(w[w.length - 1])) w = w.slice(0, -1);
    return w;
  }

  // Which words of a text belong to one of the phrases? Returns true/false for each word.
  // Phrases are compared by stem, so 'while loop' also finds 'while loops'.
  function markPhrases(tokens, phrases) {
    var stems = tokens.map(stem);
    var marks = tokens.map(function () { return false; });
    (phrases || []).forEach(function (phrase) {
      var wanted = words(phrase).map(stem);
      var i, j, hit;
      if (!wanted.length) return;
      for (i = 0; i + wanted.length <= stems.length; i++) {
        hit = true;
        for (j = 0; j < wanted.length; j++) {
          if (stems[i + j] !== wanted[j]) { hit = false; break; }
        }
        if (hit) for (j = 0; j < wanted.length; j++) marks[i + j] = true;
      }
    });
    return marks;
  }

  function hasPhrase(text, phrase) {
    return markPhrases(words(text), [phrase]).indexOf(true) !== -1;
  }

  function hasAny(text, phrases) {
    return (phrases || []).some(function (phrase) { return hasPhrase(text, phrase); });
  }

  function firstFound(text, phrases) {
    var i;
    for (i = 0; i < (phrases || []).length; i++) if (hasPhrase(text, phrases[i])) return phrases[i];
    return null;
  }

  // The same word forms, in the same order (no stemming): used for copied phrases.
  function hasExact(text, phrase) {
    var T = words(text), P = words(phrase), i, j, hit;
    if (!P.length) return false;
    for (i = 0; i + P.length <= T.length; i++) {
      hit = true;
      for (j = 0; j < P.length; j++) if (T[i + j] !== P[j]) { hit = false; break; }
      if (hit) return true;
    }
    return false;
  }

  /* ---------------- comparing an answer with its source ---------------- */

  // Runs of three or more words that are in the answer AND in the source, in the same order.
  // 'free' counts the words of the run that are not technical terms or other allowed phrases.
  // 'weight' is what the limits are compared with: "Karel the robot" alone weighs 1.5 and is fine,
  // but "Karel the robot can only turn left so" weighs 5.5 and is noticed.
  function copiedRuns(source, answer, allow) {
    var S = words(source), A = words(answer);
    var allowed = markPhrases(A, allow);
    var runs = [];
    var i = 0, j, k, n, best, free;
    while (i < A.length) {
      best = 0;
      for (j = 0; j < S.length; j++) {
        k = 0;
        while (i + k < A.length && j + k < S.length && A[i + k] === S[j + k]) k++;
        if (k > best) best = k;
      }
      if (best >= 3) {
        free = 0;
        for (n = i; n < i + best; n++) if (!allowed[n]) free++;
        // weight: an ordinary word counts 1, a word of a technical term counts a half
        runs.push({ text: A.slice(i, i + best).join(' '), length: best, free: free, weight: free + (best - free) / 2 });
        i += best;
      } else {
        i++;
      }
    }
    return runs;
  }

  // How many of the answer's key words are also in the source?
  // Key words = everything except small grammar words and allowed phrases.
  function overlap(source, answer, allow) {
    var A = words(answer);
    var allowed = markPhrases(A, allow);
    var inSource = {};
    var total = 0, same = [];
    words(source).forEach(function (word) { inSource[stem(word)] = true; });
    A.forEach(function (word, i) {
      if (allowed[i] || STOP[word]) return;
      total++;
      if (inSource[stem(word)]) same.push(word);
    });
    return { total: total, same: same, share: total ? same.length / total : 0 };
  }

  function numbersIn(text) {
    var found = [];
    words(text).forEach(function (word) {
      var number = /^\d+$/.test(word) ? word : NUMBER_WORDS[word];
      if (number && found.indexOf(number) === -1) found.push(number);
    });
    return found;
  }

  // keep: ['HTTPS', ['encryption', 'encrypt']]  ->  [['HTTPS'], ['encryption', 'encrypt']]
  function alternatives(list) {
    return (list || []).map(function (entry) { return Array.isArray(entry) ? entry : [entry]; });
  }

  function flatten(listOfLists) {
    return listOfLists.reduce(function (all, one) { return all.concat(one); }, []);
  }

  function ok(text) { return { state: 'ok', text: text }; }
  function bad(text) { return { state: 'bad', text: text }; }
  function maybe(text) { return { state: 'maybe', text: text }; }

  // ['a', 'b', 'c'] -> '"a", "b" and "c"'
  function quoteList(items) {
    var quoted = items.map(function (item) { return '"' + item + '"'; });
    if (quoted.length < 2) return quoted.join('');
    return quoted.slice(0, -1).join(', ') + ' and ' + quoted[quoted.length - 1];
  }

  /* ---------------- 1. a paraphrase: four test cases ---------------- */

  // item:   one entry of a paraphrase task in data/paraphrasing.js
  // answer: what the student wrote
  // extra:  { factsCounted: 4 } for paragraphs (the number the student typed)
  function paraphrase(item, answer, extra) {
    var source = item.source;
    var keep = alternatives(item.keep);
    var allow = (item.allow || []).concat(flatten(keep));
    var sourceCount = count(source), answerCount = count(answer);
    var ratio = sourceCount ? answerCount / sourceCount : 0;
    var information = [], changes = [], grammar = [];

    // --- 2 Information: length, numbers, the small words that carry meaning
    if (ratio < LIMITS.lengthMin && sourceCount - answerCount >= 3) {
      information.push(bad('Much shorter than the source: ' + answerCount + ' words, and the source has ' + sourceCount + '. Is some information missing?'));
    } else if (ratio > LIMITS.lengthMax && answerCount - sourceCount > LIMITS.lengthSlack) {
      information.push(bad('Much longer than the source: ' + answerCount + ' words, and the source has ' + sourceCount + '. Aim for about the same length.'));
    } else {
      information.push(ok('About the same length: ' + answerCount + ' words (the source has ' + sourceCount + ').'));
    }
    var answerNumbers = numbersIn(answer);
    numbersIn(source).forEach(function (number) {
      if (answerNumbers.indexOf(number) === -1) {
        information.push(maybe('The source has the number ' + number + '. Is it still in your paraphrase?'));
      }
    });
    (item.mustKeep || []).forEach(function (idea) {
      if (!hasAny(answer, idea.any)) {
        information.push(maybe('Small words carry meaning. Is the idea of "' + idea.label + '" still there?'));
      }
    });
    if (item.facts && extra && extra.factsCounted) {
      if (Number(extra.factsCounted) === item.facts) {
        information.push(ok('You counted ' + item.facts + ' pieces of information in the source. Count them in your paraphrase: the numbers must match.'));
      } else {
        information.push(maybe('You counted ' + extra.factsCounted + ' pieces of information. Count again: most people find ' + item.facts + '.'));
      }
    }

    // --- 3 Changes: technical terms, dictionary disasters, copied words
    if (words(source).join(' ') === words(answer).join(' ')) {
      changes.push(bad('This is the source text. Copying is not paraphrasing.'));
    } else {
      var lost = keep.filter(function (forms) { return !hasAny(answer, forms); })
        .map(function (forms) { return forms[0]; });
      if (lost.length) {
        changes.push(bad('Technical terms stay. Missing: ' + quoteList(lost) + '.'));
      } else if (keep.length) {
        changes.push(ok('Technical terms kept: ' + keep.map(function (forms) { return forms[0]; }).join(', ') + '.'));
      }
      DISASTERS.forEach(function (disaster) {
        var wrong = firstFound(answer, disaster.wrong);
        if (hasPhrase(source, disaster.term) && wrong) {
          changes.push(bad('Dictionary disaster: "' + wrong + '". ' + disaster.say));
        }
      });

      // the words in red on the slides: have they been changed?
      var kept = (item.change || []).filter(function (phrase) {
        var isAllSmallWords = words(phrase).every(function (word) { return STOP[word]; });
        return !isAllSmallWords && hasExact(answer, phrase);
      });
      var checkable = (item.change || []).filter(function (phrase) {
        return !words(phrase).every(function (word) { return STOP[word]; });
      });
      var same = overlap(source, answer, allow);
      var runs = copiedRuns(source, answer, allow);
      var longest = runs.reduce(function (most, run) { return run.weight > most.weight ? run : most; }, { weight: 0 });

      if (longest.weight >= LIMITS.runFail) {
        changes.push(bad('Copied from the source: "' + longest.text + '". Change the words and the order.'));
      } else if (checkable.length >= 2 && kept.length / checkable.length > 0.5) {
        changes.push(bad('Too close to the source. You kept ' + quoteList(kept) + '. ' + (kept.length === 1 ? 'It' : 'They') + ' can be changed.'));
      } else if (same.share >= LIMITS.sameFail && same.total >= 3) {
        changes.push(bad('Too close to the source: ' + same.same.length + ' of your ' + same.total + ' key words are the same. Changing one or two words is copying.'));
      } else {
        if (longest.weight >= LIMITS.runWarn) {
          changes.push(maybe('These words are in the same order as the source: "' + longest.text + '". Can you change that part?'));
        }
        // With fewer than three key words the share means nothing, so the site says nothing.
        if (same.total >= 3 && same.share >= LIMITS.sameWarn) {
          changes.push(maybe(same.same.length + ' of your ' + same.total + ' key words are also in the source. Can you change one or two more?'));
        } else if (same.total >= 3) {
          changes.push(ok('Vocabulary changed: ' + same.same.length + ' of your ' + same.total + ' key words are also in the source.'));
        }
      }
    }

    // --- 4 Grammar: only the traps a computer can spot
    TRAPS.forEach(function (trap) {
      if (trap.any.some(function (phrase) { return hasExact(answer, phrase); })) grammar.push(bad(trap.say));
    });
    var trimmed = String(answer).trim();
    if (trimmed && (!/^["'“‘(]?[A-Z0-9]/.test(trimmed) || !/[.!?]["'”’)]?$/.test(trimmed))) {
      grammar.push(maybe('Start with a capital letter and end with a full stop.'));
    }

    return [
      { id: 'meaning', name: 'Meaning', auto: [],
        ask: 'Same meaning as the source: cause and effect, the order of the actions and the certainty (may, will) have not changed.' },
      { id: 'information', name: 'Information', auto: information,
        ask: 'Every fact is there. Nothing is missing and nothing is added.' },
      { id: 'changes', name: 'Changes', auto: changes,
        ask: 'The grammar has changed as well as the vocabulary: word shape, order of information, active or passive, linking words.' },
      { id: 'grammar', name: 'Grammar', auto: grammar,
        ask: 'Accurate sentences: verb forms, plurals, articles, and the grammar of every new word.' }
    ];
  }

  /* ---------------- 2. a summary: five test cases ---------------- */

  // task:   a summary task from data/summarising.js
  // answer: what the student wrote
  function summary(task, answer) {
    var source = task.source.text;
    var keep = alternatives(task.keep);
    var allow = (task.allow || []).concat(flatten(keep));
    var n = count(answer);
    var mainIdeas = [], added = [], ownWords = [], form = [];

    // --- 1 Main ideas
    var detailsLeft = (task.details || []).filter(function (detail) { return hasAny(answer, detail.any); })
      .map(function (detail) { return detail.label; });
    if (detailsLeft.length) {
      mainIdeas.push(bad('Examples and small details stay out. Still in: ' + detailsLeft.join(', ') + '.'));
    } else if ((task.details || []).length) {
      mainIdeas.push(ok('No examples or small details from the source.'));
    }
    (task.ideas || []).forEach(function (idea) {
      if (!hasAny(answer, idea.any)) {
        mainIdeas.push(maybe('I could not find this main idea: ' + idea.label + '. If it is there in other words, tick the box.'));
      }
    });

    // --- 2 Nothing added
    var opinions = OPINION.filter(function (phrase) { return hasExact(answer, phrase); });
    if (opinions.length) added.push(bad('Report, do not comment. Take out: ' + quoteList(opinions) + '.'));
    else added.push(ok('No opinion words found.'));

    // --- 3 Own words
    var runs = copiedRuns(source, answer, allow);
    var longest = runs.reduce(function (most, run) { return run.weight > most.weight ? run : most; }, { weight: 0 });
    if (longest.weight >= LIMITS.summaryRunFail) {
      ownWords.push(bad('Copied from the source: "' + longest.text + '". Use your notes, not the text.'));
    } else if (longest.weight >= LIMITS.summaryRunWarn) {
      ownWords.push(maybe('These words are in the same order as the source: "' + longest.text + '". Can you change them?'));
    } else {
      ownWords.push(ok('No long phrases copied from the source.'));
    }
    var lost = keep.filter(function (forms) { return !hasAny(answer, forms); })
      .map(function (forms) { return forms[0]; });
    if (lost.length) ownWords.push(bad('Technical terms stay. Missing: ' + quoteList(lost) + '.'));
    else if (keep.length) ownWords.push(ok('Technical terms kept: ' + keep.map(function (forms) { return forms[0]; }).join(', ') + '.'));

    // --- 5 Form: first sentence, one paragraph, length
    var upToFirstStop = String(answer).trim().match(/^[\s\S]*?[.!?](?=\s|$)/);
    var firstSentence = upToFirstStop ? upToFirstStop[0] : String(answer);
    if (SOURCE_WORD.test(firstSentence) && REPORTING_VERB.test(firstSentence)) {
      form.push(ok('The first sentence names the source and uses a reporting verb.'));
    } else {
      form.push(bad('Start by naming the source, with a reporting verb: "The ' + task.source.noun + ' explains that…".'));
    }
    if (/\n\s*\S/.test(String(answer).trim())) form.push(bad('One paragraph, please. Take out the line breaks.'));
    else form.push(ok('One paragraph.'));
    if (n < task.range[0] || n > task.range[1]) {
      form.push(bad(n + ' words. Aim for ' + task.range[0] + ' to ' + task.range[1] + '.'));
    } else {
      form.push(ok(n + ' words: inside ' + task.range[0] + ' to ' + task.range[1] + '.'));
    }

    return [
      { id: 'ideas', name: 'Main ideas', auto: mainIdeas,
        ask: 'All the main ideas are there. Examples and small details are gone.' },
      { id: 'added', name: 'Nothing added', auto: added,
        ask: 'No opinion and no new information.' },
      { id: 'own', name: 'Own words', auto: ownWords,
        ask: 'Vocabulary and grammar are changed. Technical terms are kept.' },
      { id: 'order', name: 'Same meaning, same order', auto: [],
        ask: 'Nothing is stronger, weaker or in a different order. "May" has not become "will".' },
      { id: 'form', name: 'Form', auto: form, ask: null }
    ];
  }

  /* ---------------- 3. a report: one result for each section ---------------- */

  // spec:    { id, label, range: [min, max], needs: [ { label, any: [...] } ] }
  // linkers: every linking phrase in the task's bank
  function section(spec, text, linkers) {
    var n = count(text);
    var findings = [];
    if (!n) return [bad('Nothing written yet.')];
    if (n < spec.range[0] || n > spec.range[1]) {
      findings.push(bad(n + ' words. Aim for ' + spec.range[0] + ' to ' + spec.range[1] + '.'));
    } else {
      findings.push(ok(n + ' words: inside ' + spec.range[0] + ' to ' + spec.range[1] + '.'));
    }
    var found = (linkers || []).filter(function (phrase) { return hasExact(text, phrase); });
    if (found.length) findings.push(ok('Linking words: ' + found.join(', ') + '.'));
    else findings.push(bad('No linking words found. Choose one from the bank.'));
    (spec.needs || []).forEach(function (need) {
      if (hasAny(text, need.any)) findings.push(ok('Found: ' + need.label + '.'));
      else findings.push(bad('I cannot find ' + need.label + '. Try: "' + need.tryThis + '"'));
    });
    return findings;
  }

  // Academic style, checked on the whole report.
  function style(text) {
    var findings = [];
    var opinions = OPINION.filter(function (phrase) { return hasExact(text, phrase); });
    var contraction = String(text).match(CONTRACTION);
    if (opinions.length) findings.push(bad('A report is impersonal. Take out: ' + quoteList(opinions) + '.'));
    if (contraction) findings.push(bad('No short forms in a report: write "' + contraction[0] + '" in full.'));
    if (/!/.test(text)) findings.push(maybe('An exclamation mark in a report? Reports stay calm.'));
    if (!findings.length) findings.push(ok('Impersonal, no short forms.'));
    return findings;
  }

  // 'pass' | 'fail' | 'yours'  — 'yours' means: the computer is happy, now the student must tick.
  function statusOf(test, ticked) {
    if (test.auto.some(function (finding) { return finding.state === 'bad'; })) return 'fail';
    if (test.ask && !ticked) return 'yours';
    return 'pass';
  }

  Hub.checks = {
    LIMITS: LIMITS,
    words: words,
    count: count,
    stem: stem,
    hasPhrase: hasPhrase,
    hasAny: hasAny,
    hasExact: hasExact,
    copiedRuns: copiedRuns,
    overlap: overlap,
    numbersIn: numbersIn,
    paraphrase: paraphrase,
    summary: summary,
    section: section,
    style: style,
    statusOf: statusOf
  };

  // In Node there is no window: hand the functions to require().
  if (typeof module !== 'undefined' && module.exports) module.exports = Hub.checks;
})(typeof window !== 'undefined' ? window : globalThis);
