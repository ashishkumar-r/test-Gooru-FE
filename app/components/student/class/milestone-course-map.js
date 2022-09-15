import Ember from 'ember';
import {
  ROLES,
  PLAYER_EVENT_SOURCE,
  CONTENT_TYPES,
  PATH_TYPE,
  DEPENDENT_LESSON_SUGGESTION_EVENTS,
  DIAGNOSTIC_LESSON_SUGGESTION_EVENTS
} from 'gooru-web/config/config';
import CurrentLocationSerializer from 'gooru-web/serializers/analytics/current-location';
import { getObjectsDeepCopy, getObjectCopy } from 'gooru-web/utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import ContextMixin from 'gooru-web/mixins/quizzes/context';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Component.extend(
  ContextMixin,
  tenantSettingsMixin,
  ConfigurationMixin,
  {
    // -------------------------------------------------------------------------
    // Attributes

    classNames: ['student-class-milestone-course-map'],

    classNameBindings: [
      'competencySummary:student-competency-summary',
      'isStudentDashboard:student-dashboard-milestone'
    ],

    // -------------------------------------------------------------------------
    // Dependencies

    location: null,

    currentLocationSerializer: null,

    /**
     * @requires service:session
     */
    session: Ember.inject.service(),

    /**
     * @requires service:api-sdk/course-map
     */
    courseMapService: Ember.inject.service('api-sdk/course-map'),

    /**
     * @type {CourseService} Service to retrieve course information
     */
    courseService: Ember.inject.service('api-sdk/course'),

    /**
     * @type {performanceService} Service to retrieve milestone performance information
     */
    performanceService: Ember.inject.service('api-sdk/performance'),

    /**
     * @requires service:api-sdk/analytics
     */
    analyticsService: Ember.inject.service('api-sdk/analytics'),

    /**
     * @property {NavigateMapService}
     */
    navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

    /**
     * Rescope Service to perform rescope data operations
     */
    rescopeService: Ember.inject.service('api-sdk/rescope'),

    /**
     * taxonomy service dependency injection
     * @type {Object}
     */
    taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

    competencyService: Ember.inject.service('api-sdk/competency'),
    /**
     * @requires service:api-sdk/collection
     */
    collectionService: Ember.inject.service('api-sdk/collection'),
    /**
     * @requires service:api-sdk/assessment
     */
    assessmentService: Ember.inject.service('api-sdk/assessment'),

    /**
     * @property {Boolean} isTeacher
     */
    isTeacher: Ember.computed.equal('session.role', 'teacher'),

    /**
     * @property {Boolean} isStudent
     */
    isStudent: Ember.computed.not('isTeacher'),

    lessonService: Ember.inject.service('api-sdk/lesson'),

    portfolioService: Ember.inject.service('api-sdk/portfolio'),
    /**
     * route0 Service to perform route0 data operations
     */
    route0Service: Ember.inject.service('api-sdk/route0'),
    /**
     * @property {Service} parseEvent service
     */
    parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

    tenantService: Ember.inject.service('api-sdk/tenant'),

    quizzesAttemptService: Ember.inject.service('quizzes/attempt'),

    i18n: Ember.inject.service(),

    /**
     * @type {unit0Service} Service to retrieve unit0 information
     */
    unit0Service: Ember.inject.service('api-sdk/unit0'),

    /**
     * @property {UUID} userId
     * Active userID should be student
     */
    usersId: Ember.computed(function() {
      return this.get('session.userId');
    }),

    isInitialSkyline: false,

    // -------------------------------------------------------------------------
    // Observer
    onShowRescope: Ember.observer('showAllRescopedContent', function() {
      this.handleLastLessonPath();
      this.handleMileStonePath();
    }),

    // -------------------------------------------------------------------------
    // Properties

    /**
     * Maintains the state of data loading
     * @type {Boolean}
     */
    isLoading: false,

    /**
     * Class Id extract from class object
     * @type {String}
     */
    classId: Ember.computed.alias('class.id'),

    /**
     * Course Id which is mapped to this class.
     * @type {String}
     */
    courseId: Ember.computed.alias('class.courseId'),

    /**
     * This property have details of milestone object
     * @type {Object}
     */
    milestone: null,
    /**
     * Computed Property to extract framework code from settings
     * @return {String}
     */
    fwCode: Ember.computed('class', function() {
      let preference = this.get('class.preference');
      return preference != null ? preference.get('framework') : null;
    }),
    /**
     * @property {String} subjectCode
     * Property for class preference subject code
     */
    subjectCode: Ember.computed('class', function() {
      let preference = this.get('class.preference');
      return preference != null ? preference.get('subject') : null;
    }),

    /**
     * Maintains the state of performance data to show or now
     * @type {Boolean}
     */
    showPerformance: true,

    /**
     * Maintains the state of whether to locate last played item or not
     * @type {Boolean}
     */
    locateLastPlayedItem: true,

    /**
     * @property {Boolean} isShowLessonPlan
     */
    isShowLessonPlan: false,

    /**
     * @property {Boolean} isShowMilestoneReport
     */
    isShowMilestoneReport: false,
    /**
     * Getting route0's last index value
     * @property {Number} totalRoute0Milestones
     */
    totalRoute0Milestones: 0,

    /**
     * @property {Number} activeMilestoneIndex
     */
    activeMilestoneIndex: 1,

    /**
     * @property {Object} rescopedContents
     */
    rescopedContents: null,

    /**
     * Maintains the state of show all rescope content or not.
     * @type {Boolean}
     */
    showAllRescopedContent: false,

    /**
     * Maintains the student Id, by default this will be NULL
     * @type {String}
     */
    studentId: null,

    /**
     * Property will decided to show the play button or not
     * @type {Boolean}
     */
    allowToPlay: true,

    /**
     * Maintains the value of show full course button toggle or not.
     * @type {Boolean}
     */
    showToggleButtonToViewFullCourse: false,

    /**
     * @property {Object} competencySummary
     * Property for student destination based competency summary data
     */
    competencySummary: null,

    /**
     * Maintains the userId of milestone display view
     * @type {String}
     */
    userId: null,

    /**
     * @property {Object} classMilestones
     * Property for list of all milestones aligned to the class
     */
    classMilestones: null,

    isShowPortfolioActivityReport: false,

    attemptContent: null,

    lessonState: null,

    isStudentDashboard: false,

    /**
     * @property {Array} milestones
     * Property for list of all milestones aligned to the class/student class boundary
     */
    milestones: Ember.computed(function() {
      return getObjectsDeepCopy(this.get('classMilestones')) || Ember.A([]);
    }),
    openingLocation: Ember.observer('location', function() {
      if (this.get('location') !== 'null') {
        this.navigateLocation();
      }
    }),

    /**
     * Property will decided to the class is public or not
     * @type {Boolean}
     */
    isPublic: Ember.computed.alias('class.isPublic'),

    /**
     * Property will decided the start sequence of the milestone
     * @type {Number}
     */
    onChangeSequence: Ember.observer(
      'milestones.[]',
      'showAllRescopedContent',
      function() {
        const milestones = this.get('milestones');
        if (milestones) {
          if (!this.get('showAllRescopedContent')) {
            const route0AndNonRescopedContents = milestones.filter(
              milestone => {
                return (
                  !milestone.rescope ||
                  milestone.isClassGrade ||
                  milestone.isRoute0
                );
              }
            );
            if (route0AndNonRescopedContents) {
              route0AndNonRescopedContents.forEach(
                (route0AndNonRescopedContent, index) => {
                  route0AndNonRescopedContent.set('milestoneSequence', index);
                }
              );
            }
          }
        }
      }
    ),
    isShowContentVisibility: Ember.computed('class', function() {
      let tenantSetting = this.get('tenantService').getStoredTenantSetting();
      let parsedTenantSettings = JSON.parse(tenantSetting);
      if (
        parsedTenantSettings &&
        parsedTenantSettings.allow_to_change_class_course_content_visibility !==
          undefined
      ) {
        return (
          parsedTenantSettings &&
          parsedTenantSettings.allow_to_change_class_course_content_visibility ===
            'on'
        );
      } else {
        return true;
      }
    }),

    isStudyPlayer: false,

    diagnosticLessons: Ember.A(),

    dependentPaths: Ember.A([]),

    isDiagnosticEnd: false,

    diagnosticDetails: null,

    noSuggestedLesson: false,

    isLessonSuggestionSkipped: false,

    unit0Milestones: Ember.A([]),

    disabledUnit0: Ember.computed.alias(
      'configuration.GRU_FEATURE_FLAG.disabledUnit0'
    ),

    hasUnit0Content: Ember.computed('milestones', function() {
      return !!this.get('milestones').findBy('isUnit0', true);
    }),

    isShowImpersonate: Ember.computed(function() {
      let impersonate;
      if (window.frameElement) {
        impersonate = window.parent.impersonate;
      }
      return impersonate;
    }),
    // -------------------------------------------------------------------------
    // Actions

    init: function() {
      this._super(...arguments);
      this.set(
        'currentLocationSerializer',
        CurrentLocationSerializer.create(Ember.getOwner(this).ownerInjection())
      );
    },

    actions: {
      /**
       * Handle toggle functionality of hide/show milestone items
       * @return {Object}
       */
      toggleMilestoneItems(selectedMilestone) {
        let component = this;
        if (selectedMilestone) {
          component.handleMilestoneToggle(selectedMilestone);
        }
      },

      onAssessmentReport(content, lesson, collection, isRoute0) {
        this.set('attemptContent', content);
        this.send(
          'onShowStudentMilestoneCollectionReport',
          lesson,
          collection,
          isRoute0
        );
      },

      showLessonPlan: function(lesson, container) {
        let component = this;
        const courseId = component.get('courseId');
        const unitId = lesson.unit_id;
        const lessonId = lesson.lesson_id;
        this.$(`.${container}`).slideToggle();
        component
          .get('lessonService')
          .fetchById(courseId, unitId, lessonId)
          .then(function(data) {
            if (data.lessonPlan) {
              component.set('isShowLessonPlan', true);
              component.set('lessonPlanInfo', data);
            }
          });
        const context = {
          classId: component.get('classId'),
          lessonId: lessonId
        };
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.VIEW_LESSON_PLAN, context);
      },

      /**
       * Handle toggle functionality of hide/show lesson items
       * @return {Object}
       */
      toggleLessonItems(milestone, lessons, selectedLesson, lessonIndex) {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_STUDENT_LJ_MILESTONE_ITEM
        );
        this.handleMilestoneLessonToggle(
          milestone,
          lessons,
          selectedLesson,
          lessonIndex
        );
      },

      /**
       * Open the player with the specific collection/assessment
       *
       * @function actions:studyPlayer
       * @param {string} milestone - Identifier for a milestone
       * @param {string} unitId - Identifier for a unit
       * @param {string} lessonId - Identifier for lesson
       * @param {string} item - collection, assessment, lesson or resource
       */
      studyPlayer: function(type, milestoneId, unitId, lessonId, item) {
        const component = this;
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_LJ_MILESTONE_ITEM_PLAY);
        if (!component.get('isStudyPlayer')) {
          const classId = component.get('classId');
          const minScore = component.get('class.minScore');
          const courseId = component.get('courseId');
          item.set('minScore', minScore);
          component.startCollectionStudyPlayer(
            classId,
            courseId,
            unitId,
            lessonId,
            item,
            milestoneId
          );
        }
      },
      showContentTypeBlock: function(
        container,
        itemId,
        item,
        lesson,
        milestone
      ) {
        const component = this;
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_LJ_MILESTONE_ITEM_INFO);
        const isTeacher = component.get('isTeacher');
        const studentId = component.get('studentId');
        const userId = isTeacher ? studentId : component.get('usersId');
        item.toggleProperty('isClose');
        if (item.get('isClose') && !item.activityAttempts) {
          item.set('isLoading', true);
          const requestParam = {
            userId,
            itemId
          };
          component.set('activeItem', item);
          component
            .get('portfolioService')
            .getAllAttemptsByItem(requestParam)
            .then(function(activityAttempts) {
              if (!component.isDestroyed) {
                let result = activityAttempts.map(function(data, index) {
                  const activeIndex = index + 1;
                  data.set('index', activeIndex);
                  return data;
                });
                item.set('activityAttempts', result);
                item.set('isLoading', false);
                if (!component.get('isPathRouteView')) {
                  component.drawExpandedPath(item, lesson, milestone);
                }
              }
            });
          return;
        }
        if (!component.get('isPathRouteView')) {
          component.drawExpandedPath(item, lesson, milestone);
        }
      },

      //Action triggered when click on milestone performance
      onShowMilestoneReport(milestone) {
        const component = this;
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_LJ_MILESTONE_REPORT);
        component.set('selectedMilestone', milestone);
        component.set(
          'activeMilestoneIndex',
          component.get('milestones').indexOf(milestone)
        );
        component.set('isShowMilestoneReport', true);
      },

      onShowReportRerouteReport(lesson, collection, suggestLesson) {
        const activLesson = collection.parentId ? suggestLesson : lesson;
        this.send(
          'onShowStudentMilestoneCollectionReport',
          activLesson,
          collection,
          true
        );
      },

      //Action triggered when click on collection performance
      onShowStudentMilestoneCollectionReport(lesson, collection, isRoute0) {
        const component = this;
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_LJ_MILESTONE_ITEM_REPORT);
        let userUid = component.get('userId');
        let studentCollectionReportContext = {
          userId: userUid,
          classId: component.get('classId'),
          courseId: component.get('courseId'),
          unitId: lesson.get('unit_id'),
          lessonId: lesson.get('lesson_id'),
          collectionId: collection.get('id'),
          milestoneId: component.get('selectedMilestone.milestone_id'),
          type: collection.get('format'),
          lesson,
          isStudent: component.get('isStudent'),
          isTeacher: component.get('isTeacher'),
          collection,
          isRoute0,
          startTime: moment().format('HH:MM'),
          subType: collection.get('collectionSubType')
            ? collection.get('collectionSubType')
            : collection.get('format')
        };
        let reportType = collection.get('format');
        if (reportType === CONTENT_TYPES.EXTERNAL_ASSESSMENT) {
          component.set('isShowStudentExternalAssessmentReport', true);
        } else if (reportType === CONTENT_TYPES.OFFLINE_ACTIVITY) {
          studentCollectionReportContext.performance = {
            score: collection.get('performance.scoreInPercentage'),
            timeSpent: collection.get('performance.timeSpent')
          };
          component.set('isShowStudentOfflineActivityReport', true);
        } else {
          component.set('isShowStudentCollectionReport', true);
        }
        component.set(
          'studentCollectionReportContext',
          studentCollectionReportContext
        );
      },

      /**
       * This action is responsible for toggle the property of @property showAllRescopedContent
       */
      onToggleRescope() {
        this.toggleProperty('showAllRescopedContent');
      },

      //Action triggered when click on the student competencies progress graph
      onClickProgressChart() {
        this.get('router').transitionTo(
          'student.class.student-learner-proficiency',
          {
            queryParams: {
              userId: this.get('session.userId'),
              classId: this.get('classId'),
              courseId: this.get('courseId'),
              role: ROLES.STUDENT
            }
          }
        );
      },

      closePullUp() {
        const component = this;
        component.set('isOpenPlayer', false);
        component.sendAction('resetPerformance');
        component.loadData();
      },

      onSelectSuggestLesson(lesson) {
        this.fetchCollectionPerformance(lesson, lesson.collections);
      }
    },

    // -------------------------------------------------------------------------
    // Events

    /**
     * Function to triggered once when the component element is first rendered.
     */
    didInsertElement() {
      let component = this;
      const userId = component.get('studentId')
        ? component.get('studentId')
        : component.get('session.userId');
      component.set('userId', userId);
      component.loadData();
      if (component.get('milestones.length')) {
        const context = {
          classId: component.get('classId'),
          milestoneId: this.get('milestones')[0].milestone_id
        };
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.VIEW_MILESTONE, context);
      }
    },

    didRender() {
      let component = this;
      component.$('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover'
      });
      component.$('[data-toggle="popover"]').popover({
        trigger: 'hover',
        placement: 'bottom'
      });
    },

    //--------------------------------------------------------------------------
    // Methods

    loadData() {
      let component = this;
      component.set('isLoading', true);
      let showPerformance = component.get('showPerformance');
      let locateLastPlayedItem = component.get('locateLastPlayedItem');
      let taxonomyService = component.get('taxonomyService');
      const disabledUnit0 = component.get('disabledUnit0');
      let filters = {
        subject: component.get('class.preference.subject')
      };
      let fwkCode = component.get('class.preference.framework');
      if (fwkCode) {
        filters.fw_code = fwkCode;
      }
      let classId = component.get('classId');
      let courseId = component.get('courseId');
      let fwCode = component.get('fwCode');
      let userUid = component.get('userId');

      Ember.RSVP.hash({
        milestoneHasContent: component
          .get('courseService')
          .getCourseMilestones(courseId, fwCode, classId, userUid),
        rescopedContents: component.getRescopedContents(),
        grades: taxonomyService.fetchGradesBySubject(filters),
        competencySummary: component.get('isStudent')
          ? component.fetchStudentCompetencySummary()
          : null,
        unit0: !disabledUnit0
          ? component.get('unit0Service').fetchUnit0({ courseId, classId })
          : Ember.A([])
      }).then(
        ({
          milestoneHasContent,
          rescopedContents,
          grades,
          competencySummary,
          unit0
        }) => {
          if (!component.isDestroyed) {
            if (competencySummary && competencySummary.length) {
              competencySummary = competencySummary.get('firstObject');
              let masteredCount = competencySummary.completedCompetencies;
              let inProgressCount = competencySummary.inprogressCompetencies;
              let totalCount = competencySummary.totalCompetencies;
              let notstartedCompetencies =
                totalCount - inProgressCount - masteredCount;
              competencySummary.set(
                'notstartedCompetencies',
                notstartedCompetencies
              );
            }
            component.set('unit0Milestones', unit0);
            component.set('competencySummary', competencySummary);
            const milestones = component.get('milestones');
            const route0Milestones = component.get('route0Milestones') || [];
            let milestoneData = component.renderMilestonesBasedOnStudentGradeRange(
              grades,
              milestones,
              milestoneHasContent,
              route0Milestones
            );
            component.set('rescopedContents', rescopedContents);
            component.set('milestones', milestoneData);
            if (!component.get('isStudyPlayer')) {
              component.resetDataReferences();
            }
            if (showPerformance) {
              component.fetchMilestonePerformance();
            }
            let customLocationPresent = component.get('location');
            if (customLocationPresent) {
              component.navigateLocation();
            } else if (locateLastPlayedItem) {
              component.identifyUserLocationAndLocate();
            }
            component.set('isLoading', false);
            component.sendAction('checkAllContentsAreRescoped', milestoneData);
          }
        }
      );
    },

    resetDataReferences() {
      const component = this;
      const milestones = component.get('milestones');
      milestones.forEach(milestone => {
        if (milestone.get('lessons')) {
          const lessons = milestone.get('lessons');
          lessons.forEach(lesson => {
            lesson.set('hasCollectionFetched', false);
            lesson.set('isActive', false);
            lesson.set('isPrevActive', false);
            lesson.set('isNextActive', false);
            const collections = lesson.get('collections');
            if (collections) {
              collections.forEach(collection => {
                collection.set('last-played-collection', false);
                collection.set('has-activity', false);
              });
            }
          });
        }
      });
      component.set('currentLocation', null);
    },

    addRoute0InMilestones(milestones, route0Contents) {
      const component = this;
      const unit0Milestones = component.get('unit0Milestones');
      let milestoneItems = milestones;
      if (route0Contents && route0Contents.length) {
        milestoneItems = [...route0Contents, ...milestones];
      }
      if (unit0Milestones && unit0Milestones.length) {
        milestoneItems = [...unit0Milestones, ...milestoneItems];
      }
      if (component.get('isStudentDashboard')) {
        let currentLocation =
          component.get('currentLocation') ||
          component.get('userCurrentLocation');
        let isInitiated = false;
        milestoneItems.forEach(milestone => {
          if (currentLocation) {
            const isCurrentMilestone =
              currentLocation.milestoneId === milestone.milestone_id;
            if (!isCurrentMilestone && component.get('isStudentDashboard')) {
              milestone.set('disableMilestone', true);
            }
          } else {
            if (!milestone.rescope && isInitiated) {
              milestone.set('disableMilestone', true);
            }
            isInitiated = true;
          }
        });
      }
      return milestoneItems;
    },

    fetchMilestonePerformance() {
      let component = this;
      let performanceService = component.get('performanceService');
      let classId = component.get('classId');
      let courseId = component.get('courseId');
      let fwCode = component.get('fwCode');
      let userUid = component.get('userId');
      let milestones = component.get('milestones');
      Ember.RSVP.hash({
        milestonesPerformanceScore: performanceService.getPerformanceForMilestones(
          classId,
          courseId,
          'assessment',
          userUid,
          fwCode
        ),
        milestonesPerformanceTimeSpent: performanceService.getPerformanceForMilestones(
          classId,
          courseId,
          'collection',
          userUid,
          fwCode
        )
      }).then(
        ({ milestonesPerformanceScore, milestonesPerformanceTimeSpent }) => {
          milestones.map(milestone => {
            let milestonePerformanceData = Ember.Object.create({
              hasStarted: false,
              completedCount: 0,
              totalCount: 0,
              completedInPrecentage: 0,
              scoreInPercentage: null,
              timeSpent: null
            });
            let milestonePerformance = milestonesPerformanceScore.findBy(
              'milestoneId',
              milestone.get('milestone_id')
            );
            if (!milestonePerformance) {
              milestonePerformance = milestonesPerformanceTimeSpent.findBy(
                'milestoneId',
                milestone.get('milestone_id')
              );
              milestone.set('isMilestone', true);
            }
            if (milestonePerformance) {
              milestonePerformance = milestonePerformance.get('performance');
              milestonePerformanceData.set(
                'scoreInPercentage',
                milestonePerformance.get('scoreInPercentage')
              );
              milestonePerformanceData.set(
                'timeSpent',
                milestonePerformance.get('timeSpent')
              );
              milestonePerformanceData.set(
                'completedInPrecentage',
                milestonePerformance.get('completedInPrecentage')
              );
              milestonePerformanceData.set(
                'completedCount',
                milestonePerformance.get('completedCount')
              );
              milestonePerformanceData.set(
                'totalCount',
                milestonePerformance.get('totalCount')
              );
              milestonePerformanceData.set(
                'hasStarted',
                milestonePerformance.get('scoreInPercentage') !== null &&
                  milestonePerformance.get('scoreInPercentage') >= 0
              );
            }
            milestone.set('performance', milestonePerformanceData);
          });
        }
      );
    },

    fetchMilestoneLessonsPerformance(milestoneId, lessons) {
      let component = this;
      let performanceService = component.get('performanceService');
      let classId = component.get('classId');
      let courseId = component.get('courseId');
      let fwCode = component.get('fwCode');
      let userUid = component.get('userId');

      Ember.RSVP.hash({
        milestoneAssessmentLessonsPerformance: performanceService.getLessonsPerformanceByMilestoneId(
          classId,
          courseId,
          milestoneId,
          CONTENT_TYPES.ASSESSMENT,
          userUid,
          fwCode
        ),
        milestoneCollectionLessonsPerformance: performanceService.getLessonsPerformanceByMilestoneId(
          classId,
          courseId,
          milestoneId,
          CONTENT_TYPES.COLLECTION,
          userUid,
          fwCode
        )
      }).then(
        ({
          milestoneAssessmentLessonsPerformance,
          milestoneCollectionLessonsPerformance
        }) => {
          if (!component.isDestroyed) {
            component.setMilestoneLessonPerformanceData(
              CONTENT_TYPES.COLLECTION,
              lessons,
              milestoneCollectionLessonsPerformance
            );
            component.setMilestoneLessonPerformanceData(
              CONTENT_TYPES.ASSESSMENT,
              lessons,
              milestoneAssessmentLessonsPerformance
            );
            if (component.get('isPathRouteView')) {
              const routeContents = lessons.filter(
                lesson => lesson.routeContents && lesson.routeContents.length
              );
              routeContents.forEach(suggestion => {
                component.setMilestoneLessonPerformanceData(
                  CONTENT_TYPES.COLLECTION,
                  suggestion.routeContents,
                  milestoneCollectionLessonsPerformance
                );
                component.setMilestoneLessonPerformanceData(
                  CONTENT_TYPES.ASSESSMENT,
                  suggestion.routeContents,
                  milestoneAssessmentLessonsPerformance
                );
              });
            }
          }
        }
      );
    },

    /**
     * @function fetchStudentCompetencySummary
     * Method to fetch student competency summary
     */
    fetchStudentCompetencySummary() {
      const component = this;
      const userId = component.get('userId');
      const classId = component.get('classId');
      const subjectCode = component.get('subjectCode');
      if (subjectCode && classId) {
        const classIds = [
          {
            classId,
            subjectCode
          }
        ];
        return component
          .get('competencyService')
          .getCompetencyCompletionStats(classIds, userId);
      }
    },

    setMilestoneLessonPerformanceData(
      type,
      lessons,
      milestoneLessonsPerformance
    ) {
      milestoneLessonsPerformance.forEach(milestoneLessonPerformance => {
        let lessonId = milestoneLessonPerformance.get('lessonId');
        let lesson = lessons.findBy('lesson_id', lessonId);
        if (lesson) {
          lesson.set(
            'performance',
            milestoneLessonPerformance.get('performance')
          );
          lesson.set('isAssessment', true);
          lesson.set('has-activity', true);
          if (type === CONTENT_TYPES.ASSESSMENT) {
            lesson.set('isAssessment', false);
          }
        }
      });
    },

    fetchCollectionPerformance(lesson, collections) {
      let component = this;
      let userUid = component.get('userId');
      let classId = component.get('classId');
      let courseId = component.get('courseId');
      let unitId = lesson.get('unit_id');
      let lessonId = lesson.get('lesson_id');
      let performanceService = component.get('performanceService');

      Ember.RSVP.hash({
        performanceAssessment: performanceService.getCollectionsPerformanceByLessonId(
          classId,
          courseId,
          unitId,
          lessonId,
          CONTENT_TYPES.ASSESSMENT,
          userUid
        ),
        performanceCollection: performanceService.getCollectionsPerformanceByLessonId(
          classId,
          courseId,
          unitId,
          lessonId,
          CONTENT_TYPES.COLLECTION,
          userUid
        )
      }).then(({ performanceAssessment, performanceCollection }) => {
        component.setMilestoneCollectionPerformanceData(
          CONTENT_TYPES.ASSESSMENT,
          collections,
          performanceAssessment
        );
        component.setMilestoneCollectionPerformanceData(
          CONTENT_TYPES.COLLECTION,
          collections,
          performanceCollection
        );
        if (component.get('isPathRouteView') && lesson.routeContents) {
          const signatureCollections = lesson.routeContents.filter(
            item => item.format
          );
          component.setMilestoneCollectionPerformanceData(
            CONTENT_TYPES.ASSESSMENT,
            signatureCollections,
            performanceAssessment
          );
          component.setMilestoneCollectionPerformanceData(
            CONTENT_TYPES.COLLECTION,
            signatureCollections,
            performanceCollection
          );
        }
        component.set('isLessonLoading', false);
      });
    },

    setMilestoneCollectionPerformanceData(
      type,
      collections,
      lessonCollectionsPerformance
    ) {
      lessonCollectionsPerformance.forEach(lessonCollectionPerformance => {
        let collectionId = lessonCollectionPerformance.get('collectionId');
        let collection = collections.findBy('id', collectionId);
        if (collection) {
          if (type === CONTENT_TYPES.COLLECTION) {
            if (collection.get('format') === CONTENT_TYPES.COLLECTION) {
              collection.set(
                'performance',
                lessonCollectionPerformance.get('performance')
              );
            }
          } else {
            collection.set(
              'performance',
              lessonCollectionPerformance.get('performance')
            );
          }
          collection.set('has-activity', true);
        }
      });
    },

    handleMilestoneToggle(selectedMilestone) {
      let component = this;
      let milestoneId = selectedMilestone.get('milestone_id');
      component.set('selectedMilestone', selectedMilestone);
      component.$('.milestone-course-map-lesson-container').slideUp(400);
      let element = `#milestone-${milestoneId}`;
      let courseId = component.get('courseId');
      let classId = component.get('classId');
      const isTeacher = component.get('isTeacher');
      const studentId = component.get('studentId');
      const userId = isTeacher ? studentId : component.get('usersId');
      let nextMilestone = component
        .get('milestones')
        .objectAt(selectedMilestone.get('milestoneIndex'));
      let showPerformance = component.get('showPerformance');
      let locateLastPlayedItem = component.get('locateLastPlayedItem');
      if (selectedMilestone.get('isActive')) {
        component.$(element).slideUp(400, function() {
          selectedMilestone.set('isActive', false);
          if (nextMilestone) {
            nextMilestone.set('prevMilestoneIsActive', false);
          }
        });
      } else {
        component.$(element).slideDown(400, function() {
          component.get('milestones').forEach(milestone => {
            milestone.set('prevMilestoneIsActive', false);
            if (milestone.get('isActive')) {
              let milestoneId = milestone.get('milestone_id');
              let element = `#milestone-${milestoneId}`;
              component.$(element).hide();
              milestone.set('isActive', false);
            }
          });
          selectedMilestone.set('isActive', true);
          if (nextMilestone) {
            nextMilestone.set('prevMilestoneIsActive', true);
          }
          let rescopedLessonContents = component.get(
            'rescopedContents.lessons'
          );
          if (!selectedMilestone.get('hasLessonFetched')) {
            let lessonPromise;
            if (selectedMilestone.isRoute0 || selectedMilestone.isUnit0) {
              lessonPromise = Ember.RSVP.resolve(selectedMilestone.lessons);
            } else {
              lessonPromise = component
                .get('courseService')
                .getCourseMilestoneLessons(courseId, milestoneId);
            }
            const pathParams = {
              classId,
              userId
            };
            Ember.RSVP.hash({
              lessons: lessonPromise,
              diagnosticLessons: component
                .get('courseMapService')
                .fetchMilestoneAlternatePath(milestoneId, pathParams),
              dependentPaths: component
                .get('courseMapService')
                .fetchMilestoneDependentPath(milestoneId, pathParams)
            }).then(({ lessons, diagnosticLessons, dependentPaths }) => {
              if (!component.isDestroyed && lessons) {
                component.set('diagnosticLessons', diagnosticLessons);
                component.set('dependentPaths', dependentPaths);
                if (rescopedLessonContents && !selectedMilestone.isUnit0) {
                  rescopedLessonContents.forEach(rescopedLessonId => {
                    let lesson = lessons.findBy('lesson_id', rescopedLessonId);
                    if (lesson) {
                      lesson.set('rescope', true);
                    }
                  });
                }
                component.parseDiagnosticLessons(diagnosticLessons, lessons);
                component.parseDependentLessons(dependentPaths, lessons);
                if (
                  component.get('isStudentDashboard') &&
                  !component.get('isDiagnosticEnd')
                ) {
                  lessons = lessons.filter(lesson => !lesson.get('rescope'));

                  if (!component.get('userCurrentLocation.lessonId')) {
                    if (lessons.length) {
                      const defaultLesson = lessons.get('firstObject');
                      component.set(
                        'userCurrentLocation.lessonId',
                        defaultLesson.lesson_id
                      );
                    }
                  }
                  let currentLessonIndex = lessons.findIndex(
                    lessonItem =>
                      lessonItem.lesson_id ===
                      component.get('userCurrentLocation.lessonId')
                  );
                  let previousLesson = lessons[currentLessonIndex - 1] || null;
                  let nextLesson = lessons[currentLessonIndex + 1] || null;
                  lessons = lessons.filterBy(
                    'lesson_id',
                    component.get('userCurrentLocation.lessonId')
                  );
                  if (previousLesson) {
                    previousLesson.set('isDisabled', true);
                    lessons = Ember.A([previousLesson, ...lessons]);
                  }
                  if (nextLesson) {
                    nextLesson.set('isDisabled', true);
                    lessons = Ember.A([...lessons, nextLesson]);
                  }
                }
                const isPathRouteView = component.get('isPathRouteView');
                if (component.get('isDiagnosticEnd')) {
                  if (!isPathRouteView) {
                    lessons = lessons.filter(
                      item => item.isDiagnosticLesson || item.isDiagnostic
                    );
                  } else {
                    const routeContents = lessons.filter(
                      item => item.routeContents
                    );
                    lessons = [...routeContents]
                      .map(item => item.routeContents)
                      .flat(1);
                  }
                }
                let collectionComp = lessons
                  .mapBy('gutCodes')
                  .flat(1)
                  .filter(item => item);
                if (collectionComp.length) {
                  let userId = component.get('userId');
                  let classId = component.get('classId');
                  const subjectCode = component.get('subjectCode');
                  let param = {
                    data: {
                      competencyCodes: new Set([...collectionComp]),
                      subject: subjectCode,
                      userId,
                      classId
                    }
                  };
                  component
                    .get('competencyService')
                    .fetchCompetency(param)
                    .then(statusList => {
                      lessons.forEach(item => {
                        let statusCode = statusList.filter(
                          lessonItem =>
                            item.gutCodes &&
                            item.gutCodes.indexOf(lessonItem.competencyCode) !==
                              -1
                        );
                        let lowestStatus = '';
                        if (statusCode.length) {
                          let total = statusCode.length;
                          let completed = statusCode.filter(
                            item => item.status > 1
                          ).length;
                          let notstaterd = statusCode.filter(
                            item => !item.status
                          ).length;
                          lowestStatus =
                            total === completed
                              ? 4
                              : notstaterd === total
                                ? 0
                                : 1;
                        }

                        item.set('status', lowestStatus);
                      });
                    });
                }
                let lessonsSize = lessons.length;
                let lessonsRescopeSize = lessons.filterBy('rescope', true)
                  .length;
                if (lessonsRescopeSize === lessonsSize) {
                  selectedMilestone.set('rescope', true);
                }
                lessons.filter(lessonData => {
                  component.setVisibility(lessonData, 'lesson');
                });
                selectedMilestone.set('lessons', lessons);
                if (showPerformance) {
                  component.fetchMilestoneLessonsPerformance(
                    milestoneId,
                    lessons
                  );
                }
                selectedMilestone.set('hasLessonFetched', true);
                component.handleMileStonePath();
                let userCurrentLocation = component.get('userCurrentLocation');
                if (locateLastPlayedItem && userCurrentLocation) {
                  let lessonId = userCurrentLocation.get('lessonId');
                  let selectedLesson = lessons.findBy('lesson_id', lessonId);
                  let lessonIndex = lessons.indexOf(selectedLesson);
                  if (selectedLesson) {
                    Ember.run.later(function() {
                      component.handleMilestoneLessonToggle(
                        selectedMilestone,
                        lessons,
                        selectedLesson,
                        lessonIndex
                      );
                    }, 500);
                  }
                }
              }
            });
          }
        });
      }
    },

    handleMileStonePath() {
      const component = this;
      let selectedMilestone = component.get('selectedMilestone');
      if (selectedMilestone) {
        let milestones = component.get('milestones');
        let nextMilestone = milestones.objectAt(
          selectedMilestone.get('milestoneIndex')
        );
        let lessons = selectedMilestone.get('lessons');
        if (lessons) {
          const nonRescopedLessons = lessons.filter(lesson => {
            if (!lesson.get('rescope')) {
              return lesson;
            }
          });
          let showMilestoneLessons =
            !nonRescopedLessons.length > 0 &&
            !component.get('showAllRescopedContent');
          if (nextMilestone) {
            nextMilestone.set('prevMileStoneShowLessons', showMilestoneLessons);
          }
          selectedMilestone.set('showLessons', showMilestoneLessons);
        }
      }
    },

    handleLastLessonPath() {
      const component = this;
      let lessonIndex;
      let lessonSize;
      let lastLesson;
      let selectedLesson = component.get('selectedLesson');
      let milestone = component.get('selectedMilestone');
      if (milestone && selectedLesson) {
        let lessons = milestone.get('lessons');
        let collections = selectedLesson.get('collections');
        let nextMilestone = component
          .get('milestones')
          .objectAt(milestone.get('milestoneIndex'));
        const nonRescopedLessons = lessons.filter(lesson => {
          if (!lesson.get('rescope')) {
            return lesson;
          }
        });
        if (component.get('showAllRescopedContent')) {
          lessonIndex = lessons.indexOf(selectedLesson);
          lessonSize = lessons.length;
          lastLesson = lessons.objectAt(lessonIndex);
        } else {
          lessonIndex = nonRescopedLessons.indexOf(selectedLesson);
          lessonSize = nonRescopedLessons.length;
          lastLesson = nonRescopedLessons.objectAt(lessonIndex);
        }
        const isLastLesson = lessonIndex === lessonSize - 1;
        if (isLastLesson && lastLesson) {
          const isLastLessonActive = isLastLesson && lastLesson.get('isActive');
          if (nextMilestone) {
            nextMilestone.set(
              'prevMilestoneOfLastLessonIsActive',
              isLastLessonActive
            );
          }
          if (isLastLessonActive) {
            let lastCollection = collections.objectAt(collections.length - 1);
            if (nextMilestone) {
              nextMilestone.set(
                'prevMilestoneOfLastCollectionPath',
                lastCollection.get('pathType')
              );
            }
          }
        }
      }
    },
    route0CollectionSummary(collections, route0QueryParams, userId) {
      const component = this;
      let collectionIds = collections.mapBy('id');
      let collectionParam = {
        collectionIds
      };
      return Ember.RSVP.hash({
        collectionSummary: component
          .get('collectionService')
          .fetchCollectionSummary(collectionParam),
        alternatePaths: component
          .get('route0Service')
          .fetchAlternatePaths(route0QueryParams, userId)
      }).then(({ collectionSummary, alternatePaths }) => {
        collections.forEach(collection => {
          let currentCollection = collectionSummary.findBy('id', collection.id);
          if (currentCollection && !collection.get('isSuggestedContent')) {
            collection.setProperties({
              gutCode: currentCollection.gutCode,
              resourceCount: currentCollection.resourceCount,
              questionCount: currentCollection.questionCount,
              learningObjective: currentCollection.learningObjective,
              ctxPathType: PATH_TYPE.ROUTE0,
              ctxPathId: collection.pathId,
              pathType: PATH_TYPE.ROUTE0
            });
          }
        });
        let collectionSequence = collections.length + 1;
        alternatePaths.map(alternatePath => {
          let ctxCollectionIndex = collections.findIndex(
            child => child.id === alternatePath.assessmentId
          );
          const isCollectionExists = collections.findBy('id', alternatePath.id);
          if (ctxCollectionIndex >= 0 && !isCollectionExists) {
            alternatePath.set('collectionSequence', collectionSequence++);
            //Add suggested content, next to the context collection
            collections.splice(ctxCollectionIndex + 1, 0, alternatePath);
          }
        });
        return collections;
      });
    },
    handleMilestoneLessonToggle(
      milestone,
      lessons,
      selectedLesson,
      lessonIndex
    ) {
      let component = this;
      let classId = component.get('classId');
      let unitId = selectedLesson.get('unit_id');
      let lessonId = selectedLesson.get('lesson_id');
      let milestoneId = milestone.get('milestone_id');
      let element = `#milestone-lesson-${milestoneId}-${lessonId}-${lessonIndex}`;
      let showPerformance = component.get('showPerformance');
      let locateLastPlayedItem = component.get('locateLastPlayedItem');
      let courseId = component.get('courseId');
      component.set('selectedLesson', selectedLesson);
      let selectedLessonIndex = lessons.indexOf(selectedLesson);
      let prevLesson = lessons.objectAt(selectedLessonIndex + 1);
      let nextLesson = lessons.objectAt(selectedLessonIndex - 1);
      let componentEle = component.$(element);
      component.set('isShowLessonPlan', false);
      if (selectedLesson.get('isActive')) {
        if (componentEle) {
          componentEle.slideUp(400, function() {
            selectedLesson.set('isActive', false);
            if (nextLesson) {
              nextLesson.set('isNextActive', false);
            }
            if (prevLesson) {
              prevLesson.set('isPrevActive', false);
            }
          });
        }
      } else {
        if (componentEle) {
          componentEle.slideDown(400, function() {
            selectedLesson.set('isActive', true);
            if (nextLesson) {
              nextLesson.set('isNextActive', true);
            }
            if (prevLesson) {
              prevLesson.set('isPrevActive', true);
            }
          });
        }
      }

      if (!selectedLesson.get('hasCollectionFetched')) {
        let collectionPromise;
        let userId = component.get('isTeacher')
          ? component.get('userId')
          : undefined;
        if (milestone.isRoute0) {
          collectionPromise = Ember.RSVP.resolve(selectedLesson);
        } else if (selectedLesson.collections) {
          collectionPromise = Ember.RSVP.resolve(selectedLesson);
        } else {
          collectionPromise = component
            .get('courseMapService')
            .getLessonInfo(classId, courseId, unitId, lessonId, true, userId);
        }
        collectionPromise.then(lesson => {
          if (
            component.get('isPathRouteView') &&
            lesson.routeContents &&
            lesson.routeContents.length
          ) {
            selectedLesson.set('routeContents', [
              ...lesson.routeContents,
              ...(selectedLesson.routeContents || [])
            ]);
          }
          selectedLesson.set('taxonomy', lesson.taxonomy);
          if (!component.isDestroyed) {
            let collections =
              lesson.get('children') || lesson.get('collections');
            let userId = component.get('userId');
            let collectionIds = collections.mapBy('id');
            let lessonParam = {
              userId,
              collectionIds
            };
            let route0QueryParams = {
              classId,
              courseId,
              unitId,
              lessonId
            };
            const route0UserId = component.get('isTeacher')
              ? component.get('userId')
              : undefined;
            let route0Promise = milestone.isRoute0
              ? component.route0CollectionSummary(
                collections,
                route0QueryParams,
                route0UserId
              )
              : Ember.RSVP.resolve([]);
            route0Promise.then(() => {
              collections = collections.sortBy('collectionSequence');
              let collectionComp = collections
                .mapBy('gutCode')
                .flat(1)
                .filter(item => item);
              if (collectionComp.length) {
                let classId = component.get('classId');
                const subjectCode = component.get('subjectCode');
                let param = {
                  data: {
                    competencyCodes: new Set([...collectionComp]),
                    subject: subjectCode,
                    userId,
                    classId
                  }
                };
                Ember.RSVP.hash({
                  competencyState: component
                    .get('competencyService')
                    .fetchCompetency(param),
                  lessonState: component
                    .get('lessonService')
                    .itemLesson(lessonParam)
                }).then(({ competencyState, lessonState }) => {
                  component.set('lessonState', lessonState);
                  collections.forEach(item => {
                    let activeCollection = competencyState.filter(
                      colItem =>
                        item.gutCode &&
                        item.gutCode.indexOf(colItem.competencyCode) !== -1
                    );
                    let lowestStatus = '';
                    if (activeCollection.length && lessonState[item.id]) {
                      let total = activeCollection.length;
                      let completed = activeCollection.filter(
                        item => item.status > 1
                      ).length;
                      let notstaterd = activeCollection.filter(
                        item => !item.status
                      ).length;
                      lowestStatus =
                        total === completed ? 4 : notstaterd === total ? 0 : 1;
                    }

                    item.set('status', lowestStatus);
                  });
                });
              }

              let rescopeCollectionIds = component.getRescopeCollectionIds();
              rescopeCollectionIds.forEach(rescopeCollectionId => {
                let collection = collections.findBy('id', rescopeCollectionId);
                if (collection) {
                  collection.set('rescope', true);
                }
              });
              component.updateSuggestionDetails(
                lessons,
                selectedLesson,
                collections
              );
              collections.forEach(collection =>
                component.setVisibility(collection, collection.format)
              );
              selectedLesson.set('collections', collections);
              selectedLesson.set('hasCollectionFetched', true);
              let userCurrentLocation = component.get('userCurrentLocation');
              const isStudentDashboard = component.get('isStudentDashboard');
              if (locateLastPlayedItem && userCurrentLocation) {
                if (
                  isStudentDashboard &&
                  !userCurrentLocation.get('collectionId')
                ) {
                  userCurrentLocation.set(
                    'collectionId',
                    collections.get('firstObject.id')
                  );
                }
                let collectionId = userCurrentLocation.get('collectionId');
                let selectedCollection = collections.findBy('id', collectionId);
                if (selectedCollection) {
                  selectedCollection.set('last-played-collection', true);
                  selectedCollection.set('has-activity', true);
                }
              }
              Ember.run.later(function() {
                component.handleLastLessonPath();
              }, 500);
              if (showPerformance) {
                component.fetchCollectionPerformance(
                  selectedLesson,
                  collections
                );
              }
            });
          }
        });
      } else {
        Ember.run.later(function() {
          component.handleLastLessonPath();
        }, 500);
      }
    },

    setVisibility: function(collection, type = false) {
      const id = type === 'lesson' ? collection.lesson_id : collection.id;
      if (
        this.get('contentVisibility') &&
        this.get('contentVisibility.course') &&
        this.get('contentVisibility.course.units')
      ) {
        this.get('contentVisibility.course.units').filter(unit => {
          if (unit.lessons) {
            unit.lessons.filter(lesson => {
              if (lesson.id === id) {
                const visible = lesson.visible === 'on';
                collection.set('visible', visible);
              }
              const content =
                type === 'collection' ? lesson.collections : lesson.assessments;
              if (content) {
                content.filter(assessment => {
                  if (assessment.id === collection.id) {
                    const visible = assessment.visible === 'on';
                    collection.set('visible', visible);
                  }
                });
              }
            });
          }
        });
      }
    },

    updateSuggestionDetails(lessons, selectedLesson, collections) {
      let collectionSuggestions = collections.filter(collection => {
        let pathType = collection.get('pathType');
        return pathType === 'system' || pathType === 'teacher';
      });
      if (collectionSuggestions.length > 0) {
        collectionSuggestions.forEach(collectionSuggestion => {
          let indexOfCollection = collections.indexOf(collectionSuggestion);
          if (indexOfCollection === 0) {
            selectedLesson.set(
              'firstCollHasSuggsType',
              collectionSuggestion.get('pathType')
            );
          }
          if (collections.length === indexOfCollection + 1) {
            let selectedLessonIndex = lessons.indexOf(selectedLesson);
            let nextLesson = lessons.objectAt(selectedLessonIndex + 1);
            if (nextLesson) {
              nextLesson.set(
                'prevLeCollHasSuggsType',
                collectionSuggestion.get('pathType')
              );
            }
          }
          let prevCollection = collections.objectAt(indexOfCollection - 1);
          if (prevCollection) {
            if (prevCollection.get('pathId') > 0) {
              collectionSuggestion.set(
                'prevCollHasSuggsType',
                prevCollection.get('pathType')
              );
            }
            prevCollection.set(
              'nextCollHasSuggsType',
              collectionSuggestion.get('pathType')
            );
          }
          let nextCollection = collections.objectAt(indexOfCollection + 1);
          if (nextCollection) {
            if (nextCollection.get('pathId') > 0) {
              collectionSuggestion.set(
                'nextCollHasSuggsType',
                nextCollection.get('pathType')
              );
            }
            nextCollection.set(
              'prevCollHasSuggsType',
              collectionSuggestion.get('pathType')
            );
          }
        });
      }
    },

    identifyUserLocationAndLocate() {
      let component = this;
      let classId = component.get('classId');
      let courseId = component.get('courseId');
      let userId = component.get('userId');
      let fwCode = component.get('fwCode');
      let locationQueryParam = {
        courseId,
        fwCode
      };
      let currentLocationPromise;
      const currentLocation = component.get('currentLocation');
      if (currentLocation) {
        currentLocationPromise = Ember.RSVP.resolve(currentLocation);
      } else {
        currentLocationPromise = component
          .get('analyticsService')
          .getUserCurrentLocation(classId, userId, locationQueryParam);
      }
      currentLocationPromise.then(userCurrentLocation => {
        if (!component.isDestroyed) {
          component.set('userCurrentLocation', userCurrentLocation);
          if (userCurrentLocation) {
            let milestoneId = userCurrentLocation.get('milestoneId');
            let selectedMilestone =
              userCurrentLocation.pathType === 'route0'
                ? component.findMilestoneByUnitId(
                  userCurrentLocation.unitId,
                  userCurrentLocation.lessonId
                )
                : component
                  .get('milestones')
                  .findBy('milestone_id', milestoneId);
            if (selectedMilestone) {
              Ember.run.later(function() {
                component.handleMilestoneToggle(selectedMilestone);
              }, 500);
            }
          }
        }
      });
    },

    findMilestoneByUnitId(unitId, lessonId) {
      const component = this;
      const milestones = component.get('milestones');
      return milestones.find(milestone => {
        const lesson = milestone.lessons.find(lessonItem => {
          return (
            lessonItem.unit_id === unitId && lessonItem.lesson_id === lessonId
          );
        });
        return lesson !== null;
      });
    },

    /**
     * Enables jumping to a specific milestone driven location
     * Location is provided with queryString paramter Location
     */
    navigateLocation() {
      const component = this;
      let rawCustomLocation = this.get('location');
      if (
        rawCustomLocation &&
        rawCustomLocation !== 'null' &&
        !component.isDestroyed
      ) {
        let customLocation = component.parserLocation(rawCustomLocation),
          userLocation = component.formatCustomLocationToUserLocation(
            customLocation
          );
        component.set('userCurrentLocation', userLocation);
        component.set('locateLastPlayedItem', userLocation);

        let selectedMilestone = component
          .get('milestones')
          .findBy('milestone_id', userLocation.milestoneId);

        //ToDo: Refactoring required to remove the Later based workaround, here as well as in other implementation
        Ember.run.later(function() {
          if (selectedMilestone) {
            component.handleMilestoneToggle(selectedMilestone);
            Ember.run.later(function() {
              Ember.run.later(function() {
                let lessonO = selectedMilestone.lessons.findBy(
                    'lesson_id',
                    userLocation.lessonId
                  ),
                  collectionO = lessonO.collections.findBy(
                    'id',
                    userLocation.collectionId
                  );
                component.send(
                  'onShowStudentMilestoneCollectionReport',
                  lessonO,
                  collectionO
                );
                if (!component.isDestroyed) {
                  component.send(
                    'onShowStudentMilestoneCollectionReport',
                    lessonO,
                    collectionO
                  );
                  component.set('location', 'null');
                }
              }, 8000);
            }, 500);
          }
        });
      }
    },

    /**
     *
     * @param {object} customLocation
     */
    formatCustomLocationToUserLocation(customLocation) {
      //ToDo: Check if this is needed and reformat
      let serializedLocation = this.currentLocationSerializer.normalizeCurrentLocation(
        customLocation
      );
      serializedLocation.milestone_id = serializedLocation.milestoneId;
      return serializedLocation;
    },

    /**
     *
     * @param {string} customLocation : format 'unitId+lessonId+collectionId+milestoneId+currentItemType',
     */
    parserLocation(customLocation) {
      let locationArr = customLocation.split('+');
      return {
        unitId: locationArr[0],
        lessonId: locationArr[1],
        collectionId: locationArr[2],
        milestoneId: locationArr[3],
        type: locationArr[4]
      };
    },

    /**
     * This Method is responsible for milestone display based on students class grade.
     * @return {Array}
     */
    renderMilestonesBasedOnStudentGradeRange(
      grades,
      milestones,
      milestoneHasContent,
      route0Milestones
    ) {
      let component = this;
      let gradeBounds = component.get('class.memberGradeBounds');
      let userUid = component.get('userId');
      let gradeBound = gradeBounds.findBy(userUid);
      let milestoneData = Ember.A([]);
      let studentGradeBound = Ember.Object.create(gradeBound.get(userUid));
      let classGradeId = component.get('class.gradeCurrent');
      let isPublic = component.get('isPublic');
      component.set('studentGradeBound', studentGradeBound);
      component.set('grades', grades);
      let classGradeLowerBound = studentGradeBound.get('grade_lower_bound');
      let gradeUpperBound = studentGradeBound.get('grade_upper_bound');
      let startGrade = grades.findBy('id', classGradeLowerBound);
      let startGradeIndex = grades.indexOf(startGrade);
      let endGrade = grades.findBy('id', gradeUpperBound);
      let endGradeIndex = grades.indexOf(endGrade);
      let studentGrades = grades.slice(startGradeIndex, endGradeIndex + 1);
      milestones.forEach((milestone, index) => {
        let gradeId = milestone.get('grade_id');
        milestone.set('hasLessonFetched', false);
        milestone.set('prevMilestoneIsActive', false);
        milestone.set('isActive', false);
        milestone.set('prevMilestoneRescope', false);
        const milestoneId = milestone.get('milestone_id');
        const hasMilestoneContent = milestoneHasContent.findBy(
          'milestone_id',
          milestoneId
        );
        if (!hasMilestoneContent && !milestone.isRoute0) {
          milestone.set('rescope', true);
        } else {
          milestone.set('rescope', false);
        }
        if (index < milestones.length - 1 && milestone.get('rescope')) {
          let nextMilestone = milestones.objectAt(index + 1);
          if (nextMilestone) {
            nextMilestone.set('prevMilestoneIsRescope', true);
          }
        }
        let grade = studentGrades.findBy('id', gradeId);
        if (grade) {
          if (gradeId === classGradeId && !isPublic) {
            milestone.set('isClassGrade', true);
          }
          let milestoneIndex = this.get('totalRoute0Milestones') + index + 1;
          milestone.set('milestoneIndex', milestoneIndex);
          milestoneData.pushObject(milestone);
        }
      });
      return component.addRoute0InMilestones(milestoneData, route0Milestones);
    },

    /**
     * Merge all  the collection content family, rescoped ids
     * @type {Array}
     */
    getRescopeCollectionIds() {
      let component = this;
      let collectionIds = Ember.A([]);
      let rescopedContents = component.get('rescopedContents');
      if (rescopedContents && !Object.keys(rescopedContents).length === 0) {
        let rescopedCollectionContents = rescopedContents.get('collections');
        let rescopedCollectionsExternalContents = rescopedContents.get(
          'collectionsExternal'
        );
        let rescopedAssessmentsExternalContents = rescopedContents.get(
          'assessmentsExternal'
        );
        let rescopedAssessmentsContents = rescopedContents.get('assessments');
        let rescopedOfflineActivityContents = rescopedContents.get(
          'offlineActivities'
        );
        collectionIds.pushObjects(rescopedCollectionContents);
        collectionIds.pushObjects(rescopedAssessmentsContents);
        collectionIds.pushObjects(rescopedCollectionsExternalContents);
        collectionIds.pushObjects(rescopedAssessmentsExternalContents);
        collectionIds.pushObjects(rescopedOfflineActivityContents);
      }
      return collectionIds;
    },

    /**
     * @function getRescopedContents
     * Method to get rescoped contents
     */
    getRescopedContents() {
      let component = this;
      let rescopedContents = component.get('rescopedContents');
      if (rescopedContents) {
        return Ember.RSVP.resolve(rescopedContents);
      } else {
        let classId = component.get('classId');
        let courseId = component.get('courseId');
        let filter = {
          classId,
          courseId
        };
        let studentId = component.get('userId');
        let isTeacher = component.get('isTeacher');
        if (isTeacher) {
          filter.userId = studentId;
        }
        return Ember.RSVP.hash({
          rescopedContents: component
            .get('rescopeService')
            .getSkippedContents(filter)
        })
          .then(rescopedContents => {
            return rescopedContents.rescopedContents;
          })
          .catch(function() {
            return null;
          });
      }
    },

    /**
     * Navigates to collection
     * @param {string} classId
     * @param {string} courseId
     * @param {string} unitId
     * @param {string} lessonId
     * @param {Collection} collection
     * @param {string} milestoneId
     */
    startCollectionStudyPlayer: function(
      classId,
      courseId,
      unitId,
      lessonId,
      collection,
      milestoneId
    ) {
      let component = this;
      let role = ROLES.STUDENT;
      let source = PLAYER_EVENT_SOURCE.COURSE_MAP;
      let collectionId = collection.get('id');
      let collectionType =
        collection.get('collectionType') || collection.get('format');
      let collectionSubType = collection.get('collectionSubType');
      let minScore = collection.get('minScore');
      let pathId = collection.get('pathId') || 0;
      let pathType = collection.get('pathType') || null;
      let ctxPathId = collection.get('ctxPathId') || 0;
      let ctxPathType = collection.get('ctxPathType') || null;
      let userLocation = component.get('userCurrentLocation');
      let isCompletedLocation =
        userLocation &&
        userLocation.status === 'complete' &&
        userLocation.collectionId === collectionId;
      let queryParams = {
        classId,
        milestoneId,
        unitId,
        lessonId,
        collectionId,
        role,
        source,
        type: collectionType,
        subtype: collectionSubType,
        pathId,
        minScore,
        collectionSource: collection.source || 'course_map',
        isStudyPlayer: true,
        pathType,
        isIframeMode: true,
        ctxPathId,
        ctxPathType
      };
      let diagnosticData = null;
      if (collection && collection.lessonStats) {
        diagnosticData = {
          session_id: collection.lessonStats.session_id,
          starting_grade: collection.lessonContext.gradeId,
          starting_domain: collection.lessonContext.domainCode
        };
      }

      if (isCompletedLocation) {
        queryParams.courseId = courseId;
        component.passSourceDetailsNoteTool(queryParams);
        component
          .loadReportView(queryParams, collection)
          .then(contextParams => {
            const userId = component.get('session.userId');
            component
              .get('quizzesAttemptService')
              .getAttemptIds(contextParams.contextId, userId)
              .then(attemptIds => {
                if (attemptIds && attemptIds.length) {
                  component.set(
                    'playerUrl',
                    component
                      .get('router')
                      .generate('reports.study-student-collection', {
                        queryParams: contextParams
                      })
                  );
                  component.set('isOpenPlayer', true);
                  component.set('playerContent', collection);
                } else {
                  component.studyPlayerContent(
                    collectionSubType,
                    courseId,
                    unitId,
                    lessonId,
                    collectionId,
                    collectionType,
                    pathId,
                    classId,
                    pathType,
                    milestoneId,
                    ctxPathId,
                    ctxPathType,
                    queryParams,
                    collection,
                    diagnosticData
                  );
                }
              });
          });
      } else {
        // Verifies if it is a suggested Collection/Assessment
        const params = {
          classId,
          courseId,
          unitId,
          lessonId,
          collectionId
        };
        component.passSourceDetailsNoteTool(params);
        component.studyPlayerContent(
          collectionSubType,
          courseId,
          unitId,
          lessonId,
          collectionId,
          collectionType,
          pathId,
          classId,
          pathType,
          milestoneId,
          ctxPathId,
          ctxPathType,
          queryParams,
          collection,
          diagnosticData
        );
      }
    },
    studyPlayerContent(
      collectionSubType,
      courseId,
      unitId,
      lessonId,
      collectionId,
      collectionType,
      pathId,
      classId,
      pathType,
      milestoneId,
      ctxPathId,
      ctxPathType,
      queryParams,
      collection,
      diagnosticData = null
    ) {
      let component = this;
      let suggestionPromise = null;

      let state = 'start';
      const source = collection.dependentSource || null;
      if (collectionSubType) {
        suggestionPromise = component
          .get('navigateMapService')
          .startSuggestion(
            courseId,
            unitId,
            lessonId,
            collectionId,
            collectionType,
            collectionSubType,
            pathId,
            classId,
            pathType,
            milestoneId,
            ctxPathId,
            ctxPathType,
            diagnosticData,
            state,
            source
          );
      } else {
        if (diagnosticData) {
          state = DIAGNOSTIC_LESSON_SUGGESTION_EVENTS.start;
        } else if (collection.isSuggested) {
          state = DEPENDENT_LESSON_SUGGESTION_EVENTS.start;
        }
        suggestionPromise = component
          .get('navigateMapService')
          .startCollection(
            courseId,
            unitId,
            lessonId,
            collectionId,
            collectionType,
            classId,
            pathId,
            pathType,
            milestoneId,
            ctxPathId,
            ctxPathType,
            diagnosticData,
            state
          );
      }
      suggestionPromise.then(function(mapLocation) {
        if (
          mapLocation &&
          mapLocation.get('context.itemSubType') === 'diagnostic'
        ) {
          let diagnosticContext = mapLocation.context;
          collection.setProperties({
            format: 'assessment',
            title: diagnosticContext.diagnostic.starting_domain_name
          });
        }
        component.set(
          'playerUrl',
          component.get('router').generate('study-player', courseId, {
            queryParams
          })
        );
        component.set('isOpenPlayer', true);
        component.set('playerContent', collection);
      });
    },

    drawExpandedPath(collection, lesson, milestone) {
      let component = this;
      let milestones = component.get('milestones');
      let isClose = collection.get('isClose');
      let isRescope = component.get('showAllRescopedContent');
      let activeMilestoneIndex = milestones.indexOf(milestone);
      let activeLessonIndex = milestone.get('lessons').indexOf(lesson);
      let activeCollectionIndex = lesson.get('collections').indexOf(collection);
      let nextIndex = (item, index, activeIndex) => {
        return (
          activeIndex < index &&
          ((!item.rescope && !isRescope) || (isRescope && item))
        );
      };
      let nextColIndex = lesson
        .get('collections')
        .findIndex((item, index) =>
          nextIndex(item, index, activeCollectionIndex)
        );
      let nextLesson = milestone
        .get('lessons')
        .findIndex((item, index) => nextIndex(item, index, activeLessonIndex));
      let nextMilestone = milestones.findIndex((item, index) =>
        nextIndex(item, index, activeMilestoneIndex)
      );
      let pathLeft = 'M 15 0  t -8 17 5 60';
      let pathRight = 'M 2 0 t 8 17 -5 60';
      let svgHeight = 50;
      let svg = '';
      if (lesson.collections[nextColIndex]) {
        let nextObject = lesson.collections.get(nextColIndex);
        nextObject.set('prevExpanded', isClose);
        svg = component.$(`.col-head-sec-${nextObject.id} svg`);
      } else if (milestone.lessons[nextLesson]) {
        let nextObject = milestone.lessons.get(nextLesson);
        nextObject.set('prevExpanded', isClose);
        svg = component.$(`.lesson-head-sec-${nextObject.lesson_id} svg`);
      } else if (milestones[nextMilestone]) {
        let nextObject = milestones.get(nextMilestone);
        nextObject.set('prevExpanded', isClose);
        svg = component.$(`.milestone-head-sec-${nextMilestone} svg`);
      }
      Ember.run.later(
        function() {
          let contentSection = component.$(
            `.col-group-${collection.id} .attempt-head`
          );
          let extendedHeight = contentSection.height() + 60;
          let expandedLeft = `M 15 0  t -6 17 -5 32 v${extendedHeight - 40}`;
          let expandedRight = `M 2 0 v${extendedHeight - 40} t 0 4  7 20 -5 60`;
          if (svg) {
            svg.attr('height', isClose ? extendedHeight : svgHeight);
            svg.find('.path-left').attr('d', isClose ? expandedLeft : pathLeft);
            svg
              .find('.path-right')
              .attr('d', isClose ? expandedRight : pathRight);
          }
        },
        !collection.activityAttempts ? 100 : 0
      );
    },

    parseDiagnosticLessons(diagnosticLessons, lessons) {
      const diagnosticDetails = this.get('diagnosticDetails');
      const isDiagnosticEnd = this.get('isDiagnosticEnd');
      const isPathRouteView = this.get('isPathRouteView');
      if (diagnosticLessons.length) {
        if (isDiagnosticEnd && diagnosticDetails) {
          diagnosticLessons = diagnosticLessons.filterBy(
            'diagnosticStats.session_id',
            diagnosticDetails.session_id
          );
        }
        diagnosticLessons.forEach(domainItem => {
          let lessonSuggestions = domainItem.lessonSuggestions || [];
          let activeDomains = lessons.filter(lesson => {
            let context = domainItem.context;
            return lesson.tx_domain_code === context.domainCode;
          });
          if (activeDomains.length) {
            let activeLesson = activeDomains.get(0);
            let diagnosticLessonSugg = Ember.A();
            if (activeLesson) {
              const diagnosticStats = domainItem.diagnosticStats;
              if (diagnosticStats && !isPathRouteView) {
                let sugesstionStatusItem = {
                  lesson_id: null,
                  lesson_title: this.get('i18n').t('diagnostic.title').string,
                  tx_domain_name: activeLesson.tx_domain_name,
                  isDiagnostic: true,
                  diagnosticStatus: diagnosticStats.status,
                  firstCollHasSuggsType: 'system'
                };
                diagnosticLessonSugg.pushObject(
                  Ember.Object.create(sugesstionStatusItem)
                );
              }
              if (lessonSuggestions.length) {
                lessonSuggestions = lessonSuggestions.filter(
                  item => !lessons.findBy('lesson_id', item.lesson_id)
                );
                const noRescopeList = lessonSuggestions.filter(
                  item => !item.rescope
                );
                if (diagnosticDetails && !noRescopeList.length) {
                  this.set('isLessonSuggestionSkipped', true);
                }
                lessonSuggestions = lessonSuggestions.map(lessonSuggetion => {
                  const newLessonItem = getObjectCopy(activeLesson);
                  lessonSuggetion.collections.forEach(collection => {
                    collection.setProperties({
                      lessonContext: domainItem.context,
                      lessonStats: diagnosticStats,
                      lesson_id: lessonSuggetion.lesson_id
                    });
                  });
                  newLessonItem.setProperties({
                    lesson_id: lessonSuggetion.lesson_id,
                    collections: lessonSuggetion.collections,
                    lesson_title: lessonSuggetion.title,
                    tx_domain_name: activeLesson.tx_domain_name,
                    isDiagnosticLesson: true,
                    rescope: false,
                    unit_id: domainItem.context.ctxUnitId
                  });
                  return newLessonItem;
                });
                diagnosticLessonSugg = diagnosticLessonSugg.concat(
                  lessonSuggestions
                );
              } else {
                if (diagnosticDetails) {
                  this.set('noSuggestedLesson', true);
                }
              }
              if (!isPathRouteView) {
                activeLesson.set('prevLeCollHasSuggsType', 'system');
                activeLesson.set('diagnosticEnd', true);
                if (activeLesson.rescope) {
                  const activeLessonIndex = lessons.indexOf(activeLesson);
                  const nextLessonItem = lessons.find(
                    (item, index) => index > activeLessonIndex && !item.rescope
                  );
                  if (nextLessonItem) {
                    nextLessonItem.set('prevDiagnosticEnd', true);
                  }
                }
                lessons.splice(
                  lessons.indexOf(activeLesson),
                  0,
                  ...diagnosticLessonSugg
                );
              } else {
                const routeContents = activeLesson.get('routeContents') || [];
                activeLesson.set('routeContents', [
                  ...routeContents,
                  ...diagnosticLessonSugg
                ]);
              }
            }
          }
        });
      }
    },

    /**
     * @function parseDependentLessons
     * Help to merge the dependent lessons to the milestone lessons
     */
    parseDependentLessons(dependentLessons, lessons) {
      const dependentPaths = dependentLessons || Ember.A([]);
      const isPathRouteView = this.get('isPathRouteView');
      dependentPaths.sortBy('id').forEach(depLesson => {
        const activeLesson = lessons.findBy('lesson_id', depLesson.cxtLessonId);
        if (activeLesson) {
          depLesson.setProperties({
            lesson_title: depLesson.lesson_title,
            tx_domain_name: activeLesson.tx_domain_name,
            isDiagnosticLesson: true,
            isDependentLesson: true,
            rescope: false,
            firstCollHasSuggsType: 'system',
            unit_id: activeLesson.unit_id,
            lesson_id: depLesson.lesson_id
          });
          if (isPathRouteView) {
            const routeContents = activeLesson.get('routeContents') || [];
            activeLesson.set('routeContents', [
              ...routeContents,
              Ember.Object.create({ ...depLesson })
            ]);
          } else {
            lessons.splice(lessons.indexOf(activeLesson), 0, depLesson);

            activeLesson.set('prevLeCollHasSuggsType', 'system');
            activeLesson.set('diagnosticEnd', true);
          }
        }
      });
    },

    passSourceDetailsNoteTool(queryParams) {
      window.sourceDetailsNoteTool = {};
      if (queryParams.classId) {
        window.sourceDetailsNoteTool.class_id = queryParams.classId;
      }
      if (queryParams.courseId) {
        window.sourceDetailsNoteTool.course_id = queryParams.courseId;
      }
      if (queryParams.unitId) {
        window.sourceDetailsNoteTool.unit_id = queryParams.unitId;
      }
      if (queryParams.lessonId) {
        window.sourceDetailsNoteTool.lesson_id = queryParams.lessonId;
      }
      if (queryParams.collectionId) {
        window.sourceDetailsNoteTool.collection_id = queryParams.collectionId;
      }
    }
  }
);
