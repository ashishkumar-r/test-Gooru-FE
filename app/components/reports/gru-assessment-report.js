import Ember from 'ember';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import WpmReadingMixin from 'gooru-web/mixins/reports/wpm-reading-question-mixin';

export default Ember.Component.extend(WpmReadingMixin, {
  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Handle event triggered by gru-summary
     * Scroll to specific question
     * TODO make this method generic
     */
    bubbleSelect: function(bubbleOption) {
      const animationSpeed = 1000; // milliseconds
      const selectorTable = $(
        `.gru-assessment-report #resource-${bubbleOption.label}`
      );
      const $elTable = $(selectorTable);
      const $tableVisible = $('.gru-assessment-report').find('table:visible');

      const selectorList = $(
        `.gru-assessment-report #mobile-resource-${bubbleOption.label}`
      );
      const $elList = $(selectorList);
      const $cardsVisible = $('.gru-assessment-report').find(
        '.question-cards:visible'
      );

      const isModal = $('.gru-assessment-report').parents('.gru-modal');
      //Check if the assessment report is showing into a modal
      if (isModal.length) {
        if ($elTable.length) {
          $('.gru-modal').animate(
            {
              scrollTop: $elTable.offset().top - $('.gru-modal').offset().top
            },
            animationSpeed
          );
        }
      } else {
        const $parentContainer = $('.controller.analytics.collection.student');
        const parentTopOffset = $parentContainer.length
          ? $parentContainer.offset().top
          : 0;
        const $body = $('html,body');
        //Check if the questions details are showing on table (md or sm devices) or  a list (xs devices)
        if ($tableVisible.length) {
          $body.animate(
            {
              scrollTop: $elTable.offset().top - parentTopOffset
            },
            animationSpeed
          );
        } else if ($cardsVisible.length) {
          $body.animate(
            {
              scrollTop: $elList.offset().top - parentTopOffset
            },
            animationSpeed
          );
        } else {
          Ember.Logger.error(
            `No element was found for selectorTable: ${selectorTable}`
          );
        }
      }
    },

    selectAttempt: function(attempt) {
      this.sendAction('onSelectAttempt', attempt);
    },

    /**
     * View Open Ended report
     * @param questionId {String}
     */
    viewOEReport: function(questionId) {
      this.sendAction('onViewOEReport', questionId);
    },

    /**
     * When update the question score
     * @param data {JSON}
     */
    onUpdateQuestionScore: function(data) {
      this.sendAction('onUpdateQuestionScore', data);
    }
  },

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'gru-assessment-report'],

  // -------------------------------------------------------------------------
  // Events
  /**
   * Listening for model to update component properties
   */
  onInit: Ember.on('init', function() {
    if (this.get('model')) {
      let assessmentResult = this.get('model').assessmentResult;
      this.set('assessmentResult', assessmentResult);
      this.set('profile', this.get('model').profile);
      this.set('areAnswersHidden', assessmentResult.get('areAnswersHidden'));
      this.set('isAnswerKeyHidden', assessmentResult.get('isAnswerKeyHidden'));
      this.set('isTeacher', assessmentResult.get('isTeacher'));
    }
    this.get('assessmentResult').fixResultsOrder();
  }),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {AssessmentResult} assessment
   */
  assessmentResult: null,
  /**
   * @property {Profile} profile
   */
  profile: null,

  /**
   * @property {boolean} areAnswersHidden - Should answer results be hidden?
   */
  areAnswersHidden: false,

  /**
   * @property {boolean} isAnswerKeyHidden - Should the answer key be hidden?
   */
  isAnswerKeyHidden: false,

  /**
   * @property {string} on select attempt action name
   */
  onSelectAttempt: null,

  /**
   * @property {boolean} isRealTime
   */
  isRealTime: Ember.computed('model', function() {
    return this.get('model.assessmentResult.isRealTime');
  }),

  /**
   * @property {boolean} showAttempts
   */
  showAttempts: Ember.computed('model', function() {
    return this.get('model.assessmentResult.showAttempts') !== undefined
      ? this.get('model.assessmentResult.showAttempts')
      : true;
  }),

  /**
   * Indicates if the reaction bar is visible
   * @property {boolean}
   */
  showReactionBar: true,

  /**
   * Return ordered non open ended questions array
   * @return {Ember.Array}
   */
  orderedQuestions: Ember.computed(
    'assessmentResult.nonOpenEndedQuestionResults.[]',
    function() {
      let resourceResultsOrdered = this.get(
        'assessmentResult.nonOpenEndedQuestionResults'
      );
      let correctAnswers = resourceResultsOrdered.findBy('correct', true);
      let inCorrectAnswers = resourceResultsOrdered.findBy('correct', false);
      if (correctAnswers || inCorrectAnswers) {
        this.set('hasAnsweredQuestions', true);
      }
      resourceResultsOrdered.sortBy('resource.order');
      return resourceResultsOrdered;
    }
  ),

  /**
   * Return ordered open ended questions array
   * @return {Ember.Array}
   */
  orderedOpenEndedQuestions: Ember.computed(
    'assessmentResult.openEndedQuestionResults.[]',
    function() {
      var resourceResultsOrdered = this.get(
        'assessmentResult.openEndedQuestionResults'
      );
      resourceResultsOrdered.sortBy('resource.order');
      return resourceResultsOrdered;
    }
  ),
  /**
   * Return ordered resources array
   * @return {Ember.Array}
   */
  orderedResources: Ember.computed('assessmentResult.resources[]', function() {
    var resourceResultsOrdered = this.get('assessmentResult.resources');
    resourceResultsOrdered.sortBy('resource.order');
    return resourceResultsOrdered;
  }),

  orderedResourceResults: Ember.computed(
    'assessmentResult.resourceResults[]',
    function() {
      var resourceResultsOrdered = this.get('assessmentResult.resourceResults');
      resourceResultsOrdered.sort(function(a, b) {
        return Ember.get(a, 'resource.order') - Ember.get(b, 'resource.order');
      });
      return resourceResultsOrdered;
    }
  ),

  /**
   * Indicates the visibility of change score button
   * @property {Boolean}
   */
  isChangeScoreEnabled: false,

  /**
   * check question list  has answered items
   * @type {Boolean}
   */
  hasAnsweredQuestions: false,

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('collections.standards.[]', function() {
    let standards = this.get('collections.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
      return TaxonomyTag.getTaxonomyTags(standards);
    }
  }),

  /**
   * @property {collections[]}
   */
  collections: Ember.computed('assessmentResult', function() {
    let component = this;
    if (component.get('assessmentResult')) {
      return component.get('assessmentResult.collection');
    }
  }),

  didInsertElement() {
    let component = this;
    if (!this.get('isClassActivityPage') && !component.isDestroyed) {
      this.fetchReadingContent();
    }
  }
});
