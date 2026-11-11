/*
  data/summarising.js — block 2, weeks 6 to 8.

  The rules, Karel's rules, the signposts, Talk 2 (accessibility) and the
  three UX summaries come from the week 6 slides and handouts. The HTTPS
  text is the summary task that used to live on the Tech Practice Hub
  (web-w8-01). The talk "What happens when you press Enter?" is new.
  Nothing here comes from the mock paper or from the real test papers.
*/
window.Hub = window.Hub || {};
Hub.BLOCKS = Hub.BLOCKS || {};

Hub.BLOCKS.summarising = {
  id: 'summarising',
  title: 'Summarising',
  weeks: 'Weeks 6 to 8',
  goal: 'Portfolio task 2',
  intro: 'Take notes, keep the main ideas, lose the rest. The test has a listening summary and an article summary, so you practise both here.',
  sockLine: 'Before you go: what colour socks is your teacher wearing today? One line. No opinion.',

  rules: [
    {
      type: 'columns',
      title: 'A summary is a paraphrase that has been on a diet',
      wide: true,
      columns: [
        { head: 'Paraphrase', points: ['the same length', 'all the information', 'your own words'] },
        { head: 'Diet', points: ['delete the examples', 'delete the numbers', 'delete the small details'] },
        { head: 'Summary', points: ['about a third of the length', 'main ideas only', 'your own words'] }
      ],
      foot: 'Everything from the paraphrasing weeks still applies: the five changes and the four test cases. Technical terms stay.'
    },
    {
      type: 'columns',
      title: 'Do and don’t',
      columns: [
        { head: 'Do', points: [
          'Main ideas only: delete examples, numbers and small details.',
          'Your own words: use all five paraphrasing tools.',
          'First sentence = the source + a reporting verb + the topic.',
          'Same meaning, same order as the source.',
          'About a third of the length, in one paragraph.',
          'Keep technical terms (HTML, alt text, screen reader).'
        ] },
        { head: 'Don’t', points: [
          'Copy sentences or long phrases.',
          'Include every example.',
          'Add your opinion ("I think", "terrible").',
          'Add information that is not in the source.',
          'Change the strength of a claim (may → will).'
        ] }
      ]
    },
    {
      type: 'list',
      title: 'Five test cases for a summary',
      numbered: true,
      items: [
        { head: 'Main ideas', text: 'All the main ideas are there. Examples and small details are gone.' },
        { head: 'Nothing added', text: 'No opinion, no new information.' },
        { head: 'Own words', text: 'Vocabulary and grammar changed. Technical terms kept.' },
        { head: 'Same meaning, same order', text: 'Nothing stronger, weaker or in a different sequence.' },
        { head: 'Form', text: 'The first sentence names the source and the topic. One paragraph. About a third of the length.' }
      ]
    },
    {
      type: 'flow',
      title: 'The first sentence of a summary',
      wide: true,
      joiner: '+',
      steps: [
        { head: 'Source', lines: ['The speaker', 'The talk', 'The article', 'The author', 'The text'] },
        { head: 'Reporting verb', lines: ['explains that…', 'describes…', 'argues that…', 'points out that…', 'recommends…', 'warns that…'] },
        { head: 'Topic', lines: ['the main idea in one line', 'not the details'] }
      ],
      foot: 'Example: The speaker explains that accessibility means designing websites that everyone can use, and describes five common problems.'
    },
    {
      type: 'list',
      title: 'Eight note-taking rules',
      numbered: true,
      wide: true,
      items: [
        { head: 'Key words, not sentences', text: 'You cannot write as fast as people talk.' },
        { head: 'Symbols and abbreviations', text: '→  =  ≠  +  &  w/  e.g.  !!  ×' },
        { head: 'One idea per line', text: 'Indent details under the main point.' },
        { head: 'Numbers, names, terms: exactly', text: '1 in 6, h1, alt text, WHO' },
        { head: 'Use the signposts', text: '"There are five…": number your notes 1 to 5.' },
        { head: 'Listen first, then write', text: 'Let the speaker finish the idea.' },
        { head: 'Leave space', text: 'You will add things on the second listening.' },
        { head: 'Make the notes yours', text: 'CAPITALS, boxes, arrows, underlining.' }
      ]
    },
    {
      type: 'table',
      title: 'The mock and the test',
      wide: true,
      columns: ['Part', 'What you do', 'Mock', 'Test'],
      rows: [
        ['Part 1', 'Listen to a short talk twice, take notes, write a summary.', '30 min', '50 min'],
        ['Part 2', 'Read an article and write a one-paragraph summary.', '40 min', '55 min'],
        ['Check', 'Run the five test cases on both summaries.', '10 min', '15 min']
      ],
      foot: 'Notes are allowed. Phones, translators, AI tools and dictionaries are not.'
    }
  ],

  tasks: [
    /* ---------------- The rules ---------------- */
    {
      id: 'sum-rules',
      group: 'The rules',
      kind: 'choice',
      title: 'Karel’s rules: find the bugs',
      minutes: 5,
      does: 'Karel wrote eight rules for summarising. Four are wrong.',
      brief: [
        'Karel has recently discovered the internet and has written eight rules for summarising. Four of them have bugs. Decide which, and read the fix.'
      ],
      options: ['Good rule', 'Has a bug'],
      items: [
        { prompt: 'Start with a sentence that names the source and the topic.', answer: 0,
          why: 'The source, a reporting verb and the topic: "The speaker explains that…".' },
        { prompt: 'Copy the best sentence from the source, so your summary is accurate.', answer: 1,
          why: 'The fix: never copy. Use your own words and your own grammar.' },
        { prompt: 'Include every example, because examples are interesting.', answer: 1,
          why: 'The fix: leave examples and small details out.' },
        { prompt: 'Keep technical terms such as HTML and screen reader.', answer: 0,
          why: 'Technical terms stay. Change the words around them.' },
        { prompt: 'Finish with your own opinion about the topic.', answer: 1,
          why: 'The fix: no opinion. Report, do not comment.' },
        { prompt: 'Aim for about a third of the length of the source.', answer: 0,
          why: 'About a third, in one paragraph.' },
        { prompt: 'Change the order of the ideas to make the summary more exciting.', answer: 1,
          why: 'The fix: keep the same order and the same meaning. A summary is not meant to be exciting.' },
        { prompt: 'Use a reporting verb: explains, describes, argues, points out.', answer: 0,
          why: 'The article describes…, the speaker points out that…' }
      ],
      after: 'Four good rules out of eight. Karel is improving. Slowly.'
    },
    {
      id: 'sum-signposts',
      group: 'The rules',
      kind: 'match',
      title: 'Signposts: what comes next?',
      minutes: 5,
      does: 'Match eight things speakers say with what they tell you to expect.',
      brief: [
        'Speakers tell you what is coming. If you hear the signpost, you know what to write, and what you can skip. Match each signpost with its job.'
      ],
      leftLabel: 'The speaker says',
      rightLabel: 'What is coming',
      pairs: [
        { left: '"Today I want to explain…"', right: 'the topic: write it at the top' },
        { left: '"There are three reasons…"', right: 'a list is coming: number your notes' },
        { left: '"For example…" / "such as…"', right: 'an example: note it in two or three words, or skip it' },
        { left: '"The most important thing is…"', right: 'a main idea: write it down' },
        { left: '"In other words…"', right: 'the same idea again, said differently: you can relax' },
        { left: '"However…" / "On the other hand…"', right: 'a contrast or a problem' },
        { left: '"This means that…" / "As a result…"', right: 'a result or consequence' },
        { left: '"To sum up…" / "Finally…"', right: 'the end: check you have all the main ideas' }
      ]
    },

    /* ---------------- Main ideas ---------------- */
    {
      id: 'sum-main',
      group: 'Main ideas',
      kind: 'choice',
      title: 'Main idea or detail?',
      minutes: 6,
      does: 'Eight sentences from a talk about accessibility. Which go in the summary?',
      brief: [
        'These eight sentences come from the talk "A web for everyone". A main idea goes into the summary. A detail or an example stays out.'
      ],
      passage: {
        title: 'Read the talk: A web for everyone',
        paragraphs: [
          'Imagine you cannot see the screen. Your computer reads the page aloud, using a program called a screen reader. Now imagine the page has a photo of the new library, and the designer forgot to add alt text. Your screen reader says just one word: "image". Not very helpful.',
          'Accessibility means designing websites that everyone can use, including people who use a screen reader, people who use only a keyboard, and people with low vision. This is not a small group: according to the World Health Organization, about one in six people in the world live with a significant disability.',
          'There are five problems I see again and again. Number one: images without alt text. Number two: headings in the wrong order, for example a page that jumps from h1 straight to h4. A screen reader uses headings like a contents page, so a missing level is confusing. Number three: low contrast. Grey text on a grey background is hard for everyone and impossible for some. Number four: fake buttons. A button made from a div looks like a button, but you cannot reach it with the Tab key. And number five: form boxes with no label, so the user does not know what to type.',
          'The good news is that all five problems are easy to fix. And in your next lab, you are going to find them yourselves.'
        ]
      },
      options: ['Main idea', 'Detail'],
      items: [
        { prompt: 'Accessibility means designing websites that everyone can use.', answer: 0, why: 'This is the definition: the centre of the talk.' },
        { prompt: 'The designer forgot to add alt text to a photo of the new library.', answer: 1, why: 'An example. It stays out.' },
        { prompt: 'A large number of people are affected: about one in six worldwide.', answer: 0, why: 'It says why the topic matters.' },
        { prompt: 'There are five common problems that make pages hard to use.', answer: 0, why: 'The structure of the talk. In a summary the five problems are named in one list.' },
        { prompt: 'Grey text on a grey background is hard to read.', answer: 1, why: 'An example of low contrast.' },
        { prompt: 'A page that jumps from h1 straight to h4.', answer: 1, why: 'An example of headings in the wrong order.' },
        { prompt: 'All five problems are easy to fix.', answer: 0, why: 'The conclusion of the talk.' },
        { prompt: 'In the next lab, the students will find the problems themselves.', answer: 1, why: 'True, but it is about the class, not about accessibility.' }
      ],
      after: 'In a summary, the five problems are named in one list, without their examples.'
    },
    {
      id: 'sum-three',
      group: 'Main ideas',
      kind: 'choice',
      title: 'Three summaries: which is best?',
      minutes: 8,
      does: 'One 100-word text, three summaries. One copies, one comments, one wins.',
      brief: [
        'Read the source text. Then read summaries A, B and C. One of them copies, one of them comments, and one of them is a summary.'
      ],
      passage: {
        title: 'Source text: What is UX? (100 words)',
        open: true,
        paragraphs: [
          'User experience, or UX, is how a person feels when they use a website or an app: is it easy, fast and clear, or slow and confusing? Good UX follows a few simple ideas. First, be consistent: put the menu in the same place on every page. Second, give feedback: when a user presses "Submit", show a message so they know it worked. Third, reduce effort: the university’s old timetable page needed seven clicks to find Monday; the new one needs one. Finally, test with real users, because designers are not typical users – they already know where everything is.'
        ]
      },
      options: ['It copies', 'It comments', 'The winner'],
      items: [
        {
          attemptLabel: 'Summary A',
          attempt: 'UX is how a person feels when they use a website or an app. Good UX follows a few simple ideas. Be consistent: put the menu in the same place on every page. Give feedback: when a user presses "Submit", show a message so they know it worked. The old timetable page needed seven clicks to find Monday; the new one needs one. Test with real users.',
          answer: 0,
          why: 'It copies whole sentences, it keeps the example (seven clicks to find Monday), and at 67 words it is nearly as long as the source.'
        },
        {
          attemptLabel: 'Summary B',
          attempt: 'I think UX is very important and all websites should be easy to use. The university timetable page was terrible, which is true in my experience, and in my opinion designers should test their websites with students like us.',
          answer: 1,
          why: 'It adds opinion ("I think", "terrible", "in my opinion"), it misses three of the four ideas, and it adds information that is not in the source.'
        },
        {
          attemptLabel: 'Summary C',
          attempt: 'The text explains that user experience (UX) means how easy and clear a website feels to its users, and gives four principles for good UX: keep the layout consistent, confirm users’ actions, reduce the number of steps a task needs, and test the design with real users rather than relying on the designers’ own view.',
          answer: 2,
          why: 'All four ideas and no examples. Its own words and its own grammar. The first sentence names the source and the topic. About half the length, in one paragraph.'
        }
      ]
    },
    {
      id: 'sum-first',
      group: 'Main ideas',
      kind: 'choice',
      title: 'Choose the best first sentence',
      minutes: 4,
      does: 'Two summaries need an opening sentence. Four candidates each.',
      brief: [
        'The first sentence of a summary names the source, uses a reporting verb and gives the topic. Choose the opening that does all three.'
      ],
      items: [
        {
          prompt: 'Which sentence opens a summary of the talk "A web for everyone"?',
          options: [
            'Accessibility is very important for websites.',
            'The speaker explains that accessibility means designing websites that everyone can use, and describes five common problems.',
            'In this talk there are many interesting points about websites and disability.',
            'Imagine you cannot see the screen.'
          ],
          answer: 1,
          why: 'It names the source, the topic and the structure of the talk.',
          reasons: {
            0: 'An opinion, and too general.',
            2: 'It says nothing about the content.',
            3: 'It copies the first sentence of the source.'
          }
        },
        {
          prompt: 'Which sentence opens a summary of the text "What is UX?"',
          options: [
            'Good UX is really important for every website.',
            'User experience, or UX, is how a person feels when they use a website or an app.',
            'The text is about a timetable page that needed seven clicks.',
            'The text explains what user experience (UX) is and gives four principles for good UX.'
          ],
          answer: 3,
          why: 'Source, reporting verb, topic. Nothing else.',
          reasons: {
            0: 'An opinion, and too general.',
            1: 'It copies the first sentence of the source.',
            2: 'The timetable page is an example, not the topic.'
          }
        }
      ]
    },

    /* ---------------- Write your own ---------------- */
    {
      id: 'sum-https',
      group: 'Write your own',
      kind: 'summary',
      title: 'Article summary: HTTPS',
      minutes: 20,
      does: 'Read a short text, take notes in the frame, write 35 to 50 words.',
      brief: [
        'Read the text. Take notes in the frame: key words, not sentences. Then write a one-paragraph summary from your notes, and run the five test cases.'
      ],
      source: {
        type: 'text',
        noun: 'text',
        title: 'How HTTPS protects your data',
        text: 'When you open a website, your browser and the site’s server send messages to each other across the internet. Those messages pass through many other computers on the way, and any of them could read the messages if they were sent as plain text. HTTPS solves this with encryption. Before any data is sent, the browser and the server agree on a secret key that only they know. Every message is then scrambled with that key, so a computer in the middle sees only meaningless characters. HTTPS also proves that the server really is the site it claims to be. That is why your browser shows a padlock: your password and your card number travel safely, to the real site.'
      },
      frame: [
        { label: 'Topic', hint: 'one or two words' },
        { label: 'Main idea', hint: 'one line' },
        { label: 'Key points', hint: 'key words, one idea per line' },
        { label: 'Examples to leave out', hint: 'two or three words each' }
      ],
      range: [35, 50],
      keep: ['HTTPS', 'browser', ['server', 'servers']],
      ideas: [
        { label: 'messages pass through other computers, which could read them', any: ['other computers', 'on the way', 'in between', 'in the middle', 'intercept', 'intercepted', 'pass through', 'travel through', 'third parties'] },
        { label: 'HTTPS encrypts the messages with a secret key', any: ['encrypt', 'encryption', 'scramble', 'key'] },
        { label: 'HTTPS proves that the server is the real site', any: ['genuine', 'real', 'identity', 'authentic', 'claims to be', 'prove', 'proof', 'confirm', 'verify', 'fake'] }
      ],
      details: [
        { label: 'the padlock', any: ['padlock'] },
        { label: 'the password and the card number', any: ['password', 'card number', 'credit card'] }
      ],
      modelNotes: [
        'TOPIC: HTTPS',
        'MAIN IDEA: HTTPS = encryption → msgs browser ↔ server stay private',
        '1 msgs pass thru many other computers → could read (plain text)',
        '2 browser + server agree SECRET KEY → every msg scrambled',
        '3 also proves server = real site',
        'LEAVE OUT: padlock, password, card number'
      ],
      model: 'The text explains that HTTPS keeps the messages between a browser and a server private. Because they travel through other computers, they are encrypted with a key shared only by the two sides. HTTPS also confirms that the server is genuine.',
      kept: 'Kept: the problem, the encryption, the proof of identity.',
      deleted: 'Deleted: the padlock, the password, the card number, "meaningless characters".'
    },
    {
      id: 'sum-enter',
      group: 'Write your own',
      kind: 'summary',
      title: 'Listening summary: press Enter',
      minutes: 25,
      does: 'Listen to a short talk twice, take notes, write 50 to 70 words.',
      brief: [
        'You will hear a short talk. In the test you hear it twice, so play it twice here. Take notes in the frame while you listen. Then write a one-paragraph summary from your notes and run the five test cases.',
        'The talk is read by your browser’s own voice. You need headphones.'
      ],
      source: {
        type: 'talk',
        noun: 'speaker',
        title: 'What happens when you press Enter?',
        text: 'Today I want to explain what happens when you type a web address and press Enter. It takes less than a second, but there are three steps.\n\nStep one: finding the address. Computers do not understand names like beds.ac.uk. They use numbers, called IP addresses. So your browser first asks a DNS server, which works like a phone book for the internet: which number belongs to this name?\n\nStep two: the request. Now that the browser knows where to go, it sends a short message to the web server at that address. In other words, it asks: please send me this page.\n\nStep three: the response. The server finds the page and sends it back with a status code. For example, 200 means OK, and 404 means page not found. You have probably met that one. The browser then reads the HTML, CSS and JavaScript and draws the page on your screen.\n\nTo sum up: the browser finds the address, sends a request and receives a response. It does this again for every page you open, and it never asks for a holiday.',
        // The same talk, spelt the way a computer voice needs it.
        say: 'Today I want to explain what happens when you type a web address and press Enter. It takes less than a second, but there are three steps. Step one: finding the address. Computers do not understand names like beds dot A C dot U K. They use numbers, called I P addresses. So your browser first asks a D N S server, which works like a phone book for the internet: which number belongs to this name? Step two: the request. Now that the browser knows where to go, it sends a short message to the web server at that address. In other words, it asks: please send me this page. Step three: the response. The server finds the page and sends it back with a status code. For example, two hundred means OK, and four oh four means page not found. You have probably met that one. The browser then reads the H T M L, C S S and JavaScript, and draws the page on your screen. To sum up: the browser finds the address, sends a request and receives a response. It does this again for every page you open, and it never asks for a holiday.'
      },
      frame: [
        { label: 'Topic', hint: 'one or two words' },
        { label: 'Main idea', hint: 'one line' },
        { label: 'Key points', hint: 'numbered: the speaker tells you how many' },
        { label: 'Examples', hint: 'two or three words each, or skip them' },
        { label: 'Numbers and names', hint: 'exactly' }
      ],
      range: [50, 70],
      keep: ['DNS', ['IP address', 'IP addresses'], 'browser', ['server', 'servers']],
      ideas: [
        { label: 'there are three steps', any: ['three steps', 'three stages', 'three things', '3 steps', 'three parts'] },
        { label: 'step 1: the browser asks a DNS server for the IP address', any: ['DNS'] },
        { label: 'step 2: the browser sends a request to the web server', any: ['request', 'asks for the page', 'ask for the page', 'asks the server'] },
        { label: 'step 3: the server sends the page back', any: ['response', 'returns', 'sends back', 'sends the page', 'send it back', 'sends it back', 'replies', 'reply'] },
        { label: 'this happens for every page', any: ['every page', 'each page', 'repeated', 'again', 'every time'] }
      ],
      details: [
        { label: 'the phone book', any: ['phone book', 'phonebook'] },
        { label: 'the codes 200 and 404', any: ['200', '404'] },
        { label: 'beds.ac.uk', any: ['beds'] },
        { label: 'the holiday', any: ['holiday'] }
      ],
      modelNotes: [
        'TOPIC: web address + Enter → what happens?',
        'MAIN IDEA: < 1 sec, 3 steps',
        '1 FIND ADDRESS: names ≠ numbers (IP addresses) → browser asks DNS server (= phone book)',
        '2 REQUEST: browser → web server: "send me this page"',
        '3 RESPONSE: server → page + status code (e.g. 200 OK, 404 not found) → browser reads HTML / CSS / JS, draws page',
        'SUM: find address → request → response · again for EVERY page'
      ],
      model: 'The speaker explains what happens when a user enters the address of a website, and describes three steps. First, the browser asks a DNS server for the IP address that belongs to the name. Second, it sends a request for the page to the web server. Third, the server returns the page and a status code, and the browser displays it. This is repeated for every page.',
      kept: 'Kept: the three steps and the last point, that it happens for every page.',
      deleted: 'Deleted: beds.ac.uk, the phone book, 200 and 404, "less than a second", the holiday.'
    }
  ]
};
