import type { Course } from '../../lib/types';
import { unit } from './build';

/**
 * IELTS Academic — the four skills, broken into the parts and question types
 * that appear on the test. Each skill is a quarter of the overall band.
 */
export const IELTS_COURSE: Course = {
  exam: 'ielts',
  title: 'IELTS Academic',
  source: 'IELTS test format (ielts.org) and the public Writing & Speaking band descriptors',
  units: [
    unit('ielts', 'L', 'Listening', [25, 25], [
      ['L1', 'Part 1: everyday conversation (form & note completion)', 'Names, numbers and dates must be spelled exactly; practise listening to spelled-out words.'],
      ['L2', 'Part 2: everyday monologue (maps & plans)', 'Find the starting point first, then follow direction words: opposite, next to, at the far end.'],
      ['L3', 'Part 3: academic discussion (2–4 speakers)', 'Speakers often change their minds; the first option you hear is frequently a distractor.'],
      ['L4', 'Part 4: academic lecture (note & sentence completion)', 'There is no pause in the middle of Part 4, so read every question before it starts.'],
      ['L5', 'Multiple choice & matching'],
      ['L6', 'Predicting answers & recognising paraphrase', 'Before the audio, note what each gap needs: a noun, a number, an adjective.'],
      ['L7', 'Word limits & spelling', '“NO MORE THAN TWO WORDS AND/OR A NUMBER”: one word too many makes the answer wrong.'],
    ]),
    unit('ielts', 'R', 'Reading', [25, 25], [
      ['R1', 'Skimming, scanning & timing', 'About 20 minutes per passage; the third passage is usually the hardest.'],
      ['R2', 'True / False / Not Given (facts)', 'False: the text contradicts it. Not Given: the text says nothing about it.'],
      ['R3', 'Yes / No / Not Given (the writer’s views)'],
      ['R4', 'Matching headings', 'Read each paragraph’s main idea, not its first sentence only.'],
      ['R5', 'Matching information, features & sentence endings'],
      ['R6', 'Multiple choice'],
      ['R7', 'Summary, note, table & flow-chart completion', 'Answers usually follow passage order; copy the words exactly as written.'],
      ['R8', 'Diagram labels & short answers'],
      ['R9', 'Academic vocabulary & paraphrase'],
    ]),
    unit('ielts', 'W', 'Writing', [25, 25], [
      ['W1', 'Task 1: charts, graphs & tables', 'Group the data and compare; don’t describe every number.'],
      ['W2', 'Task 1: maps & processes'],
      ['W3', 'Task 1: the overview', 'Without a clear overview of the main trends, Task Achievement is unlikely to go above band 5.'],
      ['W4', 'Task 2: opinion essays (agree / disagree)', 'State your position in the introduction and keep it the same to the end.'],
      ['W5', 'Task 2: discussion essays (both views + opinion)'],
      ['W6', 'Task 2: advantages & disadvantages'],
      ['W7', 'Task 2: problem / cause & solution'],
      ['W8', 'Task 2: two-part (direct) questions', 'Answer both questions, giving each its own body paragraph.'],
      ['W9', 'Coherence & cohesion: paragraphs and linking words', 'Starting every sentence with a linking word reads as mechanical and lowers this score.'],
      ['W10', 'Lexical resource: collocation & precise vocabulary'],
      ['W11', 'Grammatical range & accuracy: complex sentences'],
    ]),
    unit('ielts', 'S', 'Speaking', [25, 25], [
      ['S1', 'Part 1: introduction & familiar topics', 'Answer, then add a reason or example: two or three sentences.'],
      ['S2', 'Part 2: long turn (cue card)', 'Use the minute of preparation to note keywords for each bullet, then keep talking for the full 2 minutes.'],
      ['S3', 'Part 3: abstract discussion', 'Give opinions with reasons, compare past and present, speculate about the future.'],
      ['S4', 'Fluency & coherence: discourse markers, self-correction'],
      ['S5', 'Lexical resource: idiomatic and less common vocabulary'],
      ['S6', 'Grammatical range: conditionals, tenses, complex sentences'],
      ['S7', 'Pronunciation: word stress, intonation, chunking'],
    ]),
  ],
};
