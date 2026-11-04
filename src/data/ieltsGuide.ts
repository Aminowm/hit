import type { IeltsSkill } from '../lib/types';

/**
 * IELTS Academic guide content, per skill. Criteria wording is paraphrased from
 * the public band descriptors on ielts.org; timings follow the official format.
 */
export interface SkillGuide {
  skill: IeltsSkill;
  title: string;
  stats: { label: string; value: string }[];
  format: string[];
  criteria: { name: string; detail: string }[];
  strategies: string[];
  routine: string;
}

export const IELTS_GUIDE: Record<IeltsSkill, SkillGuide> = {
  writing: {
    skill: 'writing',
    title: 'Writing',
    stats: [
      { label: 'Time', value: '60 min' },
      { label: 'Tasks', value: '2' },
      { label: 'Words', value: '150 + 250' },
    ],
    format: [
      'Task 1 (about 20 minutes, at least 150 words): describe a graph, table, chart, map or process. Report what it shows; give no opinion.',
      'Task 2 (about 40 minutes, at least 250 words): an essay responding to a point of view, argument or problem.',
      'Task 2 is worth twice as much as Task 1. Writing under the word count is penalised, so aim for 170+ and 270+.',
    ],
    criteria: [
      { name: 'Task Achievement / Task Response', detail: 'Answer every part of the question. Task 1 needs a clear overview and accurate key figures; Task 2 needs a clear position all the way through, with ideas extended and supported.' },
      { name: 'Coherence & Cohesion', detail: 'Logical paragraphs with one central idea each, linking words used accurately and not mechanically, and clear referencing (this, these, which).' },
      { name: 'Lexical Resource', detail: 'Range and precision of vocabulary, natural collocations, and few errors in spelling or word formation.' },
      { name: 'Grammatical Range & Accuracy', detail: 'A mix of simple and complex sentences, with most sentences error-free and accurate punctuation.' },
    ],
    strategies: [
      'Spend 3–5 minutes planning Task 2 before writing: position, two main ideas, one example each.',
      'In Task 1, group the data and compare; never list every number.',
      'Paraphrase the question in your introduction instead of copying it; copied wording earns no credit.',
      'Leave 3 minutes to check articles, plurals, subject–verb agreement and tense consistency.',
    ],
    routine: 'Write one Task 1 and one Task 2 under time each week, mark them against the band descriptors, and log the recurring errors in the Mistake Log.',
  },
  speaking: {
    skill: 'speaking',
    title: 'Speaking',
    stats: [
      { label: 'Time', value: '11–14 min' },
      { label: 'Parts', value: '3' },
      { label: 'Format', value: 'Face to face' },
    ],
    format: [
      'Part 1 (4–5 minutes): questions about you and familiar topics such as home, work or study, and hobbies.',
      'Part 2 (3–4 minutes): a task card. You get 1 minute to prepare (notes allowed), then speak for up to 2 minutes.',
      'Part 3 (4–5 minutes): a discussion of more abstract questions linked to the Part 2 topic.',
    ],
    criteria: [
      { name: 'Fluency & Coherence', detail: 'Speak at length without long pauses, and connect ideas logically with discourse markers.' },
      { name: 'Lexical Resource', detail: 'Vocabulary for any topic, paraphrasing when a word is missing, and some idiomatic language used naturally.' },
      { name: 'Grammatical Range & Accuracy', detail: 'Varied structures (conditionals, passives, relative clauses) with mostly error-free sentences.' },
      { name: 'Pronunciation', detail: 'Easy to understand throughout: word and sentence stress, intonation and chunking. Your accent itself is not penalised.' },
    ],
    strategies: [
      'Part 1: answer, then add a reason or an example, two or three sentences in total.',
      'Part 2: write one keyword per bullet, tell it as a story in past tenses, and end with how you felt about it.',
      'Part 3: opinion → reason → example → a contrasting view. Compare past and present, and speculate about the future.',
      'Memorised answers are easy to spot and score poorly. Practise ideas and phrases, not scripts.',
    ],
    routine: 'Record one Part 2 card a day on your phone. Listen back for long pauses, repeated words and grammar slips, then record it again.',
  },
  listening: {
    skill: 'listening',
    title: 'Listening',
    stats: [
      { label: 'Time', value: '≈30 min' },
      { label: 'Questions', value: '40' },
      { label: 'Recordings', value: '4' },
    ],
    format: [
      'Part 1: a conversation in an everyday setting, such as booking or enquiring.',
      'Part 2: a monologue in an everyday setting, such as a tour or an announcement.',
      'Part 3: a conversation in an educational setting, such as students discussing an assignment.',
      'Part 4: an academic lecture, with no break in the middle.',
      'Each recording is heard once. On paper you get 10 minutes to transfer answers; on computer, 2 minutes to check them.',
    ],
    criteria: [
      { name: 'One mark per question', detail: '40 questions, converted to a band. About 30–31 correct is band 7 and 35–36 is band 8.' },
      { name: 'Spelling and word limits count', detail: 'A misspelled or over-length answer is wrong. British and American spellings are both accepted.' },
    ],
    strategies: [
      'Use every pause to read ahead, underline keywords and predict the type of answer (number, name, noun).',
      'Expect distractors: speakers correct themselves or change plans, so the final information counts.',
      'Watch plurals, units and dates (“15th March”, “£40”); one missing letter loses the mark.',
      'Never leave a blank; there is no penalty for a wrong guess.',
    ],
    routine: 'Do one Cambridge test section daily. After marking, replay it with the transcript and find exactly where each missed answer was said.',
  },
  reading: {
    skill: 'reading',
    title: 'Reading',
    stats: [
      { label: 'Time', value: '60 min' },
      { label: 'Questions', value: '40' },
      { label: 'Passages', value: '3' },
    ],
    format: [
      'Three long academic passages from books, journals, magazines and newspapers, getting harder from passage 1 to 3.',
      'Question types include True/False/Not Given, Yes/No/Not Given, matching headings, matching information, sentence and summary completion, diagram labels and multiple choice.',
      'There is no extra time to transfer answers, so write them on the answer sheet as you go.',
    ],
    criteria: [
      { name: 'One mark per question', detail: '40 questions, converted to a band. About 30–32 correct is band 7 and 35–36 is band 8 (Academic).' },
      { name: 'Copy exactly', detail: 'Completion answers must use words from the passage, spelled correctly and within the word limit.' },
    ],
    strategies: [
      'Budget about 20 minutes per passage, taking more for passage 3.',
      'Skim the passage for 2–3 minutes first, then scan for each question’s keywords and their paraphrases.',
      'Most answers follow passage order; matching headings and matching information do not.',
      'Don’t spend more than 2 minutes on one question. Guess, mark it, move on and come back.',
    ],
    routine: 'Do one passage under timing every day. Then, for each wrong answer, find the exact sentence that proves the right answer.',
  },
};

