import Ember from 'ember';
import MultipleChoiceUtil from 'gooru-web/utils/question/multiple-choice';
import MultipleAnswerUtil from 'gooru-web/utils/question/multiple-answer';
import TrueFalseUtil from 'gooru-web/utils/question/true-false';
import OpenEndedUtil from 'gooru-web/utils/question/open-ended';
import FillInTheBlankUtil from 'gooru-web/utils/question/fill-in-the-blank';
import ReorderUtil from 'gooru-web/utils/question/reorder';
import HotSpotImageUtil from 'gooru-web/utils/question/hot-spot-image';
import HotSpotTextUtil from 'gooru-web/utils/question/hot-spot-text';
import HotTextHighlightUtil from 'gooru-web/utils/question/hot-text-highlight';
import EncodingAssessmentUtil from 'gooru-web/utils/question/encoding-assessment';
import DecodingAssessmentUtil from 'gooru-web/utils/question/decoding-assessment';
import IdentifyDigraphUtil from 'gooru-web/utils/question/identify-digraph';
import SayOutLoudUtil from 'gooru-web/utils/question/say-out-loud';
import WordsPerMinuteUtil from 'gooru-web/utils/question/words-per-minute';

//Question Types
export const QUESTION_TYPES = {
  multipleChoice: 'MC',
  multipleAnswer: 'MA',
  trueFalse: 'T/F',
  openEnded: 'OE',
  fib: 'FIB',
  likertScale: 'LS',
  hotSpotText: 'HS_TXT',
  hotSpotImage: 'HS_IMG',
  hotTextReorder: 'HT_RO',
  hotTextHighlight: 'HT_HL',
  scientificfib: 'SE_FIB',
  scientificFreeResponse: 'SE_FRQ',
  encodingAssessment: 'SERP_EA',
  decodingAssessment: 'SERP_DA',
  sayOutLoud: 'SERP_SOL',
  identifyDigraph: 'SERP_ID',
  readingQuestion: 'SERP_RQ',
  wordsPerMinute: 'SERP_WPM',
  silentReading: 'SERP_SR',
  phraseCuedReading: 'SERP_PCR',
  comprehension: 'SERP_AFC',
  vowelsQuestions: 'SERP_VOWELS',
  countingSyllable: 'SERP_CS',
  baseWords: 'SERP_IB',
  vowelTeams: 'SERP_VT',
  dividingSyllables: 'SERP_SD',
  classic: 'SERP_CL',
  chooseOne: 'SERP_CO',
  pickNChoose: 'SERP_PNC',
  sorting: 'SERP_SO',
  serpMultiChoice: 'SERP_MC',
  serpIdentifyVowel: 'SERP_IVSA',
  matchTheFollowing: 'MTF'
};

export const EXCLUDE_SCORE_QUESTION_TYPES = [
  'extended_text',
  'open_ended_question',
  'serp_words_per_minute',
  'serp_decoding_assessment',
  'serp_lang_say_out_loud',
  'serp_silent_reading',
  'scientific_free_response',
  'serp_phrase_cued_reading',
  'likert_scale_question',
  'scientific_fill_in_the_blank',
  'serp_lang_identify_digraph'
];

export const GRADABLE_QUESTION_TYPES = [
  'OE',
  'SE_FIB',
  'SE_FRQ',
  'SERP_DA',
  'SERP_SOL',
  'SERP_ID',
  'SERP_WPM',
  'SERP_SR',
  'SERP_PCR'
];

