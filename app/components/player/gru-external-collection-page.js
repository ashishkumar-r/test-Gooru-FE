import Ember from 'ember';
import { CONTENT_TYPES, PLAYER_EVENT_SOURCE } from 'gooru-web/config/config';
import { generateUUID, validateTimespent } from 'gooru-web/utils/utils';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-external-collection-page'],

  // -------------------------------------------------------------------------
  // Dependencies
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Events

  /**
   * Observe the assessment change
   */
  collectionObserver: Ember.observer('collection', function() {
    let component = this;
    component.resetProperties();
  }),

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('collection.standards.[]', function() {
    let standards = this.get('collection.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
      return TaxonomyTag.getTaxonomyTags(standards);
    }
  }),

  didRender() {
    let component = this;
    component.timeValidator();
  },

  didInsertElement() {
    let component = this;
    component.$('[data-toggle="tooltip"]').tooltip();
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Action triggered when click start
     */
    onStart() {
      let component = this;
      component.set('isStarted', true);
      let externalUrl = component.get('collection.url');
      component.set('isDisableTimeEditor', false);
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
      component.set('isTimeEntered', true);
      component.updateSelfReport();
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

  timeValidator() {
    let component = this;
    component.$('.time').keyup(function() {
      let hours = component.get('hours');
      let mins = component.get('mins');
      component.set('isValidtime', validateTimespent(hours, mins));
      component.set('isTyping', true);
    });
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Boolean} isDisableTimeEditor
   */
  isDisableTimeEditor: true,

  /**
   * @property {Boolean} isTimeEntered
   */
  isTimeEntered: false,

  /**
   * @property {Boolean} isValidScore
   */
  isValidtime: null,

  /**
   * @property {Boolean} isStarted
   */
  isStarted: null,

  /**
   * @property {String} time
   */
  time: '',

  /**
   * @property {String} timeZone
   */
  timeZone: Ember.computed(function() {
    return moment.tz.guess() || null;
  }),

  /**
   * @property {String} contentType
   */
  contentType: 'collection-external',

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function getDataParams
   * Method to get structured data params which needs to be pass with post API
   */
  getDataParams() {
    let component = this;
    let hours = component.get('hours');
    let mins = component.get('mins');
    let mapLocation = component.get('mapLocation');
    let context = mapLocation.get('context');
    let userId = component.get('session.userId');
    let dataParams = {
      user_id: userId,
      class_id: context.get('classId') || null,
      course_id: context.get('courseId') || null,
      unit_id: context.get('unitId') || null,
      lesson_id: context.get('lessonId') || null,
      collection_type: 'collection-external',
      external_collection_id: context.get('collectionId'),
      collection_id: context.get('collectionId'),
      session_id: generateUUID(),
      partner_id: component.get('session.partnerId') || null,
      tenant_id: component.get('session.tenantId') || null,
      content_source: component.get('source') || null,
      path_id: context.get('pathId') || 0,
      path_type: context.get('pathType') || null,
      time_spent: component.roundMilliseconds(hours, mins),
      time_zone: component.get('timeZone'),
      evidence: [
        {
          TBD: 'True'
        }
      ]
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
    component.set('timeSpent', dataParams.time_spent);
    if (component.get('session.role') === 'student') {
      let selfReportedPromise = analyticsService.studentSelfReporting(
        dataParams
      );
      component.set('time', '');
      Ember.RSVP.hash({
        selfReport: selfReportedPromise
      })
        .then(function() {
          component.set('time', component.getEnteredTime());
        })
        .catch(function() {
          component.set('time', null);
        });
    } else {
      component.set('time', component.getEnteredTime());
    }
  },

  /**
   * @function roundMilliseconds
   * Method to round milliseconds
   */
  roundMilliseconds(hour = 0, mins = 0) {
    let timeSpentInMilliSec = (hour * 60 * 60 + mins * 60) * 1000;
    return timeSpentInMilliSec;
  },

  /**
   * @function getEnteredTime
   * Method to get entered score after update
   */
  getEnteredTime() {
    let component = this;
    let isStarted = component.get('isStarted');
    let time;
    if (isStarted) {
      let hours = component.get('hours') || 0;
      let mins = component.get('mins') || 0;
      time = `${hours} h ${mins} m`;
    }
    return time;
  },

  /**
   * @function resetProperties
   * Method to reset component Properties
   */
  resetProperties() {
    let component = this;
    this._super(...arguments);
    component.set('time', '');
    component.set('isTimeEntered', false);
    component.set('isStarted', false);
    component.set('isDisableTimeEditor', true);
    component.set('isValidtime', false);
    component.set('isShowActivityFeedback', false);
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
