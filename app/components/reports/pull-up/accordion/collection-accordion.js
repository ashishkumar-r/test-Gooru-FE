import Ember from 'ember';
import {formatTime, getBarGradeColor as getGradeColor} from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['collection-accordion'],


  classNameBindings: ['isExpanded:expanded:collapsed'],

  //------------------------------------------------------------------------
  //Dependencies

  i18n: Ember.inject.service(),

  /**
   * @requires service:performance
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  //------------------------------------------------------------------------
  //Actions
  actions: {
    onClickCollectionTitle: function(collection) {
      let component = this;
      let collectionId = collection.id;
      let collectionType = collection.collectionType;
      let sessionId = collection.sessionId;
      let collectionBody = component.$('.collection-content .collection-body');
      if (component.get('isExpanded')) {
        component.toggleProperty('isExpanded');
        collectionBody.slideUp();
      } else {
        collectionBody.slideDown();
        component.set('isLoading', true);
        let resourcePromise = [];
        if (collectionType === 'assessment') {
          resourcePromise = component.fetchAssessmentResources(collectionId, sessionId);
        } else if (collectionType === 'collection') {
          resourcePromise = component.fetchCollectionResources(collectionId, sessionId);
        }
        return resourcePromise.then(function(resources) {
          component.set('resources', resources);
          component.toggleProperty('isExpanded');
          component.toggleProperty('isLoading');
        });
      }
    }
  },

  //------------------------------------------------------------------------
  //Methods

  /**
   * @function fetchAssessmentResources
   * @return list of selected assessment resources
   */
  fetchAssessmentResources: function(collectionId, sessionId) {
    let component = this;
    let userId = component.get('userId');
    let unitId = component.get('unitId');
    let lessonId = component.get('lessonId');
    let courseId = component.get('courseId');
    let classId = component.get('classId');
    let assessmentPromise = Ember.RSVP.resolve(component.get('performanceService').getUserPerformanceResourceInAssessment(userId, courseId, unitId, lessonId, collectionId, sessionId, classId));
    return Ember.RSVP.hash({
      assessmentResources: assessmentPromise
    })
      .then(function(hash) {
        return hash.assessmentResources;
      });
  },

  /**
   * @function fetchCollectionResources
   * @return list of selected collection resources
   */
  fetchCollectionResources: function(collectionId, sessionId) {
    let component = this;
    let userId = component.get('userId');
    let unitId = component.get('unitId');
    let lessonId = component.get('lessonId');
    let courseId = component.get('courseId');
    let classId = component.get('classId');
    let collectionPromise = Ember.RSVP.resolve(component.get('performanceService').getUserPerformanceResourceInCollection(userId, courseId, unitId, lessonId, collectionId, sessionId, classId));
    return Ember.RSVP.hash({
      collectionResources: collectionPromise
    })
      .then(function(hash) {
        return hash.collectionResources;
      });
  },

  //------------------------------------------------------------------------
  //Dependencies
  /**
   * @property {Boolean}
   * show/hide expanded view
   */
  isExpanded: false,

  /**
   * @property {Boolean}
   * show/hide loading spinner
   */
  isLoading: true,

  /**
   * @property {Array}
   * Store collections data
   */
  collection: [],

  /**
   * @property {Array}
   * Store selected collection resource data
   */
  resources: [],

  /**
   * @property {String}
   * Store formatted timespent value
   */
  collectionTimespent: Ember.computed('collection', function() {
    let component = this;
    let timespent = component.get('collection.timeSpent');
    return timespent ? formatTime(timespent) : '--';
  }),

  /**
   * @property {Color}
   * Grade color code
   */
  colorStyle: Ember.computed('collection.score', function() {
    let component = this;
    let score = component.get('collection.score');
    return getGradeColor(score);
  })
});