//Question type configuration
export const QUESTION_CONFIG = {
  MC: Ember.Object.create({
    apiType: 'multiple_choice_question',
    util: MultipleChoiceUtil,
    serpType: false,
    hasComprehension: true,
    component: {
      player: 'player.questions.gru-multiple-choice',
      answer: 'reports.assessment.questions.gru-multiple-choice',
      builder_answer: 'content.questions.answers.gru-multiple-choice'
    }
  }),
  LS: Ember.Object.create({
    apiType: 'likert_scale_question',
    serpType: false,
    util: WordsPerMinuteUtil,
    component: {
      player: 'player.questions.gru-likert-scale',
      answer: 'reports.assessment.questions.gru-likert-scale',
      builder_answer: 'content.questions.answers.gru-likert-scale'
    }
  }),
  MA: Ember.Object.create({
    apiType: 'multiple_answer_question',
    util: MultipleAnswerUtil,
    serpType: false,
    hasComprehension: true,
    component: {
      player: 'player.questions.gru-multiple-answer',
      answer: 'reports.assessment.questions.gru-multiple-answer',
      builder_answer: 'content.questions.answers.gru-multiple-answer'
    }
  }),
  HT_RO: Ember.Object.create({
    apiType: 'hot_text_reorder_question',
    util: ReorderUtil,
    serpType: false,
    component: {
      player: 'player.questions.gru-reorder',
      answer: 'reports.assessment.questions.gru-reorder',
      builder_answer: 'content.questions.answers.gru-reorder'
    }
  }),
  HT_HL: Ember.Object.create({
    apiType: 'hot_text_highlight_question',
    util: HotTextHighlightUtil,
    defaultType: 'word',
    serpType: false,
    component: {
      player: 'player.questions.gru-hot-text-highlight',
      answer: 'reports.assessment.questions.gru-hot-text-highlight',
      builder_answer: 'content.questions.answers.gru-hot-text-highlight'
    }
  }),
  'T/F': Ember.Object.create({
    apiType: 'true_false_question',
    util: TrueFalseUtil,
    serpType: false,
    component: {
      player: 'player.questions.gru-true-false',
      answer: 'reports.assessment.questions.gru-true-false',
      builder_answer: 'content.questions.answers.gru-true-false'
    }
  }),
  FIB: Ember.Object.create({
    apiType: 'fill_in_the_blank_question',
    util: FillInTheBlankUtil,
    serpType: false,
    hasComprehension: true,
    component: {
      player: 'player.questions.gru-fib',
      answer: 'reports.assessment.questions.gru-fib',
      builder_answer: 'content.questions.answers.gru-fib'
    }
  }),
  HS_IMG: Ember.Object.create({
    apiType: 'hot_spot_image_question',
    util: HotSpotImageUtil,
    serpType: false,
    component: {
      player: 'player.questions.gru-hs-image',
      answer: 'reports.assessment.questions.gru-hs-image',
      builder_answer: 'content.questions.answers.gru-hs-image'
    }
  }),
  HS_TXT: Ember.Object.create({
    apiType: 'hot_spot_text_question',
    util: HotSpotTextUtil,
    serpType: false,
    component: {
      player: 'player.questions.gru-hs-text',
      answer: 'reports.assessment.questions.gru-hs-text',
      builder_answer: 'content.questions.answers.gru-hs-text'
    }
  }),
  OE: Ember.Object.create({
    apiType: 'open_ended_question',
    util: OpenEndedUtil,
    serpType: false,
    component: {
      player: 'player.questions.gru-open-ended',
      answer: 'reports.assessment.questions.gru-open-ended',
      builder_answer: 'content.questions.answers.gru-open-ended'
    }
  }),
  SE_FIB: Ember.Object.create({
    apiType: 'scientific_fill_in_the_blank_question',
    serpType: false,
    util: FillInTheBlankUtil,
    component: {
      player: 'player.questions.gru-scientific-fib',
      answer: 'reports.assessment.questions.gru-scientific-fib',
      builder_answer: 'content.questions.answers.gru-scientific-fib'
    }
  }),
  SE_FRQ: Ember.Object.create({
    apiType: 'scientific_free_response_question',
    serpType: false,
    util: OpenEndedUtil,
    component: {
      player: 'player.questions.gru-scientific-free-response',
      answer: 'reports.assessment.questions.gru-scientific-free-response',
      builder_answer: 'content.questions.answers.gru-scientific-free-response'
    }
  }),
  SERP_EA: Ember.Object.create({
    apiType: 'serp_encoding_assessment_question',
    serpType: true,
    util: EncodingAssessmentUtil,
    component: {
      player: 'player.questions.gru-encoding-assessment',
      answer: 'reports.assessment.questions.gru-encoding-assessment',
      builder_answer: 'content.questions.answers.gru-encoding-assessment'
    }
  }),
  SERP_DA: Ember.Object.create({
    apiType: 'serp_decoding_assessment_question',
    serpType: true,
    util: DecodingAssessmentUtil,
    component: {
      player: 'player.questions.gru-decoding-assessment',
      answer: 'reports.assessment.questions.gru-decoding-assessment',
      builder_answer: 'content.questions.answers.gru-decoding-assessment'
    }
  }),
  SERP_SOL: Ember.Object.create({
    apiType: 'serp_lang_say_out_loud_question',
    serpType: true,
    util: SayOutLoudUtil,
    component: {
      player: 'player.questions.gru-say-out-loud',
      answer: 'reports.assessment.questions.gru-say-out-loud',
      builder_answer: 'content.questions.answers.gru-say-out-loud'
    }
  }),
  SERP_ID: Ember.Object.create({
    apiType: 'serp_lang_identify_digraph_question',
    serpType: true,
    util: IdentifyDigraphUtil,
    component: {
      player: 'player.questions.gru-identify-digraph',
      answer: 'reports.assessment.questions.gru-identify-digraph',
      builder_answer: 'content.questions.answers.gru-identify-digraph'
    }
  }),
  SERP_RQ: Ember.Object.create({
    apiType: null,
    serpType: true,
    util: WordsPerMinuteUtil,
    component: {
      builder_answer: 'content.questions.answers.gru-words-per-minute'
    }
  }),
  SERP_WPM: Ember.Object.create({
    apiType: 'serp_words_per_minute_question',
    serpType: true,
    isHiddenType: true,
    util: WordsPerMinuteUtil,
    component: {
      player: 'player.questions.gru-words-per-minute',
      answer: 'reports.assessment.questions.gru-words-per-minute',
      builder_answer: 'content.questions.answers.gru-words-per-minute'
    }
  }),
  SERP_SR: Ember.Object.create({
    apiType: 'serp_silent_reading_question',
    serpType: true,
    isHiddenType: true,
    util: WordsPerMinuteUtil,
    component: {
      player: 'player.questions.gru-silent-reading',
      answer: 'reports.assessment.questions.gru-silent-reading',
      builder_answer: 'content.questions.answers.gru-silent-reading'
    }
  }),
  SERP_PCR: Ember.Object.create({
    apiType: 'serp_phrase_cued_reading_question',
    serpType: true,
    isHiddenType: true,
    util: WordsPerMinuteUtil,
    component: {
      player: 'player.questions.gru-phrase-reading',
      answer: 'reports.assessment.questions.gru-phrase-reading',
      builder_answer: 'content.questions.answers.gru-phrase-reading'
    }
  }),
  SERP_AFC: Ember.Object.create({
    apiType: 'serp_lang_activities_for_comprehension_question',
    serpType: true,
    hiddenComprehension: true,
    util: WordsPerMinuteUtil,
    component: {
      player: 'player.questions.gru-comprehension',
      answer: 'reports.assessment.questions.gru-comprehension',
      builder_answer: 'content.questions.answers.gru-comprehension'
    }
  }),
  SERP_IB: Ember.Object.create({
    apiType: 'serp_lang_identify_base_word_question',
    serpType: true,
    util: WordsPerMinuteUtil,
    component: {
      player: 'player.questions.gru-base-words',
      answer: 'reports.assessment.questions.gru-basword',
      builder_answer: 'content.questions.answers.gru-base-words'
    }
  }),
  SERP_VT: Ember.Object.create({
    apiType: 'serp_lang_vowel_teams_question',
    serpType: true,
    util: WordsPerMinuteUtil,
    component: {
      player: 'player.questions.gru-vowel-teams',
      answer: 'reports.assessment.questions.gru-vowel-teams',
      builder_answer: 'content.questions.answers.gru-vowel-teams'
    }
  }),
  SERP_CS: Ember.Object.create({
    apiType: 'serp_lang_counting_syllables_question',
    serpType: true,
    util: WordsPerMinuteUtil,
    component: {
      player: 'player.questions.gru-counting-syllables',
      answer: 'reports.assessment.questions.gru-counting-syllables',
      builder_answer: 'content.questions.answers.gru-counting-syllables'
    }
  }),
  SERP_SD: Ember.Object.create({
    apiType: 'serp_lang_syllable_division_question',
    serpType: true,
    util: WordsPerMinuteUtil,
    component: {
      player: 'player.questions.gru-syllables-division',
      answer: 'reports.assessment.questions.gru-syllables-division',
      builder_answer: 'content.questions.answers.gru-syllables-division'
    }
  }),
  SERP_CL: Ember.Object.create({
    apiType: 'serp_classic_question',
    serpType: true,
    util: WordsPerMinuteUtil,
    component: {
      player: 'player.questions.gru-classic',
      answer: 'reports.assessment.questions.gru-classic',
      builder_answer: 'content.questions.answers.gru-classic'
    }
  }),
  SERP_CO: Ember.Object.create({
    apiType: 'serp_choose_one_question',
    serpType: true,
    util: MultipleChoiceUtil,
    component: {
      player: 'player.questions.gru-choose-one',
      answer: 'reports.assessment.questions.gru-choose-one',
      builder_answer: 'content.questions.answers.gru-choose-one'
    }
  }),
  SERP_PNC: Ember.Object.create({
    apiType: 'serp_pick_n_choose_question',
    serpType: true,
    util: WordsPerMinuteUtil,
    component: {
      player: 'player.questions.gru-pick-n-choose',
      answer: 'reports.assessment.questions.gru-pick-n-choose',
      builder_answer: 'content.questions.answers.gru-pick-n-choose'
    }
  }),
  SERP_SO: Ember.Object.create({
    apiType: 'serp_sorting_question',
    serpType: true,
    util: WordsPerMinuteUtil,
    component: {
      player: 'player.questions.gru-sorting',
      answer: 'reports.assessment.questions.gru-sorting',
      builder_answer: 'content.questions.answers.gru-sorting'
    }
  }),
  SERP_MC: Ember.Object.create({
    apiType: 'serp_multi_choice_question',
    serpType: true,
    util: MultipleChoiceUtil,
    component: {
      player: 'player.questions.gru-serp-multi-choice',
      answer: 'reports.assessment.questions.gru-serp-multi-choice',
      builder_answer: 'content.questions.answers.gru-serp-multi-choice'
    }
  }),
  SERP_IVSA: Ember.Object.create({
    apiType: 'serp_identify_vowel_sound_activity_question',
    serpType: true,
    util: WordsPerMinuteUtil,
    component: {
      player: 'player.questions.gru-identify-vowel',
      answer: 'reports.assessment.questions.gru-identify-vowel',
      builder_answer: 'content.questions.answers.gru-identify-vowel'
    }
  }),
  H5P_DAD: Ember.Object.create({
    apiType: 'h5p_drag_and_drop_question'
  }),
  MTF: Ember.Object.create({
    apiType: 'match_the_following_question',
    util: ReorderUtil,
    serpType: false,
    component: {
      player: 'player.questions.gru-match-question',
      answer: 'reports.assessment.questions.gru-match-question',
      builder_answer: 'content.questions.answers.gru-match-question'
    }
  })
};

