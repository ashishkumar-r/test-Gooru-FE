import Ember from 'ember';
import { PLAYER_EVENT_SOURCE, SCORM_PATH } from 'gooru-web/config/config';
import { generateUUID, validateTimespent } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['scorm-player'],

  // -------------------------------------------------------------------------
  // Dependencies
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

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
   * Observe the assessment change
   */
  collectionUrl: Ember.computed('collection', function() {
    const collection = this.get('collection');
    const url = collection.url.replace('cdn.gooru.org', window.location.host);
    return url;
  }),

  didRender() {
    let component = this;
    component.timeValidator();
  },

  didInsertElement() {
    let component = this;
    this.injectScript(SCORM_PATH);
    component.$('[data-toggle="tooltip"]').tooltip();

    $(document).on('visibilitychange', function() {
      component.sendAction('onVisibilityChange');
    });
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
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

  /**
   * Action triggered when initial load
   */
  onStart() {
    let component = this;
    component.set('isStarted', true);
    component.set('isDisableTimeEditor', false);
    component.sendAction('onStartContentPlayed');
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

  isCompleted: false,

  score: 0,

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
    let selfReportedPromise = analyticsService.studentSelfReporting(dataParams);
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
  },

  initialize() {
    let component = this;
    let contexts = component.get('mapLocation.context');

    //eslint-disable-next-line
    window.API.apiLogLevel = 1;
    window.API_1484_11.apiLogLevel = 1;
    window.API_1484_11.on('Initialize', function() {
      component.onStart();
    });

    //eslint-disable-next-line
    window.API_1484_11.on('SetValue', function(eventName, eventData) {
      if (eventName === 'cmi.score.raw') {
        component.set('score', eventData);
      }
    });

    window.API_1484_11.on('Terminate', function() {
      $(document).off('visibilitychange');
      component.set('isCompleted', true);
      let totalScore = component.get('score');
      component.sendAction(
        'onStopPlayContentEvent',
        totalScore ? totalScore : 0
      );
    });

    window.API.on('LMSInitialize', function() {
      component.onStart();
    });

    window.API.on('LMSFinish', function() {
      $(document).off('visibilitychange');
      component.set('isCompleted', true);
      let totalScore = component.get('score');
      component.sendAction(
        'onStopPlayContentEvent',
        totalScore ? totalScore : 0
      );
    });

    //eslint-disable-next-line
    window.API.LMSSetValue = function(eventName, eventData) {
      if (eventName === 'cmi.suspend_data' && eventData !== '') {
        let context = {
          classId: contexts.get('classId') || null,
          courseId: contexts.get('courseId') || null,
          eventData: eventData
        };
        component.get('parseEventService').postParseEvent(eventName, context);
      }

      if (eventName === 'cmi.core.score.raw') {
        component.set('score', eventData);
      }
    };
  },

  /**
   * @function injectScript
   * @param {String} toolScriptPath
   * @param {Number} version
   * @return {Object} scriptElement
   * Method to inject script into dom
   */
  injectScript(toolScriptPath) {
    const component = this;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `${window.location.origin + toolScriptPath}`;
    document.getElementsByTagName('head')[0].appendChild(script);
    script.addEventListener('load', function() {
      component.initialize();
    });
  }
});
