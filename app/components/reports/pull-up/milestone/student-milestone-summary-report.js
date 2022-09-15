import Ember from 'ember';
import { aggregateMilestonePerformanceScore } from 'gooru-web/utils/performance-data';
import { getObjectCopy } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['milestone-report', 'student-milestone-summary-report'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/performance
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * @requires service:api-sdk/course
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),

  /**
   * @requires service:api-sdk/rescope
   */
  rescopeService: Ember.inject.service('api-sdk/rescope'),

  /**
   * @requires service: api-sdk/course-map
   */
  courseMapService: Ember.inject.service('api-sdk/course-map'),

  /**
   * @requires service:i18n
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    component.loadMilestoneReportData();
    if (component.get('isTeacher')) {
      component.fetchMilestones();
    }
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when switch between next/previous milestone
    onSlideMilestone(direction) {
      const component = this;
      let activeMilestoneIndex = component.get('activeMilestoneIndex');
      activeMilestoneIndex =
        direction === 'left'
          ? activeMilestoneIndex - 1
          : activeMilestoneIndex + 1;
      component.set('activeMilestoneIndex', activeMilestoneIndex);
      component.set(
        'activeMilestone',
        component.get('milestones').objectAt(activeMilestoneIndex)
      );
      component.loadMilestoneReportData();
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {UUID} classId
   */
  classId: Ember.computed.alias('class.id'),

  /**
   * @property {UUID} courseId
   */
  courseId: Ember.computed.alias('class.courseId'),

  /**
   * @property {UUID} milestoneId
   */
  milestoneId: Ember.computed('activeMilestone', function() {
    return (
      this.get('activeMilestone.milestone_id') ||
      this.get('activeMilestone.milestoneId')
    );
  }),

  /**
   * @property {String} frameworkCode
   */
  frameworkCode: Ember.computed.alias('class.preference.framework'),

  /**
   * @property {Array} milestones
   */
  milestones: Ember.A([]),

  /**
   * @property {Object} activeMilestone
   */
  activeMilestone: {},

  /**
   * @property {Array} milestoneLessons
   */
  milestoneLessons: Ember.A([]),

  /**
   * @property {Boolean} isMilestoneNotStarted
   */
  isMilestoneNotStarted: Ember.computed(
    'activeMilestone.performance',
    function() {
      return !this.get('activeMilestone.performance');
    }
  ),

  /**
   * @property {Number} activeMilestoneIndex
   */
  activeMilestoneIndex: Ember.computed(function() {
    const component = this;
    const activeMilestone = component.get('activeMilestone');
    const milestones = component.get('milestones');
    return milestones.indexOf(activeMilestone);
  }),

  /**
   * @property {String} placeholderText
   */
  placeholderText: Ember.computed(
    'activeMilestone.performance',
    'diagnosticLessonCount',
    function() {
      const component = this;
      const milestonePerformance = component.get('activeMilestone.performance');
      let placeholderText = component
        .get('i18n')
        .t('profile.proficiency.not-started').string;
      if (milestonePerformance) {
        const completedCount = milestonePerformance.get('completedCount');
        const totalCount = milestonePerformance.get('totalCount');
        const diagnosticLessonCount = component.get('diagnosticLessonCount');
        const isDoneDiagnostic = component.get('isDoneDiagnostic');
        placeholderText =
          completedCount || totalCount
            ? completedCount === totalCount
              ? `${component.get('i18n').t('common.completed').string}!`
              : `${
                isDoneDiagnostic
                  ? completedCount + diagnosticLessonCount
                  : completedCount
              }/${totalCount + diagnosticLessonCount} ${
                component.get('i18n').t('common.lessonObj.zero').string
              }`
            : null;
      }
      return placeholderText;
    }
  ),

  /**
   * @property {Boolean} isSlideLeftDisabled
   */
  isSlideLeftDisabled: Ember.computed.equal('activeMilestoneIndex', 0),

  /**
   * @property {Boolean} isSlideRightDisabled
   */
  isSlideRightDisabled: Ember.computed(
    'activeMilestoneIndex',
    'milestones',
    function() {
      const component = this;
      return (
        component.get('activeMilestoneIndex') ===
        component.get('milestones.length') - 1
      );
    }
  ),

  /**
   * @property {Array} rescopedCollectionIds
   */
  rescopedCollectionIds: Ember.A([]),

  /**
   * @property {Object} rescopedContents
   */
  rescopedContents: null,

  /**
   * @property {Boolean} isDisableMilestoneSlider
   */
  isDisableMilestoneSlider: Ember.computed.equal('milestones.length', 0),

  /**
   * @property {Boolean} isTeacher
   */
  isTeacher: false,

  diagnosticLessons: Ember.A(),

  diagnosticLessonCount: 0,

  isDoneDiagnostic: false,

  isUnit0Milestone: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadMilestoneReportData
   */
  loadMilestoneReportData() {
    const component = this;
    component.set('isLoading', true);
    if (
      this.get('isRoute0MileStone') ||
      this.get('activeMilestone.isRoute0') ||
      this.get('activeMilestone.isUnit0')
    ) {
      let activeMilestone = this.get('activeMilestone');
      component.set('milestoneLessons', activeMilestone.get('lessons'));
      component.loadMilestoneReportPerformanceData();
      component.set('isLoading', false);
      component.set('isUnit0Milestone', !!activeMilestone.isUnit0);
    } else {
      let rescopedContents = component.get('rescopedContents');
      const pathParams = {
        classId: component.get('classId'),
        userId: component.get('userId')
      };
      return Ember.RSVP.hash({
        milestoneLessons: component.fetchMilestoneLessons(),
        rescopedContents: rescopedContents || component.fetchRescopedContents(),
        dependentPaths: component
          .get('courseMapService')
          .fetchMilestoneDependentPath(component.get('milestoneId'), pathParams)
      }).then(hash => {
        if (!component.isDestroyed) {
          component.set('rescopedContents', hash.rescopedContents);
          component.set('milestoneLessons', hash.milestoneLessons);
          component.parseDiagnosticLessons(
            component.get('diagnosticLessons'),
            hash.milestoneLessons
          );
          component.parseDependentLessons(
            hash.dependentPaths,
            hash.milestoneLessons
          );
          component.loadMilestoneReportPerformanceData();
          component.parseRescopedContents();
          component.set('isLoading', false);
        }
      });
    }
  },

  /**
   * @function loadMilestoneReportPerformanceData
   */
  loadMilestoneReportPerformanceData() {
    const component = this;
    if (
      component.get('activeMilestone.performance') ||
      component.get('isTeacher')
    ) {
      component.loadMilestonePerformanceScore();
      component.loadMilestonePerformanceTimespent();
    }
  },

  /**
   * @function loadMilestonePerformanceScore
   */
  loadMilestonePerformanceScore() {
    const component = this;
    const collectionType = 'assessment';
    component
      .fetchMilestonePerformance(collectionType)
      .then(function(milestoneLessonsPerformance) {
        component.parseLessonsPerformanceScore(milestoneLessonsPerformance);
      });
  },

  /**
   * @function loadMilestonePerformanceTimespent
   */
  loadMilestonePerformanceTimespent() {
    const component = this;
    const collectionType = 'collection';
    component
      .fetchMilestonePerformance(collectionType)
      .then(function(milestoneLessonsPerformance) {
        component.parseLessonsPerformanceTimespent(milestoneLessonsPerformance);
      });
  },

  /**
   * @function fetchMilestones
   */
  fetchMilestones() {
    const component = this;
    const frameworkCode = component.get('frameworkCode');
    const courseId = component.get('courseId');
    return Ember.RSVP.hash({
      milestones: component
        .get('courseService')
        .getCourseMilestones(courseId, frameworkCode)
    }).then(({ milestones }) => {
      if (!component.isDestroyed) {
        component.set(
          'milestones',
          component.renderMilestonesBasedOnStudentGradeRange(milestones)
        );
      }
    });
  },

  /**
   * @function fetchMilestonePerformance
   */
  fetchMilestonePerformance(collectionType) {
    const component = this;
    const performanceService = component.get('performanceService');
    const classId = component.get('classId');
    const courseId = component.get('courseId');
    const milestoneId = component.get('milestoneId');
    const userId = component.get('userId');
    const frameworkCode = component.get('frameworkCode');
    return performanceService.getLessonsPerformanceByMilestoneId(
      classId,
      courseId,
      milestoneId,
      collectionType,
      userId,
      frameworkCode
    );
  },

  /**
   * @function fetchMilestoneLessons
   */
  fetchMilestoneLessons() {
    const component = this;
    const courseService = component.get('courseService');
    const courseId = component.get('courseId');
    const milestoneId = component.get('milestoneId');
    return courseService.getCourseMilestoneLessons(courseId, milestoneId);
  },

  /**
   * @function fetchRescopedContents
   * Method to get rescoped contents
   */
  fetchRescopedContents() {
    let component = this;
    let classId = component.get('classId');
    let courseId = component.get('courseId');
    return Ember.RSVP.hash({
      rescopedContents: component.get('rescopeService').getSkippedContents({
        classId,
        courseId
      })
    })
      .then(({ rescopedContents }) => {
        return rescopedContents;
      })
      .catch(function() {
        return null;
      });
  },

  /**
   * @function parseLessonsPerformanceScore
   */
  parseLessonsPerformanceScore(lessonsPerformance) {
    const component = this;
    let lessons = component.get('milestoneLessons');
    if (
      lessonsPerformance &&
      lessonsPerformance.length &&
      !component.isDestroyed
    ) {
      lessonsPerformance.map(lessonPerformance => {
        let lessonData = lessons.findBy(
          'lesson_id',
          lessonPerformance.get('lessonId')
        );
        if (lessonData) {
          lessonData.set('performance', lessonPerformance.get('performance'));
        }
      });
      if (component.get('isTeacher')) {
        let activeMilestone = component.get('activeMilestone');
        let milestonePerformanceScore = aggregateMilestonePerformanceScore(
          lessonsPerformance
        );
        if (activeMilestone.get('performance')) {
          activeMilestone.set('performance.score', milestonePerformanceScore);
          activeMilestone.set(
            'performance.scoreInPercentage',
            milestonePerformanceScore
          );
        } else {
          activeMilestone.set(
            'performance',
            Ember.Object.create({
              score: milestonePerformanceScore,
              scoreInPercentage: milestonePerformanceScore
            })
          );
        }
      }
    }
  },

  /**
   * @function parseLessonsPerformanceTimespent
   */
  parseLessonsPerformanceTimespent(lessonsPerformance) {
    const component = this;
    let lessons = component.get('milestoneLessons');
    let milestoneTimespent = 0;
    if (
      lessonsPerformance &&
      lessonsPerformance.length &&
      !component.isDestroyed
    ) {
      lessonsPerformance.map(lessonPerformance => {
        let lessonTimespent = lessonPerformance.get('performance.timeSpent');
        let lessonData = lessons.findBy(
          'lesson_id',
          lessonPerformance.get('lessonId')
        );
        if (lessonData) {
          if (lessonData.get('performance')) {
            lessonData.set('performance.timeSpent', lessonTimespent);
          } else {
            lessonData.set(
              'performance',
              Ember.Object.create({
                timeSpent: lessonTimespent
              })
            );
          }
        }
        milestoneTimespent += lessonTimespent;
      });
    }
    if (!component.isDestroyed) {
      let activeMilestone = component.get('activeMilestone');
      if (activeMilestone.get('performance')) {
        activeMilestone.set('performance.timeSpent', milestoneTimespent);
      } else {
        activeMilestone.set(
          'performance',
          Ember.Object.create({
            timeSpent: milestoneTimespent
          })
        );
      }
    }
  },

  /**
   * @function parseRescopedContents
   */
  parseRescopedContents() {
    const component = this;
    let rescopedContents = component.get('rescopedContents');
    if (rescopedContents) {
      let milestoneLessons = component.get('milestoneLessons');
      let rescopedLessons = rescopedContents.lessons;
      if (!component.isDestroyed && rescopedLessons) {
        rescopedLessons.map(rescopedLesson => {
          let milestoneLesson = milestoneLessons.findBy(
            'lesson_id',
            rescopedLesson
          );
          if (milestoneLesson) {
            milestoneLesson.set('isRescopedLesson', true);
          }
        });
        component.extractRescopedCollections();
      }
    }
  },

  /**
   * @function extractRescopedCollections
   * Method to extract all content type ids which is rescoped
   */
  extractRescopedCollections() {
    const component = this;
    let rescopedContents = component.get('rescopedContents');
    let rescopedCollectionIds = Ember.A([]);
    rescopedCollectionIds.pushObjects(rescopedContents.assessments);
    rescopedCollectionIds.pushObjects(rescopedContents.collections);
    rescopedCollectionIds.pushObjects(rescopedContents.assessmentsExternal);
    rescopedCollectionIds.pushObjects(rescopedContents.collectionsExternal);
    rescopedCollectionIds.pushObjects(rescopedContents.offlineActivities);
    if (!component.isDestroyed) {
      component.set('rescopedCollectionIds', rescopedCollectionIds);
    }
  },

  /**
   * This Method is responsible for milestone display based on students class grade.
   * @return {Array}
   */
  renderMilestonesBasedOnStudentGradeRange(milestones) {
    let component = this;
    let milestoneData = Ember.A([]);
    let classGradeId = component.get('class.gradeCurrent');
    milestones.forEach(milestone => {
      let gradeId = milestone.get('grade_id');
      if (classGradeId === gradeId) {
        milestone.set('isClassGrade', true);
      }
      milestoneData.pushObject(milestone);
    });
    return milestoneData;
  },

  parseDiagnosticLessons(diagnosticLessons, lessons) {
    if (diagnosticLessons) {
      diagnosticLessons.forEach(domainItem => {
        let lessonSuggestions = domainItem.lessonSuggestions || [];

        let activeDomains = lessons.filter(lesson => {
          let context = domainItem.context;
          return lesson.tx_domain_code === context.domainCode;
        });
        if (activeDomains.length) {
          let activeLesson = activeDomains.get(0);
          if (activeLesson) {
            const diagnosticStats = domainItem.diagnosticStats;
            if (lessonSuggestions.length) {
              this.set('diagnosticLessonCount', lessonSuggestions.length);
              this.set(
                'isDoneDiagnostic',
                diagnosticStats.get('status') === 'complete'
              );
              lessonSuggestions = lessonSuggestions.map(lessonSuggetion => {
                const newLessonItem = getObjectCopy(activeLesson);
                newLessonItem.setProperties({
                  lesson_id: lessonSuggetion.lesson_id,
                  collections: lessonSuggetion.collections,
                  lesson_title: lessonSuggetion.title,
                  tx_domain_name: activeLesson.tx_domain_name,
                  isDiagnosticLesson: true,
                  unit_id: domainItem.context.ctxUnitId
                });
                return newLessonItem;
              });
            }
            if (diagnosticStats) {
              let sugesstionStatusItem = {
                lesson_id: null,
                lesson_title: this.get('i18n').t('diagnostic.title').string,
                isDiagnostic: true,
                diagnosticStatus: diagnosticStats.status,
                firstCollHasSuggsType: 'teacher'
              };
              lessonSuggestions.pushObject(
                Ember.Object.create(sugesstionStatusItem)
              );
            }
            lessons.splice(
              lessons.indexOf(activeLesson),
              0,
              ...lessonSuggestions
            );
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
        lessons.splice(lessons.indexOf(activeLesson), 0, depLesson);

        activeLesson.set('prevLeCollHasSuggsType', 'system');
        activeLesson.set('diagnosticEnd', true);
      }
    });
  }
});
