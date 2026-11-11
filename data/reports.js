/*
  data/reports.js — block 3, weeks 9 to 11.

  DRAFT. There are no report-writing lesson slides yet, only the cover
  slides and the term schedule. So the rules below come from:
    - the schedule: problem–solution report; week 9 the introduction;
      week 10 structure, cohesion and proofreading; week 11 the mock
      (checked with Studiosity) and feedback; the four tech sectors
    - the plan for this site: the six-section frame, the report planner,
      linking words, proofreading (verb forms, active and passive, articles)
    - the linking-words table from the week 4 revision slides
  The word ranges and the 250-word minimum are placeholders. Check every
  rule here against the Week 9 and 10 slides when they exist.

  The sample report ("Lost work on shared lab computers") is new.
*/
window.Hub = window.Hub || {};
Hub.BLOCKS = Hub.BLOCKS || {};

Hub.BLOCKS.reports = {
  id: 'reports',
  title: 'Report writing',
  weeks: 'Weeks 9 to 11',
  goal: 'The problem–solution report',
  intro: 'Describe a problem in a technology sector, present two solutions and say which is better. Plan it, link it, proofread it.',
  rulesNote: 'Draft rules: they come from the unit schedule, not yet from the Week 9 and 10 slides.',
  sockLine: 'Finally: a short report on the colour of your teacher’s socks is not required. Yet.',

  rules: [
    {
      type: 'note',
      title: 'What a problem–solution report is',
      text: 'It describes one problem in a technology sector, presents two solutions and evaluates them. The sectors on this unit are HealthTech, EdTech, FinTech, and CleanTech and Smart Cities.'
    },
    {
      type: 'list',
      title: 'Report phrases',
      items: [
        { head: 'The aim', text: 'This report describes… and evaluates two possible solutions.' },
        { head: 'The solutions', text: 'One possible solution is… An alternative solution is…' },
        { head: 'The evaluation', text: 'The main advantage of… is… On the other hand,… Overall,…' },
        { head: 'The recommendation', text: 'It is recommended that…' }
      ]
    },
    {
      type: 'flow',
      title: 'Six sections, in this order',
      wide: true,
      steps: [
        { head: 'Introduction', lines: ['background', 'the problem', 'the aim of the report'] },
        { head: 'The problem', lines: ['what happens', 'who it affects', 'why it matters'] },
        { head: 'Solution 1', lines: ['what it is', 'how it helps'] },
        { head: 'Solution 2', lines: ['what it is', 'how it helps'] },
        { head: 'Evaluation', lines: ['compare the two', 'advantages and limits'] },
        { head: 'Conclusion', lines: ['the answer', 'a recommendation'] }
      ]
    },
    {
      type: 'table',
      title: 'Linking words: simple to academic',
      wide: true,
      columns: ['Simple link', 'Alternative 1', 'Alternative 2'],
      rows: [
        ['because', 'as / since', 'due to / because of + noun'],
        ['so', 'therefore / as a result (new sentence)', 'which means that'],
        ['but', 'however (new sentence)', 'although + clause / despite + noun or -ing'],
        ['and', 'as well as', 'in addition / also']
      ],
      foot: 'Look at what comes after the link. Due to and despite need a noun. Although needs a clause. However, therefore and as a result start a new sentence.'
    },
    {
      type: 'list',
      title: 'Proofreading: leave ten minutes',
      items: [
        { head: 'Tenses and verb forms', text: 'The subject and the verb agree: the computers are, the problem affects.' },
        { head: 'Active and passive', text: 'Files are saved, work can be lost: be + past participle.' },
        { head: 'Articles', text: 'A problem the first time, the problem after that.' },
        { head: 'Missing words', text: 'Read every sentence slowly, one word at a time.' }
      ]
    },
    {
      type: 'table',
      title: 'Three weeks',
      columns: ['Week', 'What happens'],
      rows: [
        ['9', 'Report writing: the introduction.'],
        ['10', 'Structure, linking words and proofreading. The four technology sectors.'],
        ['11', 'The mock test, checked with Studiosity, then feedback.']
      ]
    }
  ],

  tasks: [
    /* ---------------- Structure ---------------- */
    {
      id: 'rep-order',
      group: 'Structure',
      kind: 'order',
      title: 'Put the report in order',
      minutes: 5,
      does: 'Six sentences, one from each section of a report. Rebuild the order.',
      brief: [
        'On a Tuesday at 4.57 pm, Lab B14 logged out eleven students in the middle of task 7. Nobody had saved. Somebody wrote a report about it.',
        'Here is one sentence from each of its six sections. Put them in the order of the report.'
      ],
      // The items are listed in the RIGHT order. "start" is the mixed order the student sees first.
      items: [
        { label: 'Introduction', text: 'This report describes the problem of lost work on shared lab computers and evaluates two possible solutions.' },
        { label: 'The problem', text: 'Any file that has been saved only on the desktop disappears when the student logs out.' },
        { label: 'Solution 1', text: 'One possible solution is automatic cloud storage, which saves each file online as the student works.' },
        { label: 'Solution 2', text: 'An alternative solution is version control with GitHub, which also records the history of a project.' },
        { label: 'Evaluation', text: 'Cloud storage is easier to introduce, whereas version control takes longer to learn.' },
        { label: 'Conclusion', text: 'In conclusion, it is recommended that cloud storage is switched on for all lab accounts.' }
      ],
      start: [3, 0, 5, 1, 4, 2],
      after: 'Introduction, the problem, solution 1, solution 2, evaluation, conclusion. The phrases gave it away: "One possible… An alternative… In conclusion…".'
    },
    {
      id: 'rep-intro',
      group: 'Structure',
      kind: 'choice',
      title: 'Three introductions: which is best?',
      minutes: 6,
      does: 'Three openings for the same report. Two of them have a bug.',
      brief: [
        'Three students wrote an introduction for the report about lost work in the labs. An introduction gives the background, names the problem and states the aim of the report. Which one does?'
      ],
      options: ['No aim, and an opinion', 'Starts with the solutions', 'The winner'],
      items: [
        {
          attemptLabel: 'Introduction A',
          attempt: 'Computers are very important nowadays and everybody uses them. Sometimes students lose their work, which is really annoying. I think the university should do something about this problem.',
          answer: 0,
          why: 'It starts too generally, "I think" and "really annoying" are opinion, and the reader never learns what the report will do.'
        },
        {
          attemptLabel: 'Introduction B',
          attempt: 'The best solution is OneDrive, because it is free and it saves files automatically. Students can also use GitHub, which keeps every version of a file. Both of them work on the lab computers.',
          answer: 1,
          why: 'The solutions belong later. An introduction gives the background, names the problem and says what the report will do.'
        },
        {
          attemptLabel: 'Introduction C',
          attempt: 'Shared computer labs are an essential part of university study, particularly for students who do not own a laptop. However, the computers in many labs delete every local file when a student logs out, and unsaved work is regularly lost. This report describes the problem and evaluates two possible solutions.',
          answer: 2,
          why: 'Background, then the problem, then the aim of the report. Three moves, in that order.'
        }
      ]
    },

    /* ---------------- Language ---------------- */
    {
      id: 'rep-links',
      group: 'Language',
      kind: 'gap',
      title: 'Linking words',
      minutes: 8,
      does: 'Eight gaps in the report, eight linking phrases in the bank.',
      brief: [
        'Linking words show the reader how one idea connects to the next. Complete the sentences from the report. Click a phrase in the bank to put it in the next empty gap, or type your own.'
      ],
      bank: ['As a result', 'One possible solution', 'In addition', 'However', 'An alternative solution', 'on the other hand', 'Overall', 'In conclusion'],
      items: [
        { before: 'Lab computers are reset after each session.', after: ', any file saved only on the desktop disappears at logout.', accept: ['as a result', 'therefore', 'consequently'] },
        { before: '', after: ' is automatic cloud storage, which saves each file online as the student works.', accept: ['one possible solution', 'one solution', 'a possible solution'] },
        { before: 'Cloud storage needs no technical knowledge.', after: ', it is already included in the university licence.', accept: ['in addition', 'furthermore', 'moreover', 'also'] },
        { before: 'Cloud storage is simple to use.', after: ', it depends on a reliable internet connection.', accept: ['however', 'on the other hand', 'nevertheless'] },
        { before: '', after: ' is version control with GitHub.', accept: ['an alternative solution', 'another solution', 'a second solution', 'another possible solution'] },
        { before: 'Cloud storage works without any training. Version control,', after: ', takes several lessons to learn.', accept: ['on the other hand', 'however'] },
        { before: '', after: ', cloud storage is the more practical solution for new students.', accept: ['overall', 'in conclusion'] },
        { before: '', after: ', lost work on shared computers is a serious but solvable problem.', accept: ['in conclusion', 'overall', 'to conclude', 'to sum up'] }
      ],
      after: 'Look at the punctuation: "As a result", "However", "In addition", "Overall" and "In conclusion" are all followed by a comma.'
    },
    {
      id: 'rep-proof',
      group: 'Language',
      kind: 'proofread',
      title: 'Proofreading: eight mistakes',
      minutes: 10,
      does: 'One paragraph, eight mistakes: verb forms, the passive, articles.',
      brief: [
        'Karel wrote this paragraph at 2 a.m. and is very proud of it. It has eight mistakes: three verb forms, three passives and two articles.',
        'Click a word that is wrong, then type the correction. Clicking a word that is fine costs you nothing but dignity.'
      ],
      // {wrong|right|type|why}   type is verb, passive or article.   right can list alternatives with /
      text: 'Lab computers {is reset|are reset|verb|The subject, "computers", is plural: are reset.} after each session in order to protect privacy and to keep {a|the|article|We know which machines: the ones in the lab. So: the machines.} machines fast. As a result, any file that {has saved|has been saved|passive|A file does not save itself. Passive: has been saved.} only on the desktop {disappear|disappears|verb|"Any file" is singular: disappears.} at logout. {Problem|The problem|article|It is the problem we have just described: the problem.} mainly {affect|affects|verb|"The problem" is singular: affects.} first-year and foundation students, who are often unaware of the rule. Consequently, hours of work can {be lose|be lost|passive|Passive: be + past participle. Lose, lost, lost.} in a moment, and deadlines may {missed|be missed|passive|After a modal verb the passive needs "be": may be missed.}.',
      types: { verb: 'Verb forms', passive: 'Active and passive', article: 'Articles' },
      after: 'Eight out of eight. In the test, leave ten minutes at the end and read every sentence for exactly these three things.'
    },

    /* ---------------- Write your own ---------------- */
    {
      id: 'rep-planner',
      group: 'Write your own',
      kind: 'planner',
      title: 'Report planner',
      minutes: 10,
      does: 'Answer six questions and get a skeleton for your report.',
      brief: [
        'Choose a sector and a problem you know something about. Answer the six questions in a few words each. The planner turns your answers into a skeleton with the six headings and the phrases that belong in each section.',
        'A lab computer forgets everything when you log out, so copy the plan or download it before you leave.'
      ],
      fields: [
        { id: 'sector', label: 'The sector', type: 'select', options: ['HealthTech', 'EdTech', 'FinTech', 'CleanTech and Smart Cities'] },
        { id: 'problem', label: 'The problem, in one line', hint: 'for example: students lose unsaved work on shared lab computers', required: true },
        { id: 'who', label: 'Who does it affect?', hint: 'for example: first-year and foundation students' },
        { id: 'effect', label: 'What happens as a result?', hint: 'for example: deadlines are missed' },
        { id: 'solution1', label: 'Solution 1', hint: 'for example: automatic cloud storage', required: true },
        { id: 'solution2', label: 'Solution 2', hint: 'for example: version control with GitHub', required: true }
      ],
      // {name} is replaced by what the student typed in the field with that id.
      skeleton: [
        { head: '1 Introduction', words: '40 to 70 words',
          notes: ['Sector: {sector}', 'The problem: {problem}'],
          phrases: ['However, …', 'This report describes the problem and evaluates two possible solutions.'] },
        { head: '2 The problem', words: '50 to 90 words',
          notes: ['Who it affects: {who}', 'The result: {effect}'],
          phrases: ['This problem mainly affects …', 'As a result, …', 'Consequently, …'] },
        { head: '3 Solution 1', words: '50 to 90 words',
          notes: ['{solution1}'],
          phrases: ['One possible solution is …', 'The main advantage of this approach is that …', 'In addition, …', 'However, …'] },
        { head: '4 Solution 2', words: '50 to 90 words',
          notes: ['{solution2}'],
          phrases: ['An alternative solution is …', 'This method not only … but also …', 'Nevertheless, …'] },
        { head: '5 Evaluation', words: '40 to 80 words',
          notes: ['Compare: {solution1} and {solution2}'],
          phrases: ['Both solutions would …', '…, whereas …', 'On the other hand, …', 'Overall, … is the more practical solution because …'] },
        { head: '6 Conclusion', words: '30 to 60 words',
          notes: ['Your answer, and one recommendation'],
          phrases: ['In conclusion, …', 'It is recommended that …'] }
      ]
    },
    {
      id: 'rep-structure',
      group: 'Write your own',
      kind: 'structure',
      title: 'Structure checker',
      minutes: 40,
      does: 'Write your report in six boxes. The site checks length, linking words and style.',
      brief: [
        'Write your report section by section. The checker counts the words in each section, looks for linking words and for the phrases each section needs, and checks the style. It cannot read your ideas: that is still the job of your teacher, your partner and Studiosity.',
        'Copy or download your report before you log out.'
      ],
      minTotal: 250,
      sections: [
        { id: 'introduction', label: 'Introduction', range: [40, 70], hint: 'Background, the problem, the aim of the report.',
          needs: [{ label: 'the aim of the report', any: ['this report', 'the aim of', 'the purpose of'], tryThis: 'This report describes… and evaluates two possible solutions.' }] },
        { id: 'problem', label: 'The problem', range: [50, 90], hint: 'What happens, who it affects, why it matters.' },
        { id: 'solution1', label: 'Solution 1', range: [50, 90], hint: 'What it is and how it helps. One limit.',
          needs: [{ label: 'a phrase that introduces the solution', any: ['one possible solution', 'one solution', 'a possible solution', 'the first solution', 'one way'], tryThis: 'One possible solution is…' }] },
        { id: 'solution2', label: 'Solution 2', range: [50, 90], hint: 'What it is and how it helps. One limit.',
          needs: [{ label: 'a phrase that introduces the second solution', any: ['an alternative', 'another solution', 'a second solution', 'the second solution', 'another possible solution', 'another way'], tryThis: 'An alternative solution is…' }] },
        { id: 'evaluation', label: 'Evaluation', range: [40, 80], hint: 'Compare the two solutions. Which is better, and why?',
          needs: [{ label: 'a comparison of the two solutions', any: ['both solutions', 'whereas', 'on the other hand', 'in contrast', 'compared with', 'more practical', 'more effective', 'than'], tryThis: 'Both solutions would…, whereas…' }] },
        { id: 'conclusion', label: 'Conclusion', range: [30, 60], hint: 'Your answer in one or two sentences, and a recommendation.',
          needs: [
            { label: 'a concluding phrase', any: ['in conclusion', 'to conclude', 'to sum up', 'in summary'], tryThis: 'In conclusion,…' },
            { label: 'a recommendation', any: ['recommended', 'recommend', 'should'], tryThis: 'It is recommended that…' }
          ] }
      ],
      linkers: [
        { head: 'Cause and result', words: ['because', 'since', 'as a result', 'therefore', 'consequently', 'due to', 'which means that'] },
        { head: 'Adding', words: ['in addition', 'also', 'as well as', 'furthermore'] },
        { head: 'Contrast', words: ['however', 'although', 'despite', 'nevertheless', 'on the other hand', 'whereas'] },
        { head: 'Solutions and endings', words: ['one possible solution', 'an alternative solution', 'overall', 'in conclusion'] }
      ],
      model: {
        title: 'Lost work on shared lab computers: two possible solutions',
        sections: {
          introduction: 'Shared computer labs are an essential part of university study, particularly for students who do not own a laptop. However, the computers in many labs delete every local file when a student logs out, and unsaved work is regularly lost. This report describes the problem and evaluates two possible solutions: automatic cloud storage and version control.',
          problem: 'Lab computers are reset after each session in order to protect privacy and to keep the machines fast. As a result, any file that has been saved only on the desktop disappears at logout. The problem mainly affects first-year and foundation students, who are often unaware of the rule. Consequently, hours of work can be lost in a moment, and deadlines may be missed.',
          solution1: 'One possible solution is automatic cloud storage. If every lab account were connected to OneDrive, files would be saved online as the student worked. The main advantage of this approach is that it requires no technical knowledge. In addition, the service is already included in the university licence. However, it depends on a reliable internet connection.',
          solution2: 'An alternative solution is version control with GitHub. Students would be taught to commit their work at the end of every task, so that each version is stored in an online repository. This method not only prevents lost work but also records the history of a project. Nevertheless, beginners need several lessons before they can use it with confidence.',
          evaluation: 'Both solutions would reduce the amount of lost work. Cloud storage is easier to introduce, since it works without any training. Version control, on the other hand, takes longer to learn, although it is a skill that employers expect. Overall, cloud storage is the more practical solution for new students.',
          conclusion: 'In conclusion, lost work on shared computers is a serious but solvable problem. It is recommended that automatic cloud storage is switched on for all lab accounts, and that version control is introduced later in the first year.'
        }
      }
    }
  ]
};