export const TASK1_STRUCTURE = [
  { step: 'Introduction', detail: 'Paraphrase what the visual shows in one sentence.' },
  { step: 'Overview', detail: 'Two or three main trends or features, with no detailed numbers.' },
  { step: 'Body paragraph 1', detail: 'Group related data and compare it, with key figures.' },
  { step: 'Body paragraph 2', detail: 'The remaining group, compared the same way. No conclusion or opinion needed.' },
];

export const TASK2_TYPES = [
  { type: 'Opinion', prompt: '“To what extent do you agree or disagree?”', plan: 'Introduction with a clear position → two reasons, one paragraph each → conclusion restating the position.' },
  { type: 'Discussion', prompt: '“Discuss both views and give your own opinion.”', plan: 'Introduction with your view → paragraph on view A → paragraph on view B → conclusion.' },
  { type: 'Advantages & disadvantages', prompt: '“Do the advantages outweigh the disadvantages?”', plan: 'Introduction with your answer → advantages → disadvantages → conclusion that weighs them.' },
  { type: 'Problem / cause & solution', prompt: '“What are the causes? What can be done?”', plan: 'Introduction → causes or problems → solutions → conclusion.' },
  { type: 'Two-part question', prompt: '“Why is this happening? Is it a positive development?”', plan: 'Introduction → answer question 1 → answer question 2 → conclusion.' },
];

/** Linking language by function; `practice` points at the matching Testify flashcards where they exist. */
export const LINKING_WORDS: { group: string; words: string[]; practice?: string }[] = [
  { group: 'Addition', words: ['Moreover', 'Furthermore', 'In addition', 'Besides', 'What is more', 'Not only … but also'], practice: 'testify-linking-addition' },
  {
    group: 'Exemplification & clarification',
    words: ['For example', 'For instance', 'Such as', 'Namely', 'To illustrate', 'In other words', 'That is to say'],
    practice: 'testify-linking-exemplification',
  },
  { group: 'Contrast & concession', words: ['However', 'Nevertheless', 'On the other hand', 'Whereas', 'Although', 'Despite (+ noun)'] },
  { group: 'Cause & effect', words: ['Therefore', 'Consequently', 'As a result', 'Thus', 'Due to (+ noun)', 'Owing to (+ noun)'] },
  { group: 'Concluding', words: ['In conclusion', 'To sum up', 'On balance', 'Overall (Task 1 overview)'] },
];

export const SPEAKING_PHRASES: { group: string; phrases: string[] }[] = [
  { group: 'Buying time', phrases: ['That’s an interesting question…', 'Let me think about that for a moment…', 'I’ve never really thought about it, but…'] },
  { group: 'Giving opinions', phrases: ['From my perspective…', 'I’d argue that…', 'I’m inclined to think that…'] },
  { group: 'Speculating', phrases: ['It’s quite likely that…', 'In the long run, I suspect…', 'If things carry on like this…'] },
  { group: 'Paraphrasing a missing word', phrases: ['What I mean is…', 'It’s a kind of…', 'I can’t think of the exact word, but it’s used for…'] },
];

export const WRITING_CHECKLIST = [
  'Did I answer every part of the question?',
  'Task 1: is there a clear overview?',
  'Task 2: is my position clear in the introduction and the conclusion?',
  'Does each body paragraph have one main idea, an explanation and an example?',
  'Word count: 150+ for Task 1 and 250+ for Task 2?',
  'Checked articles, plurals, subject–verb agreement and tenses?',
];
