import Ember from 'ember';
import {
  ROLES,
  CONTENT_TYPES,
  PLAYER_EVENT_SOURCE,
  TIME_SPENT_CHART_COLOR
} from 'gooru-web/config/config';
import { getBarGradeColor } from 'gooru-web/utils/utils';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(tenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @requires service:i18n
   */
  i18n: Ember.inject.service(),
  /**
   * @type {courseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @type {collectionService} Service to retrieve collection information
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @type {assessmentService} Service to retrieve assessment information
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @property {NavigateMapService}
   */
  navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

  // -------------------------------------------------------------------------
  // Attributes
  classNames: [
    'new-cards',
    'new-gru-independent-card',
    'col-sm-4',
    'col-xs-12',
    'col-md-3',
    'col-lg-3'
  ],

  actions: {
    /**
     * When going to an assessment/collection report
     */
    toReport: function() {
      const router = this.get('router');
      const location = this.get('location');
      const queryParams = {
        collectionId: location.get('collectionId'),
        userId: this.get('session.userId'),
        type: location.get('type'),
        role: ROLES.STUDENT,
        backUrl: router.get('currentPath')
      };
      router.transitionTo('reports.student-collection-analytics', {
        queryParams
      });
    },

    /**
     * When opening the player for current activity
     */
    openCoursePlayer: function() {
      const component = this;
      let collectionId = component.get('location.currentId');
      let type = component.get('location.currentType');
      let unitId = component.get('location.unitId');
      let lessonId = component.get('location.lessonId');
      let courseId = component.get('location.courseId');
      let title = component.get('location.currentTitle');
      let queryParams = {
        classId: null,
        unitId,
        lessonId,
        collectionId,
        role: ROLES.STUDENT,
        source: PLAYER_EVENT_SOURCE.INDEPENDENT_ACTIVITY,
        type,
        isIframeMode: true
      };

      component
        .get('navigateMapService')
        .startCollection(courseId, unitId, lessonId, collectionId, type)
        .then(function() {
          let playerContent = Ember.Object.create({
            title: title,
            format: type
          });
          component.set(
            'playerUrl',
            component
              .get('router')
              .generate('study-player', courseId, { queryParams })
          );
          component.set('isOpenPlayer', true);
          component.set('playerContent', playerContent);
        });
    },

    openPlayerContent: function() {
      const component = this;
      const location = component.get('location');
      let id = location.get('collectionId');
      let type = location.get('type');
      let queryParams = {
        type: type,
        role: 'student',
        source: component.get('source'),
        isIframeMode: true
      };
      let playerContent = Ember.Object.create({
        title: location.get('title'),
        format: location.get('type')
      });
      component.set(
        'playerUrl',
        component.get('router').generate('player', id, { queryParams })
      );
      component.set('isOpenPlayer', true);
      component.set('playerContent', playerContent);
    },

    closePullUp() {
      const component = this;
      component.set('isOpenPlayer', false);
    }
  },

  // -------------------------------------------------------------------------
  // Events
  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  init: function() {
    const component = this;
    component._super(...arguments);
    let isCourse = component.get('isCourse');
    let isCollection = component.get('isCollection');
    if (isCourse) {
      const courseId = component.get('location.courseId');
      if (courseId) {
        component
          .get('courseService')
          .fetchById(courseId)
          .then(function(course) {
            if (!component.isDestroyed) {
              component.set('content', course);
            }
          });
      }
    } else if (isCollection) {
      const collectionId = component.get('location.collectionId');
      if (collectionId) {
        component
          .get('collectionService')
          .readCollection(collectionId)
          .then(function(collection) {
            if (!component.isDestroyed) {
              component.set('content', collection);
            }
          });
      }
    } else {
      const assessmentId = component.get('location.collectionId');
      if (assessmentId) {
        component
          .get('assessmentService')
          .readAssessment(assessmentId)
          .then(function(assessment) {
            if (!component.isDestroyed) {
              component.set('content', assessment);
            }
          });
      }
    }
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Content} content information
   */
  content: null,

  /**
   * @property {Boolean} if the location is of type course
   */
  isCourse: Ember.computed.equal('location.type', CONTENT_TYPES.COURSE),

  /**
   * @property {Boolean} if the location is of type assessment
   */
  isAssessment: Ember.computed.equal('location.type', CONTENT_TYPES.ASSESSMENT),

  /**
   * @property {Boolean} if the location is of type collection
   */
  isCollection: Ember.computed.equal('location.type', CONTENT_TYPES.COLLECTION),

  /**
   * @property {Boolean} if the current activity is of type assessment
   */
  isCurrentAssessment: Ember.computed.equal(
    'location.currentType',
    CONTENT_TYPES.ASSESSMENT
  ),

  /**
   * @property {LearnerLocation} location information
   */
  location: null,

  /**
   * @property {LearnerPerformance} performance information
   */
  performance: null,

  /**
   * Percentage value for the score chart
   * @property {String}
   */
  percentageToShow: Ember.computed('performance.scoreInPercentage', function() {
    const score = this.get('performance.scoreInPercentage');
    return score || score === 0 ? `${score}%` : '--';
  }),

  /**
   * @property {Boolean}
   * Computed property  to identify class is started or not
   */
  hasStarted: Ember.computed('performance.scoreInPercentage', function() {
    const scorePercentage = this.get('performance.scoreInPercentage');
    return scorePercentage !== null && scorePercentage >= 0;
  }),

  /**
   * @property {String} source value when playing a collection/assessment
   */
  source: PLAYER_EVENT_SOURCE.INDEPENDENT_ACTIVITY,

  /**
   * @property {String} time spent chart background color
   */
  timeSpentColor: TIME_SPENT_CHART_COLOR,

  /**
   * @property {[Number]} barChartData
   */
  barChartData: Ember.computed('performance', function() {
    let score = this.get('performance.scoreInPercentage');
    let scoreColor = getBarGradeColor(score);
    const completed = this.get('performance.completedCount');
    const total = this.get('performance.totalCount');
    const percentage = completed ? (completed / total) * 100 : 0;
    return [
      {
        color: scoreColor,
        percentage
      }
    ];
  })
});