/**
 * Returns the question config information
 * @param {string} questionType
 * @param {string} propertyPath a valid property path inside the question config object
 */
export function getQuestionConfig(questionType, propertyPath) {
  let config = QUESTION_CONFIG[questionType];
  if (!config) {
    Ember.Logger.error(
      `Questions of type ${questionType} are currently not supported`
    );
  } else if (propertyPath && !config.get(propertyPath)) {
    Ember.Logger.error(
      `Property not found ${propertyPath} for question type ${questionType}`
    );
  } else {
    config = propertyPath ? config.get(propertyPath) : config;
  }

  return config;
}
/**
 * Returns the question config information
 * @param {string} questionType
 * @param {string} propertyPath a valid property path inside the question config object
 */
export function getQuestionTypeConfig(questionType, propertyPath) {
  let config = Object.values(QUESTION_CONFIG).findBy('apiType', questionType);
  if (!config) {
    Ember.Logger.error(
      `Questions of type ${questionType} are currently not supported`
    );
  } else if (propertyPath && !config.get(propertyPath)) {
    Ember.Logger.error(
      `Property not found ${propertyPath} for question type ${questionType}`
    );
  } else {
    config = propertyPath ? config.get(propertyPath) : config;
  }

  return config;
}
/**
 * Returns the question type based on apiType
 * @param {string} apiType, a valid question apiType from API 3.0
 */
