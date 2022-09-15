import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Handle event triggered by gru-bubbles
     */
    bubbleSelect: function(bubbleOption) {
      this.sendAction('onBubbleSelect', bubbleOption);
    },

    /**
     * Handle event triggered by gru-bubbles
     */
    selectAttempt: function(attempt) {
      this.set('selectedAttempt', attempt);
      this.sendAction('onSelectAttempt', attempt);
    }
  },

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'assessment', 'gru-summary'],

  // -------------------------------------------------------------------------
  // Events
  init: function() {
    this._super(...arguments);
    this.set('selectedAttempt', this.get('assessmentResult.totalAttempts'));
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {boolean} areQuestionLinksHidden - Should answer links be hidden?
   */
  areQuestionLinksHidden: false,

  /**
   * @property {AssessmentResult} assessment
   */
  assessmentResult: null,

  /**
   * @property {Collection}
   */
  collection: Ember.computed.alias('assessmentResult.collection'),

  /**
   * @property {number} selected attempt
   */
  selectedAttempt: null,

  /**
   * @property {boolean} is real time report
   */
  isRealTime: false,

  /**
   * @property {[]}
   */
  resourceLinks: Ember.computed(
    'assessmentResult.sortedResourceResults',
    function() {
      return this.getResourceLinks(
        this.get('assessmentResult.sortedResourceResults')
      );
    }
  ),

  /**
   * @property {[]}
   */
  attempts: Ember.computed('assessmentResult.totalAttempts', function() {
    return this.getAttemptList();
  }),

  /**
   * @property {boolean}showAttempts
   */
  showAttempts: true,

  /**
   * Indicates if the reaction bar is visible
   * @property {boolean}
   */
  showReactionBar: true,

  /**
   * Indicates the type of collection.
   * @return {Boolean}
   */
  isAssessment: Ember.computed('assessmentResult.collection', function() {
    return (
      this.get('assessmentResult.collection.collectionType') === 'assessment'
    );
  }),
  /**
   * Indicates the type of collection.
   * @return {Boolean}
   */
  imageUrl: Ember.computed('assessmentResult.collection', function() {
    if (this.get('assessmentResult.collection.thumbnailUrl') !== undefined) {
      return this.get('assessmentResult.collection.thumbnailUrl');
    } else {
      return this.get('assessmentResult.collection.imageUrl');
    }
  }),

  /**
   * It has the total number of  question count.
   * @property {Number}
   */
  questionCount: 0,

  /**
   * It has the total number of  resource count.
   * @property {Number}
   */
  resourceCount: 0,

  /**
   * It has the total number of  OE question count.
   * @property {Number}
   */
  oeQuestionCount: 0,

  hasOnlyOEQuestion: Ember.computed(
    'questionCount',
    'resourceCount',
    'oeQuestionCount',
    function() {
      return (
        this.get('oeQuestionCount') > 0 &&
        this.get('resourceCount') === 0 &&
        this.get('questionCount') === 0
      );
    }
  ),

  hasQuestionScore: Ember.computed(function() {
    return this.get('assessmentResult.score');
  }),

  // -------------------------------------------------------------------------
  // Methods
  getAttemptList: function() {
    var attempts = [];
    var totalAttempts = this.get('assessmentResult.totalAttempts');

    for (; totalAttempts > 0; totalAttempts--) {
      attempts.push({
        label: totalAttempts,
        value: totalAttempts
      });
    }
    return attempts;
  },

  /**
   * Convenience structure to render resource information
   * @param resourceResults
   * @returns {Array}
   */
  getResourceLinks: function(resourceResults) {
    return resourceResults.map(function(resourceResult, index) {
      return Ember.Object.create({
        label: index + 1, //using index here because the resource.order could have gaps
        status: Ember.get(resourceResult, 'attemptStatus'),
        value: Ember.get(resourceResult, 'id')
      });
    });
  }
});
