import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import { ANSWER_SCORE_TYPE_ENUM, ANSWER_HEAD } from 'gooru-web/config/config';

export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Selects Performance Option or not
     * @function actions:selectPerformanceOption
     */
    selectPerformanceOption: function(showPerformance) {
      if (this.get('isTeacher') || !this.get('isAnswerKeyHidden')) {
        this.set('showPerformance', showPerformance);
      }
    },

    /**
     * View Open Ended report
     * @param questionId {String}
     */
    viewOEReport: function(questionId) {
      this.sendAction('onViewOEReport', questionId);
    },

    /**
     * Action get triggered when change score button  clicked
     */
    onChangeScore: function() {
      this.get('listOfQuestions').clear();
      this.set('isChangeScoreEnabled', true);
    },

    onShowMore() {
      this.toggleProperty('isExpanded');
    },

    /**
     * Action get triggered when change score confirm button clicked
     */
    onChangeScoreConfirm: function() {
      let questionScoreUpdateData = this.get('listOfQuestions');
      if (questionScoreUpdateData.length > 0) {
        this.sendAction('onUpdateQuestionScore', questionScoreUpdateData);
      } else {
        this.set('isChangeScoreEnabled', false);
      }
    },

    /**
     * Action get triggered when change score was cancelled
     */
    onChangeScoreNotConfirm: function() {
      this.get('listOfQuestions').clear();
      this.set('isChangeScoreEnabled', false);
    },

    /**
     * It will maintain the list of questions  which need to be update the score.
     * @param  {Boolean} status
     * @param  {Object} item   Question Ember object
     */
    changeQuestionScore: function(status, item) {
      let listOfQuestions = this.get('listOfQuestions');
      let question = listOfQuestions.findBy('resource_id', item.resourceId);
      if (question) {
        question.set(
          'resource_attempt_status',
          status ? 'correct' : 'incorrect'
        );
      } else {
        question = Ember.Object.create({
          resource_id: item.resourceId,
          resource_attempt_status: status ? 'correct' : 'incorrect'
        });
        listOfQuestions.pushObject(question);
      }
    },
    onShowPullUp: function(file) {
      this.set('activeFile', file);
      this.set('isShowFilePullUp', true);
    },

    onClosePullup: function() {
      this.set('activeFile', null);
      this.set('isShowFilePullUp', false);
    }
  },
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:i18n
   */
  i18n: Ember.inject.service(),

  /**
   * @requires service:session
   */
  session: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'assessment', 'gru-questions'],

  classNameBindings: [
    'isAnswerKeyHidden:key-hidden',
    'showPerformance:performance-view'
  ],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {boolean} isAnswerKeyHidden - Should the answer key be hidden?
   */
  isAnswerKeyHidden: false,

  /**
   * List of questions to be displayed by the component
   *
   * @constant {Array}
   */
  results: null,

  /**
   * Indicate if the table show the performance columns
   *
   * @property {Boolean}
   */
  showPerformance: true,

  isShowFilePullUp: false,

  scoreExpert: Ember.computed('content.score', function() {
    const contentScore = this.get('content.score') || 0;
    let totalScore = 0;

    if (contentScore < 50) {
      totalScore = 0;
    } else if (contentScore > 50 && contentScore < 100) {
      totalScore = 1;
    } else {
      totalScore = contentScore / 100;
    }
    return totalScore;
  }),

  hasMoreText: Ember.computed('content.resource.text', function() {
    const questionText = this.get('content.resource.text');
    return (
      questionText && questionText.length > 100 && this.get('enableMorebtn')
    );
  }),

  activeFile: Ember.A(),

  answerHead: Ember.computed('i18n', function() {
    const labelText = this.get('i18n').t(
      ANSWER_HEAD[this.get('content.resource.type')]
    ).string;
    return labelText
      ? labelText
      : this.get('i18n').t('report.answer-label').string;
  }),

  /**
   * @property {boolean}
   * Property to check whether rendering question is SERP or not
   */
  isSerp: Ember.computed('content.resource', function() {
    return this.get('content.resource.type')
      ? this.get('content.resource.type').includes('SERP')
      : false;
  }),

  /**
   * Indicates if the reaction bar is visible
   * @property {boolean}
   */
  showReactionBar: true,

  /**
   * Indicates if the view is open ended
   * @property {boolean}
   */
  isOpenEnded: Ember.computed('viewMode', function() {
    return this.get('viewMode') === 'open-ended';
  }),

  /**
   * Indicates change score button got enabled.
   * @property {boolean}
   */
  isChangeScoreEnabled: false,

  /**
   * Update question score list
   * @return {Array} list of question scores need to be update.
   */
  listOfQuestions: Ember.A(),

  enableMorebtn: false,

  isExpanded: false,

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  taxonomyTags: Ember.computed('content.resource.standards', function() {
    let standards = this.get('content.resource.standards');
    if (standards && standards.length) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
      return TaxonomyTag.getTaxonomyTags(standards);
    }
  }),

  hideAnswerStatus: Ember.computed('content.resource', function() {
    if (this.get('content.resource')) {
      const resourceItem = this.get('content.resource');
      return !(
        resourceItem.get('isOpenEnded') ||
        resourceItem.get('isScientificFreeRes') ||
        resourceItem.get('isScientificFIB') ||
        resourceItem.get('isSerpWPM')
      );
    }
  }),
  scoreEvaluate: Ember.computed('content', function() {
    const score = this.get('content.score');
    if (score || score === 0) {
      if (score === 100) {
        return ANSWER_SCORE_TYPE_ENUM.correct;
      } else if (score === 0) {
        return ANSWER_SCORE_TYPE_ENUM.incorrect;
      } else {
        return ANSWER_SCORE_TYPE_ENUM.partiallyCorrect;
      }
    } else {
      return 'not-started';
    }
  }),

  didRender: function() {
    let component = this;
    component.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
  }
});
