import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ResourceAnswer from 'gooru-web/models/resource/answer';

const Validations = buildValidations({
  text: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: Ember.computed('model.isReadingType', function() {
          return this.get('model.isReadingType')
            ? 'common.errors.add-question-reading-text'
            : 'common.errors.add-question-answer-text';
        }),
        disabled: Ember.computed('model', function() {
          return (
            !!this.get('model.leftValueFormat') ||
            !!this.get('model.rightValueFormat')
          );
        })
      }),
      validator('hot-text-highlight', {
        answerNotSelectedKey: 'common.errors.highlight-text-not-selected',
        wrongFormatKey: 'common.errors.highlight-text-wrong-format'
      })
    ]
  },
  leftValue: {
    validators: [
      validator('presence', {
        presence: true,
        disabled: Ember.computed('model.leftValueFormat', function() {
          return !this.get('model.leftValueFormat');
        })
      })
    ]
  },
  rightValue: {
    validators: [
      validator('presence', {
        presence: true,
        disabled: Ember.computed('model.rightValueFormat', function() {
          return !this.get('model.rightValueFormat');
        })
      })
    ]
  }
});

/**
 * Answer model
 * typedef {Object} Answer
 */
const Answer = Ember.Object.extend(Validations, {
  /**
   * @property {Number} sequence - The order sequence of the answer
   */
  sequence: 0,

  /**
   * @property {Boolean} isCorrect - Indicates if the answer is correct or not
   */
  isCorrect: false,

  /**
   * @property {String} text - The answer text
   */
  text: null,

  /**
   * @property {String} type - The answer type
   */
  type: null,

  /**
   * @property {String} highlightType - The highlight type for hot text highlight answers
   */
  highlightType: null,

  correctAnswers: Ember.A([]),

  /**
   * @property {Array} correctAnswer - The correctAnswer type for SERP answers
   */
  correctAnswer: [],

  /**
   * @property {Array} baseWords - The correctAnswer type for SERP answers
   */
  baseWords: [],

  answer_text: '',

  correct_answer: '',

  answer_category: '',

  answer_type: '',

  struggles: null,
  isReadingType: false,

  answersList: Ember.A([]),

  textImage: null,

  additionalLetters: Ember.A([]),

  scalePoint: null,

  scalePointLabels: Ember.A([]),

  items: Ember.A([]),

  uiDisplayGuide: null,

  /**
   * Return a copy of the answer
   *
   * @function
   * @return {Answer}
   */
  copy: function() {
    var properties = [];
    var enumerableKeys = Object.keys(this);
    for (let i = 0; i < enumerableKeys.length; i++) {
      let key = enumerableKeys[i];
      let value = Ember.typeOf(this.get(key));
      if (
        value === 'string' ||
        value === 'number' ||
        value === 'boolean' ||
        value === 'array' ||
        value === 'instance' ||
        value === 'object'
      ) {
        properties.push(key);
      }
    }

    // Copy the question data
    properties = this.getProperties(properties);

    return Answer.create(Ember.getOwner(this).ownerInjection(), properties);
  },

  /**
   * Returns a player answer object.
   * @returns {Answer}
   */
  toPlayerAnswer: function() {
    const answer = this;
    return ResourceAnswer.create({
      id: answer.get('id'),
      text: answer.get('text'),
      answerType: answer.get('type'),
      order: answer.get('sequence'),
      isCorrect: answer.get('isCorrect'),
      highlightType: answer.get('highlightType'),
      correctAnswer: answer.get('correctAnswer'),
      baseWords: answer.get('baseWords'),
      groupOne: answer.get('groupOne'),
      groupTwo: answer.get('groupTwo'),
      additionalLetters: answer.get('additionalLetters'),
      scalePoint: answer.get('scalePoint'),
      scalePointLabels: answer.get('scalePointLabels'),
      items: answer.get('items'),
      uiDisplayGuide: answer.get('uiDisplayGuide'),
      leftValue: answer.get('leftValue'),
      rightValue: answer.get('rightValue'),
      leftValueFormat: answer.get('leftValueFormat'),
      rightValueFormat: answer.get('rightValueFormat'),
      rightValShuffleOrder: answer.get('rightValShuffleOrder')
    });
  }
});

export default Answer;
