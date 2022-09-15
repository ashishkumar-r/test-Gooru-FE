import Ember from 'ember';
import { QUESTION_TYPES } from 'gooru-web/config/question';
import FillInTheBlank from 'gooru-web/utils/question/fill-in-the-blank';
/**
 * Resource Model
 *
 * @typedef {Object} Resource
 */
export default Ember.Object.extend({
  id: null,

  /**
   * @property {string} full resource asset url
   */
  assetUrl: null,

  /**
   * Indicates the resoruce type. i.e video/youtube, assessment-question, image/png
   * @property {string} resource type
   */
  resourceType: null,

  /**
   * Indicates the resource format. i.e image, text, video, interaction, webpage, question
   * @property {string} resource format
   */
  resourceFormat: null,

  /**
   * @property {string}
   */
  title: null,

  htmlContent: null,

  /**
   * @property {string}
   */
  description: null,

  /**
   * @property {string} resource thumbnail
   */
  thumbnail: null,

  /**
   * Resource asset url, this is the actual resource content url
   * @property {string} folder
   */
  url: null,

  /**
   * @property {string}
   */
  mediaUrl: null,

  /**
   * @property {string}
   */
  narration: null,

  /**
   * @property {number}
   */
  order: null,

  /**
   * @property
   */
  owner: null,

  /**
   * @property {JSONObject}
   */
  displayGuide: null,

  // ----------------------------------------- Question Fields
  /**
   * @property {string}
   */
  questionType: null,

  /**
   * @property {string}
   */
  text: null,

  /**
   * Returns the FIB text
   * @property {string}
   */
  fibText: Ember.computed('text', function() {
    return FillInTheBlank.toFibText(this.get('text'));
  }),

  /**
   * @property Array
   */
  hints: null,

  /**
   * @property {string}
   */
  explanation: null,

  /**
   * @property {Answer[]}
   */
  answers: Ember.A(),

  /**
   * Indicates if the question has answers
   * @property {boolean}
   */
  hasAnswers: Ember.computed.bool('answers.length'),

  /**
   * @property {*} resource options
   */
  options: null,

  /**
   * @property {Object[]} an array with Taxonomy data
   */
  taxonomy: [],

  /**
   * @property {string} thumbnail url
   */
  thumbnailUrl: Ember.computed('thumbnail', function() {
    const defaultThumbnailUrl = `/assets/gooru/default-${this.get(
      'resourceFormat'
    )}.png`;
    return this.get('thumbnail') ? this.get('thumbnail') : defaultThumbnailUrl;
  }),

  /**
   * @property {boolean} indicates if the resource is a question
   */
  isQuestion: Ember.computed.equal('resourceFormat', 'question'),

  /**
   * @property {boolean} indicates if the question is multiple choice type
   * @see components/player/gru-multiple-choice.js
   */
  isMultipleChoice: Ember.computed.equal(
    'questionType',
    QUESTION_TYPES.multipleChoice
  ),

  /**
   * @property {boolean} indicates if the question is multiple answer type
   * @see components/player/gru-multiple-answer.js
   */
  isMultipleAnswer: Ember.computed.equal(
    'questionType',
    QUESTION_TYPES.multipleAnswer
  ),

  /**
   * @property {boolean} indicates if the question is true false type
   * @see components/player/gru-true-false.js
   */
  isTrueFalse: Ember.computed.equal('questionType', QUESTION_TYPES.trueFalse),

  /**
   * @property {boolean} indicates if the question is open ended type
   * @see components/player/gru-open-ended.js
   */
  isOpenEnded: Ember.computed.equal('questionType', QUESTION_TYPES.openEnded),

  /**
   * @property {boolean} indicates if the question is fill in the blank type
   * @see components/player/gru-fib.js
   */
  isFIB: Ember.computed.equal('questionType', QUESTION_TYPES.fib),

  /**
   * @property {boolean} indicates if the question is scientific fill in the blank type
   */
  isScientificFIB: Ember.computed.equal(
    'questionType',
    QUESTION_TYPES.scientificfib
  ),

  /**
   * @property {boolean} indicates if the question is scientific open ended type
   */
  isScientificFreeRes: Ember.computed.equal(
    'questionType',
    QUESTION_TYPES.scientificFreeResponse
  ),

  /**
   * @property {boolean} indicates if the question is hot spot text type
   * @see components/player/gru-hot-spot-text.js
   */
  isHotSpotText: Ember.computed.equal(
    'questionType',
    QUESTION_TYPES.hotSpotText
  ),

  /**
   * @property {boolean} indicates if the question is hot spot image type
   * @see components/player/gru-hot-spot-image.js
   */
  isHotSpotImage: Ember.computed.equal(
    'questionType',
    QUESTION_TYPES.hotSpotImage
  ),

  /**
   * @property {boolean} indicates if the question is reorder
   * @see components/player/gru-reorder.js
   */
  isHotTextReorder: Ember.computed.equal(
    'questionType',
    QUESTION_TYPES.hotTextReorder
  ),

  /**
   * @property {boolean} indicates if the question is hot spot text
   * @see components/player/gru-hot-text-highlight.js
   */
  isHotTextHighlight: Ember.computed.equal(
    'questionType',
    QUESTION_TYPES.hotTextHighlight
  ),

  /**
   * @property {boolean} indicates if the question is hot text word type
   */
  isHotTextHighlightWord: Ember.computed.equal(
    'answers.firstObject.highlightType',
    'word'
  ),

  /**
   * @property {boolean} indicates if the question is hot text sentence type
   */
  isHotTextHighlightSentence: Ember.computed.equal(
    'answers.firstObject.highlightType',
    'sentence'
  ),

  /**
   * @property {boolean} isSerpWPM if the question is serp say out loud type
   */
  isSerpWPM: Ember.computed.equal(
    'questionType',
    QUESTION_TYPES.wordsPerMinute
  ),

  /**
   * The start time for video/youtube
   * @property {string} start
   */
  start: Ember.computed.alias('options.start'),
  /**
   * The end time for video/youtube
   * @property {string} start
   */
  stop: Ember.computed.alias('options.stop'),

  hasMedia: Ember.computed.bool('mediaUrl'),
  hasNarration: Ember.computed.bool('narration'),
  hasOwner: Ember.computed.bool('owner'),

  /**
   * Indicates if it is an image resource
   * @property {boolean}
   */
  isImageResource: Ember.computed('resourceType', function() {
    var resourceType = this.get('resourceType');
    return resourceType && resourceType.indexOf('image') >= 0;
  }),

  /**
   * Indicates if it is an youtube resource
   * @property {boolean}
   */
  isYoutubeResource: Ember.computed.equal('resourceType', 'video/youtube'),

  /**
   * Indicates if it is an pdf resource
   * @property {boolean}
   */
  isPDFResource: Ember.computed.equal('resourceType', 'handouts'),

  /**
   * Indicates if it is an url resource
   * @property {boolean}
   */
  isUrlResource: Ember.computed.equal('resourceType', 'resource/url'),

  /**
   * Indicates if it is an vimeo resource
   * @property {boolean}
   */
  isVimeoResource: Ember.computed.equal('resourceType', 'vimeo/video'),

  /**
   * Indicates if the resources is a 3rd party/remote url
   * Uploaded resources are not considered remote
   * @property {boolean}
   */
  isRemote: true
});
