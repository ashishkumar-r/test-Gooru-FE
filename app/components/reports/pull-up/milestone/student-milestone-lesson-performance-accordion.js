import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: [
    'milestone-report',
    'student-milestone-lesson-performance-accordion'
  ],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/performance
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * @requires service:sesion
   */
  session: Ember.inject.service('session'),

  /**
   * @requires service:api-sdk/course-map
   */
  courseMapService: Ember.inject.service('api-sdk/course-map'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when toggle a lesson
    onToggleLesson() {
      const component = this;
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_LJ_IS_CHART_INFO
      );
      if (!component.get('collections.length')) {
        component.loadCollectionsPerformance().then(function() {
          component.lessonAccordionToggleHandler();
        });
      } else {
        component.lessonAccordionToggleHandler();
      }
    },

    //Action triggered when click on collection performance
    onOpenCollectionReport(collection) {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_LJ_IS_CHART_REPORT);
      let collectionReportContext = {
        userId: component.get('userId'),
        classId: component.get('classId'),
        courseId: component.get('courseId'),
        unitId: component.get('unitId'),
        lessonId: component.get('lessonId'),
        collectionId: collection.get('id') || collection.get('collectionId'),
        type: collection.get('format') || collection.get('collectionType'),
        lesson: component.get('lesson'),
        isStudent: component.get('isStudent'),
        isTeacher: component.get('isTeacher'),
        collection
      };
      let reportType =
        collection.get('format') || collection.get('collectionType');
      if (reportType === CONTENT_TYPES.EXTERNAL_ASSESSMENT) {
        component.set('isShowExternalAssessmentReport', true);
      } else if (reportType === CONTENT_TYPES.OFFLINE_ACTIVITY) {
        collectionReportContext.performance = collection.get('performance');
        component.set('isShowStudentOfflineActivityReport', true);
      } else {
        component.set('isShowCollectionReport', true);
      }
      component.set('collectionReportContext', collectionReportContext);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {UUID} unitId
   */
  unitId: Ember.computed('lesson', function() {
    return this.get('lesson.unit_id') || this.get('lesson.unitId');
  }),

  /**
   * @property {UUID} lessonId
   */
  lessonId: Ember.computed('lesson', function() {
    return this.get('lesson.lesson_id') || this.get('lesson.lessonId');
  }),

  /**
   * @property {Array} collections
   */
  collections: Ember.A([]),

  /**
   * @property {Boolean} isExpanded
   */
  isExpanded: false,

  /**
   * @property {Boolean} isRescopedLesson
   */
  isRescopedLesson: Ember.computed(
    'lesson.isRescopedLesson',
    'lesson.performance',
    function() {
      const component = this;
      const isRescopedLesson = component.get('lesson.isRescopedLesson');
      const isLessonPerformed =
        component.get('lesson.isPerformed') ||
        component.get('lesson.performance');
      return isRescopedLesson && !isLessonPerformed;
    }
  ),

  /**
   * @property {Array} rescopedCollectionIds
   */
  rescopedCollectionIds: Ember.A([]),

  /**
   * @property {Boolean} isTeacher
   */
  isTeacher: Ember.computed.equal('session.role', 'teacher'),

  /**
   * @property {Boolean} isStudent
   */
  isStudent: Ember.computed.not('isTeacher'),

  /**
   * @property {Boolean} isPrevLessonExpanded
   */

  isPrevLessonExpanded: Ember.computed(
    'milestoneLessons.@each.isExpaned',
    function() {
      let lessonIndex = this.get('lessonIndex');
      return this.get('milestoneLessons').objectAt(lessonIndex - 1)
        ? this.get('milestoneLessons').objectAt(lessonIndex - 1).isExpaned
        : false;
    }
  ),

  isUnit0Milestone: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadCollectionsPerformance
   */
  loadCollectionsPerformance() {
    const component = this;
    component.set('isLoading', true);
    let lesson = component.get('lesson');
    return Ember.RSVP.hash({
      lessonInfo:
        component.get('isRoute0MileStone') ||
        lesson.isDiagnosticLesson ||
        component.get('isUnit0Milestone')
          ? component.get('lesson')
          : component.fetchLessonInfo(),
      collectionsPerformance: component.fetchMilestoneCollectionsPerformance(
        CONTENT_TYPES.COLLECTION
      ),
      assessmentsPerformance: component.fetchMilestoneCollectionsPerformance(
        CONTENT_TYPES.ASSESSMENT
      )
    }).then(
      ({ lessonInfo, collectionsPerformance, assessmentsPerformance }) => {
        let collections = lessonInfo
          ? lessonInfo.get('children') || lessonInfo.get('collections')
          : Ember.A([]);
        if (
          component.get('isRoute0MileStone') ||
          lessonInfo.get('isDiagnosticLesson')
        ) {
          collections = lessonInfo.get('collections');
        }
        if (!component.isDestroyed) {
          component.set(
            'collections',
            component.parseCollectionsPerformance(
              collections,
              collectionsPerformance.concat(assessmentsPerformance)
            )
          );

          component.handleLineBasedOnPreviousLine(
            this.get('milestoneLessons'),
            this.get('lesson'),
            this.get('collections')
          );
          component.parseRescopedCollections(collections);
          component.set('isLoading', false);
        }
      }
    );
  },

  /**
   * @function fetchMilestoneCollectionsPerformance
   */
  fetchMilestoneCollectionsPerformance(collectionType) {
    const component = this;
    const classId = component.get('classId');
    const courseId = component.get('courseId');
    const unitId = component.get('unitId');
    const lessonId = component.get('lessonId');
    const userId = component.get('userId');
    const performanceService = component.get('performanceService');
    return performanceService.getCollectionsPerformanceByLessonId(
      classId,
      courseId,
      unitId,
      lessonId,
      collectionType,
      userId
    );
  },

  /**
   * @function fetchLessonInfo
   */
  fetchLessonInfo() {
    const component = this;
    const courseMapService = component.get('courseMapService');
    const classId = component.get('classId');
    const courseId = component.get('courseId');
    const unitId = component.get('unitId');
    const lessonId = component.get('lessonId');
    const userId = component.get('isTeacher')
      ? component.get('userId')
      : undefined;
    return courseMapService.getLessonInfo(
      classId,
      courseId,
      unitId,
      lessonId,
      true,
      userId
    );
  },

  /**
   * @function parseCollectionsPerformance
   */
  parseCollectionsPerformance(collections, collectionsPerformance) {
    const component = this;
    if (collections && !component.isDestroyed) {
      collectionsPerformance.map(collectionPerformance => {
        let collectionData = collections.findBy(
          'id',
          collectionPerformance.get('collectionId')
        );
        if (collectionData) {
          let collectionPerformanceData = collectionPerformance.get(
            'performance'
          );
          collectionData.set(
            'performance',
            Ember.Object.create({
              score: collectionPerformanceData.get('scoreInPercentage'),
              scoreInPercentage: collectionPerformanceData.get(
                'scoreInPercentage'
              ),
              timeSpent: collectionPerformanceData.get('timeSpent')
            })
          );
          collectionData.set(
            'isAssessment',
            (collectionData.get('format') ||
              collectionData.get('collectionType')) ===
              CONTENT_TYPES.ASSESSMENT ||
              (collectionData.get('format') ||
                collectionData.get('collectionType')) ===
                CONTENT_TYPES.EXTERNAL_ASSESSMENT
          );
          collectionData.set(
            'isOfflineActivity',
            (collectionData.get('format') ||
              collectionData.get('collectionType')) ===
              CONTENT_TYPES.OFFLINE_ACTIVITY
          );
          component.set('lesson.isPerformed', true);
        }
      });
    }
    return collections;
  },

  /**
   * @function parseRescopedCollections
   */
  parseRescopedCollections(collections) {
    const component = this;
    let rescopedCollectionIds = component.get('rescopedCollectionIds');
    rescopedCollectionIds.map(collectionId => {
      let collection = collections.findBy('id', collectionId);
      if (collection) {
        collection.set('isRescopedCollection', true);
      }
    });
  },

  /**
   * @function lessonAccordionToggleHandler
   */
  lessonAccordionToggleHandler() {
    const component = this;
    if (component.get('isExpanded')) {
      component.$('.collections-info-container').slideUp(400);
    } else {
      component.$('.collections-info-container').slideDown(400);
    }
    component.toggleProperty('isExpanded');
    component.set('lesson.isExpaned', component.get('isExpanded'));
  },

  /**
   * @function handlePathLinePointers
   * Method to handle path line connector
   * TODO It's not yet integrated need to extend the support
   */
  handlePathLinePointers(collections) {
    let suggestedCollections = collections.filterBy('isSuggestedContent', true);
    if (suggestedCollections) {
      suggestedCollections.map(collection => {
        let curCollectionPos = collections.indexOf(collection);
        let prevCollection = collections.objectAt(curCollectionPos - 1);
        if (prevCollection && prevCollection.get('isSuggestedContent')) {
          if (prevCollection.get('pathType') === collection.get('pathType')) {
            collection.set(
              'alignmentType',
              `${prevCollection.get('alignmentType')}`
            );
            collection.set('pathLine', 'identical');
          } else if (prevCollection.get('alignmentType') === 'center-path') {
            collection.set(
              'alignmentType',
              collection.get('pathType') === 'teacher'
                ? 'left-path'
                : 'right-path'
            );
            collection.set(
              'pathLine',
              collection.get('pathType') === 'teacher'
                ? 'left-line'
                : 'right-line'
            );
          } else {
            collection.set('alignmentType', 'center-path');
            collection.set(
              'pathLine',
              collection.get('pathType') === 'teacher'
                ? 'left-line'
                : 'right-line'
            );
          }
        } else {
          collection.set(
            'alignmentType',
            collection.get('pathType') === 'teacher'
              ? 'left-path'
              : 'right-path'
          );
          collection.set(
            'pathLine',
            collection.get('pathType') === 'teacher'
              ? 'left-line'
              : 'right-line'
          );
        }
        let nextCollection = collections.objectAt(curCollectionPos + 1);
        if (nextCollection && !nextCollection.get('isSuggestedContent')) {
          nextCollection.set(
            'alignmentType',
            collection.get('alignmentType') === 'left-path'
              ? 'right-path'
              : 'left-path'
          );
          nextCollection.set(
            'pathLine',
            collection.get('alignmentType') === 'left-path'
              ? 'right-line'
              : 'left-line'
          );
        }
      });
    }
    return collections;
  },

  /**
   * handle line and path for lesson and collection
   */
  handleLineBasedOnPreviousLine(lessons, selectedLesson, collections) {
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
  }
});
