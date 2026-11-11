/*
  data/paraphrasing.js — block 1, weeks 2 to 4.

  The rules and most of the sentences come from the week 4 slides and
  handouts (practice session, mock feedback, revision sessions 1 and 2).
  Nothing here comes from the mock paper or from the real test papers.

  A block is: some facts for the page head, a list of rule cards, and a
  list of tasks. Each task has a "kind"; the kind decides which function
  in js/kinds-quick.js or js/kinds-writing.js draws it.
*/
window.Hub = window.Hub || {};
Hub.BLOCKS = Hub.BLOCKS || {};

Hub.BLOCKS.paraphrasing = {
  id: 'paraphrasing',
  title: 'Paraphrasing',
  weeks: 'Weeks 2 to 4',
  goal: 'Portfolio task 1',
  intro: 'Say the same thing in your own English. The test has five sentences, three pairs of sentences and two short paragraphs, so you practise all three here.',
  sockLine: 'One last thing: what colour socks is your teacher wearing today? In your own words, please.',

  rules: [
    {
      type: 'columns',
      title: 'A good paraphrase is…',
      columns: [
        { head: 'Accurate', points: [
          'It has the same meaning as the source text.',
          'It includes all the information: nothing missing, nothing added.'
        ] },
        { head: 'Your own English', points: [
          'The vocabulary and the grammar are, as far as possible, different from the source.',
          'It is about the same length as the source.',
          'It is written in an academic style.'
        ] }
      ]
    },
    {
      type: 'note',
      title: 'Careful: technical terms',
      text: 'while loop, variable, string, function, Python: usually there is no synonym. Keep them and change the words around them. A bug is not an insect, a loop is not a circle and a string is not a piece of rope.'
    },
    {
      type: 'flow',
      title: 'Think like a programmer: paraphrasing is a program',
      wide: true,
      steps: [
        { head: 'Input', lines: ['the source text'] },
        { head: 'Process', lines: ['1 read and understand', '2 highlight the words you can change', '3 rewrite'] },
        { head: 'Output', lines: ['your paraphrase'] },
        { head: 'Tests', lines: ['1 meaning', '2 information', '3 changes', '4 grammar'] }
      ],
      foot: 'If one test fails, debug it and run the tests again. In the real test you are the programmer and the tester.'
    },
    {
      type: 'list',
      title: 'Five kinds of change',
      numbered: true,
      items: [
        { head: 'Synonyms', text: 'to fix → to correct' },
        { head: 'Word shape', text: 'to validate → validation' },
        { head: 'Order of information', text: 'move the clause' },
        { head: 'Active / passive', text: 'be + past participle' },
        { head: 'Linking words', text: 'because → due to' }
      ],
      foot: 'A paraphrase with only synonyms is like a program that compiles but has not been tested.'
    },
    {
      type: 'table',
      title: 'The mock and the test: two hours',
      columns: ['Time', 'What you do'],
      rows: [
        ['5 min', 'Look through the whole paper and plan your time.'],
        ['30 min', 'Section 1: five sentences.'],
        ['35 min', 'Section 2: three pairs of sentences. Keep the link between the ideas.'],
        ['35 min', 'Section 3: two short paragraphs. Count the facts.'],
        ['15 min', 'Run the four test cases on every answer.']
      ],
      foot: 'No dictionaries, phones, translators or AI tools. Stuck? Move on and come back later.'
    },
    {
      type: 'list',
      title: 'The six most common bugs',
      wide: true,
      items: [
        { head: 'Copy-paste', text: 'Only one or two words changed. This is plagiarism, not paraphrasing. Change the grammar too.' },
        { head: 'Meaning changed', text: 'Cause and effect reversed, or the order of actions changed: checks then moves is not moves then checks.' },
        { head: 'Missing information', text: 'Small words carry meaning: only, always, most, some, last week. Count the facts.' },
        { head: 'Dictionary disaster', text: 'A technical term replaced by a dictionary word. Keep the term.' },
        { head: 'Broken grammar', text: 'The synonym has different grammar: "enable to do" and "discuss about" are both wrong.' },
        { head: 'Wrong length', text: 'Much longer (lots of explanation) or much shorter (information lost). Aim for about the same length.' }
      ]
    }
  ],

  tasks: [
    /* ---------------- Toolkit ---------------- */
    {
      id: 'para-swap',
      group: 'Toolkit',
      kind: 'match',
      title: 'The explanation swap',
      minutes: 5,
      does: 'Match eight technical terms with their explanations.',
      brief: [
        'Sometimes a technical term has no synonym, but it does have an explanation. Match each term with its explanation.'
      ],
      leftLabel: 'Term',
      rightLabel: 'Explanation',
      pairs: [
        { left: 'decomposition', right: 'breaking a large problem into smaller parts' },
        { left: 'a bug', right: 'a mistake in a program' },
        { left: 'a while loop', right: 'a loop that repeats as long as a condition is true' },
        { left: 'input validation', right: 'checking that what the user types is correct' },
        { left: 'a boolean', right: 'a value that is either True or False' },
        { left: 'snake case', right: 'lowercase words joined with underscores' },
        { left: 'a fence post problem', right: 'a loop that runs one time too many or too few' },
        { left: 'to concatenate', right: 'to join strings together' }
      ],
      after: 'Useful, but dangerous: an explanation makes your paraphrase longer. Use the swap once, not in every sentence.'
    },
    {
      id: 'para-shape',
      group: 'Toolkit',
      kind: 'gap',
      title: 'Word shape',
      minutes: 5,
      does: 'Turn eight words into a new shape: verb to noun, noun to verb.',
      brief: [
        'When you change the shape of a word, the grammar of the sentence has to change too. That is exactly what a paraphrase needs. Type the new shape of each word.'
      ],
      items: [
        { before: 'to decompose → the noun:', accept: ['decomposition', 'a decomposition', 'the decomposition'] },
        { before: 'to repeat → the noun:', accept: ['repetition', 'a repetition', 'the repetition'] },
        { before: 'valid / invalid → the verb:', accept: ['validate', 'to validate'] },
        { before: 'to execute → the noun:', accept: ['execution', 'an execution', 'the execution'] },
        { before: 'to read → the adjective:', accept: ['readable'] },
        { before: 'to solve → the noun:', accept: ['solution', 'a solution', 'the solution'] },
        { before: 'to rely on → the adjective:', accept: ['reliable'] },
        { before: 'a decision → the verb:', accept: ['decide', 'to decide'] }
      ],
      after: 'In a sentence: "It is important to validate the input." becomes "Input validation is essential."'
    },

    /* ---------------- Find the bug ---------------- */
    {
      id: 'para-bugs',
      group: 'Find the bug',
      kind: 'choice',
      title: 'Karel’s attempts',
      minutes: 8,
      does: 'Seven paraphrases by Karel. Name the bug in each one.',
      brief: [
        'Karel follows instructions perfectly, never gets tired and never complains. Karel is also a terrible paraphraser.',
        'Here are seven of Karel’s paraphrases. Karel is very proud of them. Most of them have a bug: name it.'
      ],
      attemptLabel: 'Karel’s paraphrase',
      options: ['Too close: copy-paste', 'Meaning changed', 'Information missing', 'Dictionary disaster', 'Broken grammar', 'No bug'],
      items: [
        {
          source: 'Debugging can take a long time, even for experienced programmers.',
          attempt: 'Debugging can take a long time, even for experienced coders.',
          answer: 0,
          why: 'Only one word has changed. That is copying, not paraphrasing.'
        },
        {
          source: 'A for loop repeats a block of code a fixed number of times.',
          attempt: 'A for circle repeats a group of code a fixed number of times.',
          answer: 3,
          why: 'A loop is not a circle. "For loop" is a technical term, so it stays.',
          reasons: { 0: 'True, very little has changed. But there is a worse bug. Look at "for circle".' }
        },
        {
          source: 'The drone checks its sensors before it moves.',
          attempt: 'The drone moves before it checks its sensors.',
          answer: 1,
          why: 'The order of the two actions is reversed.'
        },
        {
          source: 'The program crashed because the user typed a word instead of a number.',
          attempt: 'The program stopped working.',
          answer: 2,
          why: 'The reason has gone. Why did it crash?'
        },
        {
          source: 'Python programmers usually use snake case for variable names.',
          attempt: 'Snake case is generally used by Python developer for naming variables.',
          answer: 4,
          why: 'One developer? It needs a plural: "by Python developers".'
        },
        {
          source: 'The teacher found a bug in my code.',
          attempt: 'The teacher discovered an insect in my code.',
          answer: 3,
          why: 'A bug is a mistake in a program. No insects were harmed.'
        },
        {
          source: 'Readable code is easier for other people to understand.',
          attempt: 'Other people find it simpler to follow code that is clear and easy to read.',
          answer: 5,
          why: 'A good paraphrase: accurate, and in Karel’s own English. It had to happen once.'
        }
      ]
    },
    {
      id: 'para-closest',
      group: 'Find the bug',
      kind: 'choice',
      title: 'Which is closest?',
      minutes: 8,
      does: 'Five sources, four paraphrases each. Only one keeps the meaning.',
      brief: [
        'One of the four sentences has the same meaning as the source. The other three change it. Choose the closest one, and read why the others fail.'
      ],
      items: [
        {
          source: 'Around 30% of beginner programs fail on the first run because of a small syntax error.',
          options: [
            '30% of programs written by beginners contain syntax errors.',
            'Beginners make syntax errors 30% of the time.',
            'Nearly a third of programs by novices do not work the first time they are run, due to a minor syntax mistake.',
            'Small syntax errors cause beginners’ programs to crash every time they run.'
          ],
          answer: 2,
          why: 'Around 30% is nearly a third, "fail on the first run" is "do not work the first time they are run", and small is minor.',
          reasons: {
            0: 'It loses "fail" and "on the first run".',
            1: 'It is about people, not about programs.',
            3: '"Every time" is wrong. The source says the first run.'
          }
        },
        {
          source: 'The robot cannot pick up a parcel unless there is a parcel on its square.',
          options: [
            'The robot can only pick up a parcel if there is one on the square where it is standing.',
            'The robot picks up every parcel on its square.',
            'If there is no parcel, the robot puts one on its square.',
            'The robot cannot pick up parcels from its square.'
          ],
          answer: 0,
          why: '"Cannot … unless" means the same as "can only … if".',
          reasons: {
            1: 'This says what the robot always does. The source gives a condition.',
            2: 'The source never says that the robot puts a parcel down.',
            3: 'This says the robot can never do it. The source says it can, when a parcel is there.'
          }
        },
        {
          source: 'Students who test their code regularly tend to find bugs earlier than students who do not.',
          options: [
            'Students who find bugs early test their code more.',
            'Regular testing means that students’ code has no bugs.',
            'Students who do not test their code never find bugs.',
            'Bugs are usually found sooner by students who check their programs frequently.'
          ],
          answer: 3,
          why: '"Tend to" means "usually", and the active sentence has become passive.',
          reasons: {
            0: 'Cause and effect are reversed.',
            1: 'Too strong: "no bugs".',
            2: 'Too strong: "never".'
          }
        },
        {
          source: 'Although the while loop is more flexible, the for loop is easier for beginners to use.',
          options: [
            'Beginners find the while loop easier because it is more flexible.',
            'The for loop is simpler for novices, despite the greater flexibility of the while loop.',
            'The for loop is more flexible and easier than the while loop.',
            'Beginners should not use while loops because they are too flexible.'
          ],
          answer: 1,
          why: 'Although + clause has become despite + noun phrase. Both ideas and the contrast are still there.',
          reasons: {
            0: 'The source says the for loop is the easier one.',
            2: 'The source says the while loop is the more flexible one.',
            3: 'The source gives no advice about what beginners should not use.'
          }
        },
        {
          source: 'The teacher believes that learning to debug is just as important as learning to write code.',
          options: [
            'The teacher thinks that debugging is more important than writing code.',
            'The teacher believes that students learn to write code by debugging.',
            'According to the teacher, finding and fixing errors is as essential as writing programs.',
            'The teacher says that writing code is important but debugging is not.'
          ],
          answer: 2,
          why: '"Just as important as" means equal. "Finding and fixing errors" is the explanation swap for "debug".',
          reasons: {
            0: '"More important" is not "just as important".',
            1: 'The source compares two skills. It does not say that one is learnt through the other.',
            3: 'This makes the two unequal. The source says they are equal.'
          }
        }
      ]
    },

    /* ---------------- Write your own ---------------- */
    {
      id: 'para-guided',
      group: 'Write your own',
      kind: 'paraphrase',
      guided: true,
      title: 'Guided: the four stages',
      minutes: 15,
      does: 'Two sentences, one stage at a time: read, highlight, rewrite, check.',
      brief: [
        'Two sentences, taken slowly. Each stage opens when you finish the one before it: read and understand, highlight the words you can change, rewrite, then run the four tests.'
      ],
      items: [
        {
          label: 'Sentence',
          source: 'Many students find while loops difficult to understand at first.',
          understand: {
            question: 'Which is true?',
            options: [
              'All students find while loops difficult.',
              'While loops are hard for many students in the beginning.',
              'Students never understand while loops.'
            ],
            answer: 1
          },
          change: ['Many', 'difficult', 'at first'],
          keep: [['while loops', 'while loop']],
          mustKeep: [
            { label: 'many', any: ['many', 'a lot of', 'lots of', 'numerous', 'a large number of', 'a great number of', 'plenty of'] },
            { label: 'at first', any: ['at first', 'beginning', 'initially', 'to begin with', 'at the start', 'early on', 'when they start', 'first'] }
          ],
          tries: 'many → a lot of · difficult → challenging · at first → at the beginning',
          models: ['A lot of students find it challenging to understand while loops at the beginning.'],
          watch: '"While loops" is a technical term, so it stays.'
        },
        {
          label: 'Sentence',
          source: 'It is important to test a program with different inputs.',
          understand: {
            question: 'Which is true?',
            options: [
              'One input is enough to test a program.',
              'Different programs need different tests.',
              'Testing with more than one kind of input matters.'
            ],
            answer: 2
          },
          change: ['important', 'test', 'different'],
          tries: 'test → testing (word shape!) · important → essential · different → a variety of',
          models: ['Testing a program with a variety of inputs is essential.'],
          watch: 'The model changes the word shape (test → testing), so the whole grammar of the sentence changes.'
        }
      ]
    },
    {
      id: 'para-format',
      group: 'Write your own',
      kind: 'paraphrase',
      title: 'Test format',
      minutes: 25,
      does: 'One item from each section of the test, with the four test cases.',
      brief: [
        'One item from each section of the test. Follow the four-stage process for each one, then run the tests. A model answer opens after your first test run.'
      ],
      items: [
        {
          label: 'Section 1: a sentence',
          source: 'Karel the robot can only turn left, so a right turn requires three left turns.',
          change: ['can', 'so', 'requires'],
          keep: ['Karel'],
          allow: ['Karel the robot', 'three left turns', 'turn left', 'left turns', 'right turn', 'turn right'],
          mustKeep: [{ label: 'only', any: ['only', 'just', 'solely', 'nothing but', 'no other'] }],
          models: ['As Karel the robot is only able to turn left, it has to make three left turns in order to turn right.'],
          watch: 'Keep "only" and "three": small words and numbers carry meaning. "Karel" is a name, so it stays.'
        },
        {
          label: 'Section 2: a pair of sentences',
          source: 'A syntax error stops the program before it runs. A logic error is harder to find because the program runs but gives the wrong answer.',
          tip: 'You can join the two sentences into one or keep two. The link between the ideas (because) must stay.',
          change: ['stops', 'harder', 'gives', 'wrong answer'],
          keep: [['syntax error', 'syntax errors'], ['logic error', 'logic errors']],
          allow: ['the program', 'a program', 'to find'],
          models: ['A syntax error prevents a program from running at all. Logic errors are more difficult to find, since the program runs but produces an incorrect result.'],
          watch: 'The reason is still there: because → since.'
        },
        {
          label: 'Section 3: a short paragraph',
          source: 'Decomposition is a key skill in computational thinking. It means breaking a large problem into smaller parts. Each small part can then be solved with a short function. This makes the program easier to write, test and fix.',
          tip: 'Work sentence by sentence. Count the pieces of information in the source first, then count them again in your paraphrase.',
          facts: 4,
          change: ['key', 'breaking', 'large', 'parts', 'easier', 'fix'],
          keep: ['decomposition', 'computational thinking', ['function', 'functions']],
          allow: ['a short function', 'the program', 'can then be solved', 'to write, test and'],
          models: ['Decomposition is an essential skill in computational thinking, which involves dividing a big problem into smaller pieces. Each of these pieces can then be solved using a short function, which makes the program simpler to write, test and correct.'],
          watch: 'Four facts in, four facts out. "Decomposition" can stay: it is a technical term.'
        }
      ]
    },
    {
      id: 'para-rover',
      group: 'Write your own',
      kind: 'paraphrase',
      title: 'The rover’s diary',
      minutes: 10,
      does: 'Three lines from a bored Mars rover, with hints.',
      brief: [
        'Rover R-2 has been on Mars for 412 days. Its diary reads: "Still no aliens. I collected another rock. It looks exactly like the last 300 rocks."',
        'Report what the rover says. "I" becomes "the rover" or "it". The hints are there if you want them.'
      ],
      items: [
        {
          label: 'Day 412, line 1',
          source: 'There are still no aliens on Mars.',
          change: ['still', 'no aliens'],
          keep: ['Mars'],
          tries: 'still → so far · no aliens → no sign of alien life · change the subject: The rover has…',
          models: ['So far, the rover has not found any sign of alien life on Mars.']
        },
        {
          label: 'Day 412, line 2',
          source: 'I collected another rock, and it looks exactly like the last 300 rocks.',
          change: ['collected', 'looks exactly like', 'last'],
          tries: 'collected → gathered · looks exactly like → is identical to · last → previous',
          models: ['The rover gathered one more rock, which is identical to the previous 300.'],
          watch: 'The number stays. The rover has counted every one of them.'
        },
        {
          label: 'Day 412, line 3',
          source: 'My battery is low, so I will sleep until the sun comes up.',
          change: ['low', 'sleep', 'the sun comes up'],
          tries: 'so → As… (change the order!) · battery is low → running out of power · sleep → switch off',
          models: ['As its battery is running out of power, the rover will switch off until sunrise.'],
          watch: 'So → as: the linking word changes, and the reason moves to the front.'
        }
      ]
    }
  ]
};