export function getQuestionTypeByApiType(apiType) {
  let type = null;
  for (var property in QUESTION_CONFIG) {
    if (QUESTION_CONFIG.hasOwnProperty(property)) {
      if (QUESTION_CONFIG[property].apiType === apiType) {
        type = property;
        break;
      }
    }
  }
  return type;
}

/**
 * Gets the question util per question type
 * @param {string} questionType
 * @returns {Object|*}
 */
export function getQuestionUtil(questionType) {
  return getQuestionConfig(questionType, 'util');
}

/**
 * Returns the new question api type for API 3.0
 * @param {string} questionType
 * @returns {string}
 */
export function getQuestionApiType(questionType) {
  return getQuestionConfig(questionType, 'apiType');
}

// LaTeX expressions used in rich text editor
export const LATEX_EXPRESSIONS = {
  fraction: '\\frac{}{}',
  sqrt: '\\sqrt{}',
  sqrtn: '\\sqrt[{}]{}',
  overline: '\\overline{}',
  angles: '\\langle{}',
  sum: '\\sum{}',
  sin: '\\sin\\left({}\\right)',
  cos: '\\cos\\left({}\\right)',
  tan: '\\tan\\left({}\\right)',
  in: '\\in',
  notin: '\\notin',
  exists: '\\exists',
  nexists: '\\nexists',
  ge: '\\ge',
  gt: '\\gt',
  lambda: '\\Lambda',
  omega: '\\Omega',
  infinity: '\\infty',
  subscript: '{}_{}',
  superscript: '{}^{}',
  'over-left-arrow': '\\overleftarrow{}',
  'over-right-arrow': '\\overrightarrow{}',
  div: '\\div',
  plus: '\\+',
  minus: '\\-',
  mult: '\\times',
  cdot: '\\cdot',
  'not-equal': '\\neq',
  lt: '\\lt',
  le: '\\le',
  sim: '\\sim',
  approx: '\\approx',
  alpha: '\\alpha',
  dollar: '\\$',
  pmatrix: '\\left({}\\right)',
  Bmatrix: '\\left\\{{} \\right\\}',
  vmatrix: '\\left|{} \\right|',
  angle: '\\angle',
  measuredangle: '\\measuredangle',
  bot: '\\bot',
  parallel: '\\parallel',
  sigma: '\\Sigma',
  theta: '\\Theta',
  pi: '\\pi'
};

