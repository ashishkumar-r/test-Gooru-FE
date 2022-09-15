import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Service

  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-study-timer resource-child'],

  classNameBindings: [
    'isExpanded:expanded',
    'isShowPullup:show-timer-popup',
    'isPlayer:isPlayer'
  ],

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    this._super(...arguments);
    const component = this;
    let collection = component.get('collection');
    if (collection) {
      component.set('intervalObject', component.readingTimer());
      $(document).on('visibilitychange', function() {
        if (document.hidden) {
          clearInterval(component.get('intervalObject'));
        } else {
          component.set('intervalObject', component.readingTimer());
        }
      });
    }
    component.calculateContentTimespent();
  },

  /**
   * Observe the data change
   */
  timespentObserver: Ember.observer('studentTimespentData', function() {
    const component = this;
    let collection = component.get('collection');
    component.set('totalStudyTime', null);
    component.set('totalAssessmentTimespent', null);
    component.set('totalCollectionTimespent', null);
    component.calculateContentTimespent();
    if (collection) {
      component.set('intervalObject', component.readingTimer());
      $(document).on('visibilitychange', function() {
        if (document.hidden) {
          clearInterval(component.get('intervalObject'));
        } else {
          component.set('intervalObject', component.readingTimer());
        }
      });
    }
  }),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    timerExpanded: function(show) {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_STUDENT_STUDY_TIMER
      );
      this.set('isExpanded', !show);
    },

    closeStudyTimer: function() {
      this.sendAction('showTimer');
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Boolean}
   */
  isExpanded: false,

  totalStudyTime: null,

  totalCollectionTimespent: null,

  totalAssessmentTimespent: null,

  isBulr: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function calculateContentTimespent
   * Method to calculate content timespent
   */

  calculateContentTimespent() {
    const component = this;
    let studentTimespentData = component.get('studentTimespentData') || [];
    if (!component.isDestroyed) {
      studentTimespentData.map(reportData => {
        let timespentData = reportData.get('data');
        timespentData.map(data => {
          let totalTimespent =
            component.get('totalStudyTime') + data.get('totalTimespent');
          component.set('totalStudyTime', totalTimespent);
          if (
            data.get('format') === CONTENT_TYPES.COLLECTION ||
            data.get('format') === CONTENT_TYPES.EXTERNAL_COLLECTION
          ) {
            let collectionTimespent =
              component.get('totalCollectionTimespent') +
              data.get('totalTimespent');
            component.set('totalCollectionTimespent', collectionTimespent);
          } else if (
            data.get('format') === CONTENT_TYPES.ASSESSMENT ||
            data.get('format') === CONTENT_TYPES.EXTERNAL_ASSESSMENT
          ) {
            let assessmentTimespent =
              component.get('totalAssessmentTimespent') +
              data.get('totalTimespent');
            component.set('totalAssessmentTimespent', assessmentTimespent);
          }
        });
      });
    }
  },

  readingTimer() {
    let component = this;
    let collection = component.get('collection');
    return setInterval(() => {
      if (!component.isDestroyed) {
        component.incrementProperty('totalStudyTime', 1000);
        if (collection.get('isCollection')) {
          component.incrementProperty('totalCollectionTimespent', 1000);
        } else {
          component.incrementProperty('totalAssessmentTimespent', 1000);
        }
      }
    }, 1000);
  }
});
