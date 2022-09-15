import Ember from 'ember';
import {
  KEY_CODES,
  ASSESSMENT_SHOW_VALUES,
  FEEDBACK_EMOTION_VALUES
} from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

/**
 * Player question viewer
 *
 * Component responsible for providing a frame where all question types
 * will be displayed i.e. it will be responsible for selecting any specific
 * question components per question type.
 *
 * @module
 * @see controllers/player.js
 * @augments ember/Component
 */
export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @requires service:i18n
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-question-viewer'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Action triggered when the user see a hint
     */
    showHint: function() {
      var actualHint = this.get('actualHint');

      this.get('hintsToDisplay').pushObject(
        this.get('question.hints').objectAt(actualHint)
      );
      actualHint += 1;
      this.set('actualHint', actualHint);
    },

    showExplanation: function() {
      this.set('isExplanationShown', true);
    },

    /**
     * When the question is submitted
     */
    submitQuestion: function() {
      this.submitQuestion();
    },
    /**
     * When the question answer has been changed
     * @param {Resource} question the question
     */
    changeAnswer: function(question) {
      if (!this.get('submitted')) {
        //todo track analytics
        this.set('question', question);
      }
    },

    /**
     * When the question answer has been completed
     * @param {Resource} question the question
     * @param { { answer: Object, correct: boolean } } stats
     */
    completeAnswer: function(question, stats) {
      if (!this.get('submitted')) {
        let questionResult = this.get('questionResult');
        questionResult.set('userAnswer', stats.answer);
        questionResult.set('correct', stats.correct);

        this.set('question', question);
        this.set('answerCompleted', true);
      }
    },
    /**
     * When the question answer has been cleared
     * @param {Resource} question the question
     */
    clearAnswer: function(question) {
      if (!this.get('submitted')) {
        //todo track analytics
        this.set('question', question);
        this.set('answerCompleted', false);
      }
    },
    /**
     * When the question answer was loaded from BE
     * @param {Resource} question the question
     * @param { { answer: Object, correct: boolean } } stats
     */
    loadedAnswer: function(question, stats) {
      if (!this.get('submitted')) {
        let questionResult = this.get('questionResult');
        questionResult.set('userAnswer', stats.answer);
        questionResult.set('correct', stats.correct);

        this.set('question', question);
        this.set('answerCompleted', false);
      }
    }
  },
  // -------------------------------------------------------------------------
  // Events
  /**
   * Listen to enter in order to submit the question when the user press enter
   */
  listenToEnter: Ember.on('didInsertElement', function() {
    let component = this;
    this.fontChanger();
    this.fontChangerOld();
    $(document).on('keyup', function(e) {
      if (e.which === KEY_CODES.ENTER) {
        if (!component.get('isSubmitDisabled')) {
          if (!component.get('question.isOpenEnded')) {
            component.submitQuestion();
          }
        }
      }
    });
  }),

  /**
   * Removed keyup handler when the component will destroy
   */
  disableListenToEnter: Ember.on('willDestroyElement', function() {
    $(document).off('keyup');
  }),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Hits available for a question
   * @property {number} availableHints
   */
  actualHint: 0,

  /**
   * Hits available for a question
   * @property {number} availableHints
   */
  availableHints: Ember.computed('actualHint', 'question', function() {
    return this.get('question.hints.length') - this.get('actualHint');
  }),

  /**
   * @property {boolean} indicates when the answer is completed
   */
  answerCompleted: false,

  /**
   * Default button text key
   * @property {string}
   */
  buttonTextKey: 'common.save',

  /**
   * The collection
   * @property {Collection}
   */
  collection: null,

  /**
   * Indicates when the question has explanation
   * @property {boolean}
   */
  doesNotHaveExplanation: Ember.computed.not('question.explanation'),

  /**
   * Unicode value depending on the correctness of the question
   * @property {boolean}
   */
  feedbackUnicode: Ember.computed('questionResult.correct', function() {
    return this.get('questionResult.correct')
      ? FEEDBACK_EMOTION_VALUES.CORRECT
      : FEEDBACK_EMOTION_VALUES.INCORRECT;
  }),

  /**
   * Hints to display
   * @property {Array} hintsToDisplay
   */
  hintsToDisplay: Ember.A(),

  /**
   * Default instructions action text key
   * @property {string}
   */
  instructionsActionTextKey: 'common.save',

  /**
   * Key to show the correct/incorrect message
   * @property {String} isCorrectMessageKey
   */
  isCorrectMessageKey: Ember.computed('questionResult.correct', function() {
    return this.get('questionResult.correct')
      ? 'common.answer-correct'
      : 'common.answer-incorrect';
  }),

  /**
   * Is the explanation shown?
   * @property {boolean} disableExplanation
   */
  isExplanationShown: false,

  /**
   * Is the explanation button disabled?
   * @property {boolean} disableHint
   */
  isExplanationButtonDisabled: Ember.computed.or(
    'isExplanationShown',
    'doesNotHaveExplanation'
  ),

  /**
   * @property {boolean} indicates when the inputs are enabled
   */
  isInputDisabled: Ember.computed(
    'questionResult.submittedAnswer',
    'showFeedback',
    function() {
      let showFeedback = this.get('showFeedback');
      return (
        (showFeedback &&
          this.get('isStudent') &&
          this.get('questionResult.submittedAnswer')) ||
        this.get('submitted')
      );
    }
  ),

  /**
   * Is the hints button disabled?
   * @property {boolean} disableHint
   */
  isHintButtonDisabled: Ember.computed.not('availableHints'),

  /**
   * Indicates if the student is playing the collection
   * @property {boolean}
   */
  isStudent: Ember.computed.equal('role', 'student'),

  /**
   * @property {boolean} indicates when the submit functionality is enabled
   */
  isSubmitDisabled: Ember.computed(
    'answerCompleted',
    'submitted',
    'questionResult.submittedAnswer',
    'showFeedback',
    function() {
      let showFeedback = this.get('showFeedback');
      if (
        !showFeedback ||
        this.get('isTeacher') ||
        !this.get('questionResult.submittedAnswer')
      ) {
        return this.get('submitted') || !this.get('answerCompleted');
      }
      return false;
    }
  ),

  /**
   * Indicates if the teacher is playing this collection
   * @property {boolean}
   */
  isTeacher: Ember.computed.not('isStudent'),

  /**
   * @property {string} on submit question action
   */
  onSubmitQuestion: 'submitQuestion',

  /**
   * The question
   * @property {Resource} question
   */
  question: null,

  /**
   * Question result, it is passed as a parameter for this component
   * @property {QuestionResult}
   */
  questionResult: null,

  compIndex: 0,

  /**
   * Indicates if feedback should be shown
   * @property {boolean}
   */
  showFeedback: Ember.computed(
    'collection.showFeedback',
    'questionResult.submittedAnswer',
    'showQuestionFeedback',
    function() {
      let isShowQuestionFeedbackSet =
        this.get('showQuestionFeedback') !== undefined;
      let feedback = isShowQuestionFeedbackSet
        ? this.get('showQuestionFeedback')
        : this.get('collection.showFeedback') ===
          ASSESSMENT_SHOW_VALUES.IMMEDIATE;
      return (
        feedback &&
        this.get('isStudent') &&
        this.get('questionResult.submittedAnswer')
      );
    }
  ),

  /**
   * it forces to show the question feedback, no matter what configuration is set for the collection,
   * should be undefined by default, so the property is ignored
   * @property {boolean}
   */
  showQuestionFeedback: undefined,

  /**
   * Indicates when the collection is already submitted
   * @property {boolean}
   */
  submitted: false,

  /**
   * Indicates the user's role, could be 'student', 'teacher' or null
   * @property {string}
   */
  role: null,

  isSerpMultiChoice: Ember.computed.equal('question.questionType', 'SERP_MC'),

  // -------------------------------------------------------------------------
  // Observers
  /**
   * Observes for the question itself
   * When it is changed some data should be reloaded
   */
  reloadQuestion: function() {
    this.setProperties({
      actualHint: 0,
      answerCompleted: false,
      hintsToDisplay: Ember.A(),
      isExplanationShown: false
    });
  }.observes('question'),

  // -------------------------------------------------------------------------
  // Methods

  submitQuestion: function() {
    if (!this.get('submitted')) {
      let questionResult = this.get('questionResult');
      this.sendAction('onSubmitQuestion', this.get('question'), questionResult);
    }
  },
  fontChangerOld() {
    let component = this;
    component
      .$('.panel-body h2')
      .on('input', '.font-size-loader .font-changer', function() {
        let el = component.$(this).closest('.panel-body');
        let fontChanger = el.find(
          '.decoding-answers .decoding-answer .decoding-text, .silent-reading-answers .silent-reading-text'
        );
        if (el.parent().hasClass('SERP_AFC')) {
          let panelBody = el.find('.panel-body');
          panelBody
            .find('.question .gru-math-text')
            .css('zoom', `${parseFloat($(this).val() / 10)}`);
        } else {
          fontChanger.css('zoom', `${parseFloat($(this).val() / 10)}`);
        }
      });
  },

  fontChanger() {
    let component = this;
    component
      .$('.question-panel-left h2')
      .on('input', '.font-size-loader .font-changer', function() {
        let el = component.$(this).closest('.question-panel-left');
        let el1 = component.$('.answers-panel');

        let fontChanger = el.find(
          '.decoding-answers .decoding-answer .decoding-text, .silent-reading-answers .silent-reading-text'
        );
        if (el.parent().hasClass('SERP_AFC')) {
          let panelBody = el.find('.panel-default');
          panelBody
            .find('.panel-body .question .gru-math-text')
            .css('zoom', `${parseFloat($(this).val() / 10)}`);

          let panelBody1 = el1.find('.gru-comprehension-panel');
          panelBody1
            .find('.panel-default .question .gru-math-text')
            .css('zoom', `${parseFloat($(this).val() / 10)}`);
        } else {
          fontChanger.css('zoom', `${parseFloat($(this).val() / 10)}`);
        }
      });
  }
});
