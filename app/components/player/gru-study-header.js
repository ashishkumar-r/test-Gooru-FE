import Ember from 'ember';
import { ANONYMOUS_COLOR, PLAYER_EVENT_MESSAGE } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

/**
 * Study Player header
 *
 * Component responsible for showing an informative header for the study player.
 * It may embed other components for interacting with the player.
 *
 * @module
 * @see controllers/study-player.js
 * @augments ember/Component
 */
export default Ember.Component.extend(ConfigurationMixin, TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {PerformanceService} Service to retrieve class performance summary
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * @property {Service} session
   */
  session: Ember.inject.service('session'),

  /**
   * @type {Learner} Service to retrieve course performance summary
   */
  learnerService: Ember.inject.service('api-sdk/learner'),

  /**
   * @requires service:api-sdk/competency
   */
  competencyService: Ember.inject.service('api-sdk/competency'),

  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @type {ContextService} contextService
   * @property {Ember.Service} Service to send context related events
   */
  contextService: Ember.inject.service('quizzes/context'),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-study-header'],

  classNameBindings: [
    'showConfirmation:non-clickable',
    'isIframeMode:iframe-mode'
  ],

  mileStone: Ember.computed(function() {
    return {
      iconClass: 'msaddonTop',
      offset: {
        left: '-20px',
        top: '9px'
      }
    };
  }),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    onOpenLearningTools() {
      this.toggleProperty('isShowLearningTool');
    },

    mileStoneHandler: function() {
      let params;
      if (this.get('isIframeMode')) {
        const data = {
          message: PLAYER_EVENT_MESSAGE.GRU_PUllUP_CLOSE,
          classId: this.get('classId')
        };
        window.parent.postMessage(data, '*');
      } else {
        if (this.get('classId')) {
          params = {
            queryParams: {
              classId: this.get('classId'),
              courseId: this.get('courseId'),
              studyPlayer: this.get('isStudyPlayer')
            }
          };
        } else {
          params = {
            queryParams: {
              courseId: this.get('courseId')
            }
          };
        }
        this.get('router').transitionTo('student-locate', params);
      }
    },

    selectMenuItem: function(item) {
      const route = this.get('router');
      const classId = this.get('classId') || null;
      const component = this;
      const currentItem = component.get('menuItem');
      if (item !== currentItem) {
        component.setMenuItem(item);
        const queryParams = {
          queryParams: {
            filterBy: 'assessment'
          }
        };

        if (item === 'performance') {
          if (classId == null) {
            route.transitionTo(
              'student.independent.performance',
              this.get('courseId'),
              queryParams
            );
          } else {
            route.transitionTo(
              'student.class.performance',
              classId,
              queryParams
            );
          }
        } else if (item === 'course-map') {
          if (classId == null) {
            this.get('router').transitionTo(
              'student.independent.course-map',
              this.get('courseId'),
              {
                queryParams: {
                  refresh: true
                }
              }
            );
          } else {
            route.transitionTo('student.class.course-map', classId);
          }
        } else if (item === 'class-activities') {
          route.transitionTo('student.class.class-activities', classId);
        } else if (item === 'profile') {
          route.transitionTo('student.class.profile', classId);
        } else if (item === 'profile-prof') {
          let userId = this.get('session.userId');
          route.transitionTo(
            'student.class.student-learner-proficiency',
            classId,
            {
              queryParams: {
                userId: userId,
                classId: classId,
                courseId: this.get('courseId'),
                role: 'student'
              }
            }
          );
        } else {
          route.transitionTo('student.class');
        } // end of if block
      }
    },

    closePlayer: function() {
      let component = this;
      let isIframeMode = component.get('isIframeMode');
      let backUrl = component.get('collectionUrl');
      if (window.lastPlayedResource && window.lastPlayedResource.resourceId) {
        const context = window.lastPlayedResource;
        context.resourceResult.set('stopTime', new Date().getTime());
        component
          .get('contextService')
          .pausePlayResource(
            context.resourceId,
            context.contextId,
            context.resourceResult,
            context.eventContext
          )
          .then(() => {
            component.postMessage(isIframeMode, backUrl);
          })
          .catch(() => {
            component.postMessage(isIframeMode, backUrl);
          });
      } else {
        component.postMessage(isIframeMode, backUrl);
      }
      window.lastPlayedResource = null;
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLOSE_PLAYER_CONTAINER
      );
    }
  },

  postMessage(isIframeMode, backUrl) {
    if (isIframeMode) {
      if (backUrl) {
        window.history.back();
      } else {
        window.parent.postMessage(PLAYER_EVENT_MESSAGE.GRU_PUllUP_CLOSE, '*');
      }
    }
  },

  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
    if (this.get('courseId')) {
      this.loadContent();
    }
  },

  didRender() {
    this._super(...arguments);
    let component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
    const performancePercentage = component.get('performancePercentage');
    if (performancePercentage > 0) {
      component
        .$('.bar-charts')
        .popover({
          trigger: 'manual',
          html: false,
          placement: 'bottom'
        })
        .mouseover(function() {
          component.$(this).popover('show');
          let left =
            component
              .$('.bar-charts')
              .find('.segment')
              .width() - 20;
          let screenWidth = component.$('.bar-charts').width();
          if (left < 30) {
            left += 10;
          } else if (left + 70 >= screenWidth) {
            left -= 30;
          }

          component.$('.popover').css({
            left: `${left}px`
          });
          // Add hover icon
          component.$('.popover').css({
            cursor: 's-resize'
          });
        })
        .mouseleave(function() {
          component.$(this).popover('hide');
        });
    }
    if (
      component.$('.gru-study-navbar').length > 0 &&
      Ember.$('.qz-player').length > 0
    ) {
      Ember.$('.qz-player').css({
        'padding-top': '164px'
      });
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  menuItem: null,

  sourceType: null,

  /**
   * @property {String} color - Hex color value for the bar in the bar chart
   */
  color: ANONYMOUS_COLOR,

  /**
   * @property {String} collectionUrl
   */
  collectionUrl: null,

  /**
   * @property {String} classId - Class unique Id associated for the collection / assessment.
   */
  classId: null,

  /**
   * @property {String} courseId - course unique Id associated for the collection / assessment.
   */
  courseId: null,

  /**
   * @property {collection} collection - The current Collection
   */
  collection: null,

  /**
   * @property {Number} barChartData
   */
  barChartData: Ember.computed('performanceSummary', function() {
    const completed = this.get('performanceSummary.totalCompleted');
    const total = this.get('performanceSummary.total');
    const percentage = completed ? (completed / total) * 100 : 0;
    var barchartdata = [
      {
        color: this.get('color'),
        percentage
      }
    ];
    this.updateParent({
      barchartdata: barchartdata
    });
    return barchartdata;
  }),

  performancePercentage: Ember.computed('barChartData', function() {
    let data = this.get('barChartData').objectAt(0);
    return data.percentage.toFixed(0);
  }),

  /**
   * @property {Boolean} isStudyPlayer
   * Property to find out whether the study player is loaded or not
   */
  isStudyPlayer: false,

  /**
   * The class is premium or not
   * @property {Boolean}
   */
  isPremiumClass: Ember.computed('class', function() {
    let component = this;
    const currentClass = component.get('class');
    let setting = currentClass ? currentClass.get('setting') : null;
    return setting ? setting['course.premium'] : false;
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Load Header Content
   */
  loadContent: function() {
    const component = this;
    const myId = component.get('session.userId');
    const classId = component.get('classId');
    const totalResources = component.get('collection.resources')
      ? component.get('collection.resources').length
      : null;
    component.set('totalResources', totalResources);
    const courseId = component.get('courseId');
    if (classId) {
      let classCourseId = Ember.A([
        {
          classId,
          courseId
        }
      ]);
      let classData = component.get('class');
      const classPromise = classData
        ? classData
        : component.get('classService').readClassInfo(classId);
      let caClassPerfSummaryPromise = component
        .get('performanceService')
        .getCAPerformanceData([classId], myId);
      Ember.RSVP.hash({
        classPerformanceSummaryItems: component
          .get('performanceService')
          .findClassPerformanceSummaryByStudentAndClassIds(myId, classCourseId),
        performanceSummaryForDCA: caClassPerfSummaryPromise,
        classData: classPromise
      }).then(
        ({
          classPerformanceSummaryItems,
          performanceSummaryForDCA,
          classData
        }) => {
          component.set('class', classData);
          const preference = classData.get('preference');
          component.set(
            'performanceSummary',
            classPerformanceSummaryItems.findBy('classId', classId)
          );
          let isPremiumClass = component.get('isPremiumClass');
          const competencyCompletionStats = isPremiumClass
            ? component
              .get('competencyService')
              .getCompetencyCompletionStats(
                [{ classId: classId, subjectCode: preference.subject }],
                myId
              )
            : Ember.RSVP.resolve(Ember.A());
          competencyCompletionStats.then(competencyStats => {
            component.set(
              'competencyStats',
              competencyStats.findBy('classId', classId)
            );
          });

          const performanceSummaryForCA = performanceSummaryForDCA
            ? performanceSummaryForDCA.objectAt(0)
            : null;
          component.set('performanceSummaryForDCA', performanceSummaryForCA);
          component.updateParent({
            performanceSummary: component.get('performanceSummary')
          });
        }
      );
    } else {
      Ember.RSVP.hash({
        coursePerformanceSummaryItems: component
          .get('learnerService')
          .fetchCoursesPerformance(myId, [courseId])
      }).then(({ coursePerformanceSummaryItems }) => {
        let coursePerformanceSummaryItem = coursePerformanceSummaryItems.findBy(
          'courseId',
          courseId
        );
        if (coursePerformanceSummaryItem) {
          component.set(
            'performanceSummary',
            Ember.create({
              totalCompleted: coursePerformanceSummaryItem.completedCount,
              total: coursePerformanceSummaryItem.totalCount,
              score: coursePerformanceSummaryItem.scoreInPercentage
            })
          );
          component.updateParent({
            performanceSummary: component.get('performanceSummary')
          });
        }
      });
    }

    if (!this.menuItem) {
      this.setMenuItem('study-player');
    }
  },
  setMenuItem: function(item) {
    this.set('menuItem', item);
  },
  updateParent(objData) {
    if (this.attrs && this.attrs.updateModel) {
      this.attrs.updateModel(objData);
    }
  }
});
