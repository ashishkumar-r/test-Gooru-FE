import Ember from 'ember';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import { CONTENT_TYPES, PLAYER_EVENT_SOURCE } from 'gooru-web/config/config';
import { validatePercentage, generateUUID } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-external-assessment-page'],

  // -------------------------------------------------------------------------
  // Dependencies
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Events
  didRender() {
    let component = this;
    component.scoreValidator();
  },

  /**
   * Observe the assessment change
   */
  assessmentObserver: Ember.observer('assessment', function() {
    let component = this;
    component.resetProperties();
  }),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Action triggered when click start
     */
    onStart() {
      let component = this;
      component.set('startTime', new Date().getTime());
      let externalUrl = component.get('assessment.url');
      component.set('isDisableScoreEditor', false);
      component.$('#percentage-score').focus();
      if (externalUrl) {
        if (component.get('toolDetails')) {
          component.sendAction('onStartContentPlayed');
        } else {
          window.open(externalUrl, CONTENT_TYPES.EXTERNAL_ASSESSMENT);
        }
      }
    },

    /**
     * Action triggered when click submit
     */
    onSubmit() {
      let component = this;
      component.set('isScoreEntered', true);
      component.set('stopTime', new Date().getTime());
      component.updateSelfReport();
    },

    /**
     * Action triggered when change score type
     */
    onChangeScoreType(type) {
      let component = this;
      component.set('defaultScoreType', type);
    },

    /**
     * Action triggered when click cancel
     */
    onCancel() {
      let component = this;
      let isIframeMode = component.get('isIframeMode');
      if (isIframeMode) {
        component.sendAction('onClosePlayer');
      } else {
        component.redirectTo();
      }
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Boolean} isDisableScoreEditor
   */
  isDisableScoreEditor: true,

  /**
   * @property {Boolean} isScoreEntered
   */
  isScoreEntered: false,

  /**
   * @property {String} contentType
   */
  contentType: 'assessment-external',

  /**
   * @property {Boolean} isValidScore
   */
  isValidScore: false,

  /**
   * @property {String} defaultScoreType
   */
  defaultScoreType: 'percentage',

  /**
   * @property {String} timeZone
   */
  timeZone: Ember.computed(function() {
    return moment.tz.guess() || null;
  }),

  /**
   * @property {Boolean} isTyping
   */
  isTyping: false,

  /**
   * @property {Number} startTime
   */
  startTime: 0,

  /**
   * @property {Number} stopTime
   */
  stopTime: 0,

  /**
   * @property {String} score
   */
  score: '',

  /**
   * @property {Object} dataParams
   */
  dataParams: null,

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('assessment', function() {
    let component = this;
    let standards = component.get('assessment.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
      return TaxonomyTag.getTaxonomyTags(standards);
    }
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function scoreValidator
   * Method to validate entered score
   */
  scoreValidator() {
    let component = this;
    component.$('.score-value').keyup(function() {
      if (component.get('defaultScoreType') === 'percentage') {
        let percentageScore = component.$('#percentage-score').val();
        component.set('isValidScore', validatePercentage(percentageScore));
      } else {
        let fractionScore = component.$('#fraction-score').val();
        let fractionMaxScore = component.$('#fraction-max-score').val();
        component.set(
          'isValidScore',
          component.validateFractionScore(fractionScore, fractionMaxScore)
        );
      }
      component.set('isTyping', true);
    });
  },

  /**
   * @function getDataParams
   * Method to get structured data params which needs to be pass with post API
   */
  getDataParams() {
    let component = this;
    let mapLocation = component.get('mapLocation');
    let percent_score = component.$('#percentage-score').val() || null;
    let score = component.$('#fraction-score').val() || null;
    let max_score = component.$('#fraction-max-score').val() || null;
    let context = mapLocation.get('context');
    let userId = component.get('session.userId');
    let dataParams = {
      percent_score,
      score,
      max_score,
      user_id: userId,
      class_id: context.get('classId') || null,
      course_id: context.get('courseId') || null,
      unit_id: context.get('unitId') || null,
      lesson_id: context.get('lessonId') || null,
      collection_type: context.get('itemType') || null,
      external_collection_id: context.get('collectionId'),
      collection_id: context.get('collectionId'),
      session_id: generateUUID(),
      time_zone: component.get('timeZone'),
      partner_id: component.get('session.partnerId') || null,
      tenant_id: component.get('session.tenantId') || null,
      content_source: component.get('source') || null,
      path_id: context.get('pathId') || 0,
      path_type: context.get('pathType') || null,
      time_spent: component.roundMilliseconds(
        component.get('stopTime') - component.get('startTime')
      ),
      evidence: [{ TBD: 'True' }]
    };
    return dataParams;
  },

  /**
   * @function updateSelfReport
   * Method to update score of an external assessment
   */
  updateSelfReport() {
    let component = this;
    let analyticsService = component.get('analyticsService');
    let dataParams = component.getDataParams();
    component.set('percentScore', dataParams.percent_score);
    if (component.get('session.role') === 'student') {
      let selfReportedPromise = analyticsService.studentSelfReporting(
        dataParams
      );
      component.set('score', '');
      Ember.RSVP.hash({
        selfReport: selfReportedPromise
      })
        .then(function() {
          component.set('score', component.getEnteredScore(dataParams));
          component.set('dataParams', dataParams);
        })
        .catch(function() {
          component.set('score', null);
        });
    } else {
      component.set('score', component.getEnteredScore(dataParams));
    }
  },

  /**
   * @function validateFractionScore
   * Method to validate fraction score
   */
  validateFractionScore(score, maxScore) {
    let isValidFractionScore = false;
    if (!isNaN(score) && !isNaN(maxScore)) {
      let isIntegerTypeScore = score.indexOf('.');
      let isIntegerTypeMaxScore = maxScore.indexOf('.');
      score = parseFloat(score);
      maxScore = parseFloat(maxScore);
      let isPositiveScore = score >= 0;
      let isNotExceedsLimit = maxScore >= 1 && maxScore <= 100;
      let isValidScore = score <= maxScore;
      let isIntegerNumber =
        isIntegerTypeScore === -1 && isIntegerTypeMaxScore === -1;
      if (
        isValidScore &&
        isNotExceedsLimit &&
        isPositiveScore &&
        isIntegerNumber
      ) {
        isValidFractionScore = true;
      }
    }
    return isValidFractionScore;
  },

  /**
   * @function roundMilliseconds
   * Method to round milliseconds
   */
  roundMilliseconds(milliseconds) {
    return milliseconds - (milliseconds % 1000);
  },

  /**
   * @function getEnteredScore
   * Method to get entered score after update
   */
  getEnteredScore(dataParams) {
    let component = this;
    let defaultScoreType = component.get('defaultScoreType');
    let score = null;
    if (defaultScoreType === 'percentage') {
      score = `${dataParams.percent_score}%`;
    } else {
      score = `${dataParams.score} of ${dataParams.max_score}`;
    }
    return score;
  },

  /**
   * @function resetProperties
   * Method to reset component Properties
   */
  resetProperties() {
    let component = this;
    this._super(...arguments);
    component.set('score', '');
    component.set('isScoreEntered', false);
    component.set('defaultScoreType', 'percentage');
    component.set('isDisableScoreEditor', true);
    component.set('isValidScore', false);
    component.set('startTime', 0);
    component.set('stopTime', 0);
    component.set('isTyping', false);
  },

  /**
   * Redirect to right path
   */
  redirectTo() {
    let component = this;
    let context = component.get('mapLocation.context');
    let source = component.get('source');
    if (context.get('classId') && source === PLAYER_EVENT_SOURCE.COURSE_MAP) {
      component
        .get('router')
        .transitionTo('student.class.course-map', context.get('classId'), {
          queryParams: {
            refresh: true
          }
        });
    } else if (
      context.get('classId') &&
      source === PLAYER_EVENT_SOURCE.DAILY_CLASS
    ) {
      component
        .get('router')
        .transitionTo('student.class.class-activities', context.get('classId'));
    } else {
      component
        .get('router')
        .transitionTo(
          'student.independent.course-map',
          context.get('courseId'),
          {
            queryParams: {
              refresh: true
            }
          }
        );
    }
  }
});