// If we need any other additional expression refer katex supported equation document
export const ADVANCED_LATEX_EXPRESSION = {
  beginmatrix: '\\begin{matrix} a & b \\\\ c & d \\end{matrix}',
  beginpmatrix: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
  beginvmatrix: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}',
  beginBmatrix: '\\begin{Bmatrix} a & b \\\\ c & d \\end{Bmatrix}',
  beginbmatrix: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}',
  beginVmatrix: '\\begin{Vmatrix} a & b \\\\ c & d \\end{Vmatrix}'
};

export const BASE_WORDS_QUESTIONS = [
  'basewordone',
  'basewordtwo',
  'basewordaffix'
];

export const DEFAULT_QUESTION = {
  SERP_RQ: {
    type: 'SERP_SR'
  },
  SERP_IB: {
    type: 'basewordone'
  }
};

export const BASE_WORD_AFFIX = [
  {
    label: 'base word',
    name: 'baseword'
  },
  {
    label: 'prefix',
    name: 'prefix'
  },
  {
    label: 'suffix',
    name: 'suffix'
  }
];

export const VOWELS_LETTERS = ['a', 'e', 'i', 'o', 'u'];

export const VOWEL_TYPES = [
  {
    label: 'Long vowel',
    class: 'selection selected'
  },
  {
    label: 'Silent vowel',
    class: 'selection selected crossed'
  },
  {
    label: 'Short vowel',
    class: 'selection selected short',
    isHidden: true
  }
];
