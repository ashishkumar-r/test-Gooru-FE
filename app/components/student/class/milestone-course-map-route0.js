import Ember from 'ember';
import {
  ROLES,
  PLAYER_EVENT_SOURCE,
  CONTENT_TYPES
} from 'gooru-web/config/config';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(tenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['student-class-milestone-course-map-route0'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:session
   */
  session: Ember.inject.service(),

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
   * route0 Service to perform route0 data operations
   */
  route0Service: Ember.inject.service('api-sdk/route0'),

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
   * This property have details of milestones array
   * @type {Array}
   */
  milestones: Ember.A([]),

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
   * Maintains the student Id, by default this will be NULL
   * @type {String}
   */
  studentId: null,

  /**
   * @property {Boolean} isShowRoute0CollectionReport
   */
  isShowRoute0CollectionReport: false,

  /**
   * @property {Boolean} isShowRoute0ExternalAssessmentReport
   */
  isShowRoute0ExternalAssessmentReport: false,

  /**
   * Property will decided to show the play button or not
   * @type {Boolean}
   */
  allowToPlay: true,
  isOpenPlayer: false,

  /**
   * @property {Boolean} isStudent
   */
  isStudent: Ember.computed.equal('session.role', ROLES.STUDENT),

  /**
   * Computed Property to extract framework code from settings
   * @return {String}
   */
  fwCode: Ember.computed('class', function() {
    let preference = this.get('class.preference');
    return preference != null ? preference.get('framework') : null;
  }),

  /**
   * @property {Number} activeMilestoneIndex
   */
  activeMilestoneIndex: 1,

  /**
   * @property {Boolean} isShowRoute0MilestoneReport
   */
  isShowRoute0MilestoneReport: false,

  /**
   * Maintains the userId of milestone display view
   * @type {String}
   */
  userId: null,

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    closePullUp() {
      this.set('isOpenPlayer', false);
      this.loadData();
    },

    /**
     * Handle toggle functionality of hide/show milestone items
     * @return {Object}
     */
    toggleMilestoneItems(selectedMilestone) {
      this.handleMilestoneToggle(selectedMilestone);
    },

    /**
     * Handle toggle functionality of hide/show lesson items
     * @return {Object}
     */
    toggleLessonItems(selectedLesson, lessonIndex) {
      this.handleMilestoneLessonToggle(selectedLesson, lessonIndex);
    },

    /**
     * Open the player with the specific collection/assessment
     *
     * @function actions:studyPlayer
     * @param {string} unitId - Identifier for a unit
     * @param {string} lessonId - Identifier for lesson
     * @param {string} item - collection, assessment, lesson or resource
     */
    studyPlayer: function(type, unitId, lessonId, item) {
      const component = this;
      const classId = component.get('classId');
      const minScore = component.get('class.minScore');
      const courseId = component.get('courseId');
      item.set('minScore', minScore);
      component.startCollectionStudyPlayer(
        classId,
        courseId,
        unitId,
        lessonId,
        item
      );
    },

    //Action triggered when click on collection performance
    onOpenRoute0CollectionReport(unitId, lesson, collection) {
      const component = this;
      let studentId = component.get('studentId');
      let userUid = studentId ? studentId : component.get('session.userId');
      let studentCollectionReportContext = {
        userId: userUid,
        classId: component.get('classId'),
        courseId: component.get('courseId'),
        unitId,
        lessonId: lesson.get('lessonId'),
        collectionId: collection.get('collectionId'),
        type: collection.get('collectionType'),
        lesson,
        isStudent: true,
        isTeacher: false,
        collection
      };
      let reportType = collection.get('collectionType');
      if (reportType === 'assessment-external') {
        component.set('isShowRoute0ExternalAssessmentReport', true);
      } else {
        component.set('isShowRoute0CollectionReport', true);
      }
      component.set(
        'studentCollectionReportContext',
        studentCollectionReportContext
      );
    },

    //Action triggered when click on milestone performance
    onShowMilestoneReport(milestone) {
      const component = this;
      component.set('selectedMilestone', milestone);
      component.set(
        'activeMilestoneIndex',
        component.get('milestones').indexOf(milestone)
      );
      component.set('isShowRoute0MilestoneReport', true);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  /**
   * Function to triggered once when the component element is first rendered.
   */
  didInsertElement() {
    const userId = this.get('studentId')
      ? this.get('studentId')
      : this.get('session.userId');
    this.set('userId', userId);
    this.loadData();
  },

  didRender() {
    let component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  //--------------------------------------------------------------------------
  // Methods

  loadData() {
    let component = this;
    let courseId = component.get('courseId');
    let classId = component.get('classId');
    component.set('isLoading', true);
    let locateLastPlayedItem = component.get('locateLastPlayedItem');
    let userId = component.get('studentId');
    let showPerformance = component.get('showPerformance');
    let route0Promise;
    if (userId) {
      route0Promise = component.get('route0Service').fetchInClassByTeacher({
        courseId,
        classId,
        userId
      });
    } else {
      route0Promise = component.get('route0Service').fetchInClass({
        courseId,
        classId
      });
    }

    route0Promise.then(route0 => {
      if (!component.isDestroyed) {
        component.set(
          'milestones',
          component.mergeUnitsToMilestone(route0.milestones)
        );
        if (showPerformance) {
          component.fetchMilestonePerformance();
        }
        if (locateLastPlayedItem) {
          component.identifyUserLocationAndLocate();
        }
        component.set('isLoading', false);
      }
    });
  },

  fetchMilestonePerformance() {
    let component = this;
    let performanceService = component.get('performanceService');
    let classId = component.get('classId');
    let courseId = component.get('courseId');
    let fwCode = component.get('fwCode');
    let studentId = component.get('studentId');
    let userUid = studentId ? studentId : component.get('session.userId');
    let milestones = component.get('milestones');
    performanceService
      .getPerformanceForMilestones(
        classId,
        courseId,
        'assessment',
        userUid,
        fwCode
      )
      .then(milestonesPerformance => {
        milestones.map(milestone => {
          let milestonePerformanceData = Ember.Object.create({
            hasStarted: false,
            completedCount: 0,
            totalCount: 0,
            completedInPrecentage: 0,
            scoreInPercentage: null,
            timeSpent: null
          });
          let milestonePerformance = milestonesPerformance.findBy(
            'milestoneId',
            milestone.get('milestoneId')
          );
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
      });
  },

  fetchCollectionPerformance(lesson, collections) {
    let component = this;
    let studentId = component.get('studentId');
    let userUid = studentId ? studentId : component.get('session.userId');
    let classId = component.get('classId');
    let courseId = component.get('courseId');
    let unitId = lesson.get('unitId');
    let lessonId = lesson.get('lessonId');
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
    });
  },

  setMilestoneCollectionPerformanceData(
    type,
    collections,
    lessonCollectionsPerformance
  ) {
    lessonCollectionsPerformance.forEach(lessonCollectionPerformance => {
      let collectionId = lessonCollectionPerformance.get('collectionId');
      let collection = collections.findBy('collectionId', collectionId);
      if (collection) {
        if (type === CONTENT_TYPES.COLLECTION) {
          if (collection.get('collectionType') === CONTENT_TYPES.COLLECTION) {
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
    let milestoneId = selectedMilestone.get('milestoneId');
    let element = `#milestone-${milestoneId}`;
    let locateLastPlayedItem = component.get('locateLastPlayedItem');
    let showPerformance = component.get('showPerformance');
    if (selectedMilestone.get('isActive')) {
      component.$(element).slideUp(400, function() {
        selectedMilestone.set('isActive', false);
      });
    } else {
      component.$(element).slideDown(400, function() {
        selectedMilestone.set('isActive', true);
      });
    }
    if (!component.get('hasLessonFetched')) {
      let lessons = selectedMilestone.get('lessons');
      if (showPerformance) {
        component.fetchMilestoneLessonsPerformance(milestoneId, lessons);
      }
      let userCurrentLocation = component.get('userCurrentLocation');
      if (locateLastPlayedItem && userCurrentLocation) {
        let lessonId = userCurrentLocation.get('lessonId');
        let selectedLesson = lessons.findBy('lessonId', lessonId);
        let lessonIndex = lessons.indexOf(selectedLesson);
        if (selectedLesson) {
          Ember.run.later(function() {
            component.handleMilestoneLessonToggle(selectedLesson, lessonIndex);
          }, 500);
        }
      }
      selectedMilestone.set('hasLessonFetched', true);
    }
  },

  fetchMilestoneLessonsPerformance(milestoneId, lessons) {
    let component = this;
    let performanceService = component.get('performanceService');
    let classId = component.get('classId');
    let courseId = component.get('courseId');
    let fwCode = component.get('fwCode');
    let studentId = component.get('studentId');
    let userUid = studentId ? studentId : component.get('session.userId');

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
        }
      }
    );
  },

  setMilestoneLessonPerformanceData(
    type,
    lessons,
    milestoneLessonsPerformance
  ) {
    milestoneLessonsPerformance.forEach(milestoneLessonPerformance => {
      let lessonId = milestoneLessonPerformance.get('lessonId');
      let lesson = lessons.findBy('lessonId', lessonId);
      if (lesson) {
        if (type === CONTENT_TYPES.ASSESSMENT) {
          lesson.set(
            'performance',
            milestoneLessonPerformance.get('performance')
          );
        }
        lesson.set('has-activity', true);
      }
    });
  },

  handleMilestoneLessonToggle(selectedLesson, lessonIndex) {
    let component = this;
    let lessonId = selectedLesson.get('lessonId');
    let unitId = selectedLesson.get('unitId');
    let element = `#milestone-lesson-${unitId}-${lessonId}-${lessonIndex}`;
    let showPerformance = component.get('showPerformance');
    let locateLastPlayedItem = component.get('locateLastPlayedItem');
    let componentEle = component.$(element);
    if (selectedLesson.get('isActive')) {
      if (componentEle) {
        componentEle.slideUp(400, function() {
          selectedLesson.set('isActive', false);
        });
      }
    } else {
      if (componentEle) {
        componentEle.slideDown(400, function() {
          selectedLesson.set('isActive', true);
        });
      }
    }
    let collections = selectedLesson.get('collections');
    if (!selectedLesson.get('hasCollectionFetched')) {
      selectedLesson.set('hasCollectionFetched', true);
      let userCurrentLocation = component.get('userCurrentLocation');
      if (locateLastPlayedItem && userCurrentLocation) {
        let collectionId = userCurrentLocation.get('collectionId');
        let selectedCollection = collections.findBy(
          'collectionId',
          collectionId
        );
        if (selectedCollection) {
          selectedCollection.set('last-played-collection', true);
        }
      }
      if (showPerformance) {
        component.fetchCollectionPerformance(selectedLesson, collections);
      }
    }
  },

  identifyUserLocationAndLocate() {
    let component = this;
    let classId = component.get('classId');
    let courseId = component.get('courseId');
    let userId = component.get('session.userId');

    let locationQueryParam = {
      courseId
    };
    component
      .get('analyticsService')
      .getUserCurrentLocation(classId, userId, locationQueryParam)
      .then(userCurrentLocation => {
        if (!component.isDestroyed) {
          component.set('userCurrentLocation', userCurrentLocation);
          if (userCurrentLocation) {
            let milestoneId = userCurrentLocation.get('milestoneId');
            let selectedMilestone = component
              .get('milestones')
              .findBy('milestoneId', milestoneId);
            if (selectedMilestone) {
              component.handleMilestoneToggle(selectedMilestone);
            }
          }
        }
      });
  },

  mergeUnitsToMilestone(milestones) {
    milestones.forEach(milestone => {
      let lessonData = Ember.A([]);
      milestone.units.forEach(unit => {
        let lessons = unit.get('lessons');
        lessons.forEach(lesson => {
          lesson.set('unitId', unit.get('unitId'));
          lesson.set('ulId', `${unit.get('unitId') - unit.get('lessonId')}`);
          lesson.set('unitTitle', unit.get('unitTitle'));
        });
        lessonData.pushObjects(lessons);
      });
      milestone.set('lessons', lessonData);
    });
    return milestones;
  },

  /**
   * Navigates to collection
   * @param {string} classId
   * @param {string} courseId
   * @param {string} unitId
   * @param {string} lessonId
   * @param {Collection} collection
   */
  startCollectionStudyPlayer: function(
    classId,
    courseId,
    unitId,
    lessonId,
    collection
  ) {
    let component = this;
    let role = ROLES.STUDENT;
    let source = PLAYER_EVENT_SOURCE.COURSE_MAP;
    let collectionId = collection.get('id');
    let collectionType = collection.get('collectionType');
    let collectionSubType = collection.get('collectionSubType');
    let minScore = collection.get('minScore');
    let pathId = collection.get('pathId') || 0;
    let pathType = collection.get('pathType') || '';
    let queryParams = {
      classId,
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
      isIframeMode: true
    };

    let suggestionPromise = null;
    // Verifies if it is a suggested Collection/Assessment
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
          pathType
        );
    } else {
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
          pathType
        );
    }

    suggestionPromise.then(function() {
      component.set(
        'playerUrl',
        component
          .get('router')
          .generate('study-player', courseId, { queryParams })
      );
      component.set('isOpenPlayer', true);
      component.set('playerContent', collection);
    });
  }
});
