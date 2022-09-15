import Ember from 'ember';
import AccordionMixin from 'gooru-web/mixins/gru-accordion';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

// Whenever the observer 'parsedLocationChanged' is running, this flag is set so
// clicking on the lessons should not update the location

/**
 * Accordion Lesson
 *
 * Component responsible for behaving as an accordion and listing a set of collections/assessments.
 * It is meant to be used inside of an {@link ./gru-accordion-course|Accordion Unit}
 *
 * @module
 * @augments Ember/Component
 * @mixes mixins/gru-accordion
 */
export default Ember.Component.extend(AccordionMixin, TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),

  /**
   * @requires service:api-sdk/collection
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @requires service:api-sdk/performance
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * @requires service:api-sdk/learner
   */
  learnerService: Ember.inject.service('api-sdk/learner'),

  /**
   * @requires service:api-sdk/course-map
   */
  courseMapService: Ember.inject.service('api-sdk/course-map'),

  /**
   * @requires service:api-sdk/analytics
   */
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  /**
   * @requires service:api-sdk/profile
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @requires service:api-sdk/assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),
  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  /**
   * @property {ClassActivityService}
   */
  classActivityService: Ember.inject.service('api-sdk/class-activity'),
  lessonService: Ember.inject.service('api-sdk/lesson'),
  portfolioService: Ember.inject.service('api-sdk/portfolio'),

  competencyService: Ember.inject.service('api-sdk/competency'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-learner-accordion-lesson', 'panel', 'panel-default'],

  classNameBindings: ['isExpanded:expanded', 'curComponentId'],

  tagName: 'li',

  curComponentId: Ember.computed(function() {
    return `l-${this.get('model.id')}`;
  }),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Load the data for this lesson (data should only be loaded once) and trigger
     * the 'onLessonUpdate' event handler
     *
     * @function actions:selectLesson
     * @returns {undefined}
     */
    selectLesson: function(lesson) {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_LJ_LESSON
      );
      this.set('selectedLesson', lesson);
      this.set('isResourceSelected', false);
      this.loadData(lesson.id);
    },

    onAssessmentReport(content) {
      this.set('attemptContent', content);
      this.set('isShowPortfolioActivityReport', true);
    },

    /**
     * Load the report data for this collection / assessment
     * @function actions:CollectionReport
     * @returns {undefined}
     */
    studentReport: function(collection) {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_LJ_LESSON_REPORT);
      let currentClass = component.get('currentClass');
      let userId = currentClass.userId || component.get('studentId');
      let classId = currentClass.classId || component.get('currentClass.id');
      let courseId = currentClass.courseId || component.get('currentCourse.id');
      let unitId = component.get('unitId');
      let lessonId = component.get('model.id');
      let collectionId = collection.get('id');
      let type = collection.get('format');
      let params = {
        userId: userId,
        classId: classId,
        courseId: courseId,
        unitId: unitId,
        lessonId: lessonId,
        collectionId: collectionId,
        type: type,
        collection
      };
      this.sendAction('collectionReport', params);
    },
    showContentTypeBlock: function(container, itemId, item) {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_LJ_LESSON_INFO);
      const userId = component.get('studentId');
      this.$(`.${container}`).slideToggle();
      const requestParam = {
        userId,
        itemId
      };

      let isActive;
      if (this.get('activeItem')) {
        isActive = this.get('activeItem.id') !== itemId;
        if (!isActive) {
          component.toggleProperty('isClose');
        }
      } else {
        isActive = true;
      }
      if (isActive) {
        component.set('isClose', true);
        component.set('activeItem', item);
        component
          .get('portfolioService')
          .getAllAttemptsByItem(requestParam)
          .then(function(activityAttempts) {
            component.set('isShowBlock', true);
            const isAssessment =
              item.get('format') === CONTENT_TYPES.ASSESSMENT;
            if (isAssessment) {
              component.$('.collections .assessment').css('height', 'auto');
            } else {
              component.$('.collections .collection').css('height', 'auto');
            }

            if (!component.isDestroyed) {
              let result = activityAttempts.map(function(data, index) {
                const activeIndex = index + 1;
                data.set('index', activeIndex);
                return data;
              });
              component.set('activityAttempts', result);
            }
          });
      }
    },
    /*
     * @function To open lesson level report
     */
    onOpenStudentLessonReport: function() {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_LJ_LESSON_REPORT);
      let currentClass = component.get('currentClass');
      let userId = currentClass.userId || component.get('studentId');
      let classId = currentClass.classId || component.get('currentClass.id');
      let courseId = currentClass.courseId || component.get('currentCourse.id');
      let unitId = component.get('unitId');
      let lessonId = component.get('model.id');
      let params = {
        classId: classId,
        courseId: courseId,
        unitId: unitId,
        lessonId: lessonId,
        lesson: component.get('model'),
        unit: component.get('unit'),
        lessons: component.get('lessons'),
        userId: userId
      };
      component.sendAction('onOpenStudentLessonReport', params);
    },
    showLessonPlan: function(container) {
      let component = this;
      this.$(`.${container}`).slideToggle();
      component.set('isExpanded', true);
      component.set('isShowLessonPlan', true);
    }
  },

  // -------------------------------------------------------------------------
  // Events
  setupComponent: Ember.on('didInsertElement', function() {
    const component = this;
    this.set('activeElement', this.get('currentResource'));

    this.$().on('hide.bs.collapse', function(e) {
      e.stopPropagation();
      component.set('isExpanded', false);
      component.set('isShowLessonPlan', false);
    });

    this.$().on('show.bs.collapse', function(e) {
      e.stopPropagation();
      component.set('isExpanded', true);
    });
    Ember.run.scheduleOnce('afterRender', this, this.parsedLocationChanged);
    component.setVisibility(this.get('model'), 'lesson');
  }),

  didRender: function() {
    this.$('[data-toggle="tooltip"]').tooltip();
    this.sendAction('onSelectItem');
  },

  removeSubscriptions: Ember.on('willDestroyElement', function() {
    this.$().off('hide.bs.collapse');
    this.$().off('show.bs.collapse');
  }),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @prop {String} - Id of the unit this lesson belongs to
   */
  unitId: null,

  /**
   * Contains only visible units
   * @property {Unit[]} units
   */
  collections: null,

  /**
   * @prop {Boolean} isStudent
   *
   */
  isStudent: Ember.computed.not('isTeacher'),

  /**
   * @prop {Boolean} isResourceSelected
   *
   */
  isResourceSelected: false,

  isShowPortfolioActivityReport: false,

  attemptContent: null,

  /**
   * @prop {Boolean} Indicate if the lesson is selected as active element to study
   */
  isLessonSelected: Ember.computed(
    'isExpanded',
    'isStudent',
    'isResourceSelected',
    'showLocation',
    function() {
      return (
        this.get('isStudent') &&
        this.get('isExpanded') &&
        !this.get('isResourceSelected') &&
        !this.get('showLocation')
      );
    }
  ),

  /**
   * Indicates the status of the spinner
   * @property {Boolean}
   */
  loading: false,

  selectedLesson: null,

  // -------------------------------------------------------------------------
  // Observers

  /**
   * Observe changes to 'parsedLocation' to update the accordion's status
   * (expanded/collapsed).
   */
  parsedLocationChanged: Ember.observer('parsedLocation.[]', function() {
    const parsedLocation = this.get('parsedLocation');
    if (parsedLocation) {
      let lessonId = parsedLocation[1];
      this.updateAccordionById(lessonId);
    }
  }),
  /**
   * Observe changes when expands or collapse a lesson.
   */
  removedActiveLocation: Ember.observer('isExpanded', function() {
    if (this.get('isStudent') && !this.get('isExpanded')) {
      this.set('activeElement', '');
    }
  }),
  /**
   * Removed the selected element if the user decide to show the current location
   */
  showMyLocation: Ember.observer('showLocation', 'toggleLocation', function() {
    var divPosition =
      $('.panel.selected').offset() || $('.panel.study-active').offset();

    if (this.get('showLocation')) {
      if (divPosition) {
        $('html, body').animate(
          {
            scrollTop: divPosition.top - 80
          },
          'slow'
        );
      }
      this.set('activeElement', '');
    }
  }),
  // -------------------------------------------------------------------------
  // Methods

  /**
   * Load the collections for the lesson
   *
   * @function
   * @returns {undefined}
   */
  loadData: function(lesson) {
    const component = this;
    const userId =
      component.get('currentClass.userId') || component.get('studentId');
    const classId =
      component.get('currentClass.classId') || component.get('currentClass.id');
    const courseId =
      component.get('currentClass.courseId') ||
      component.get('currentCourse.id');
    const unitId = component.get('unitId');
    const lessonId = lesson;
    const classMembers = component.get('classMembers');
    const isTeacher = component.get('isTeacher');
    const isTeacherProfile = !component.get('currentClass.isStudentProfile');
    let collections = Ember.A();
    let lessonPeers = Ember.A();
    let selectedLesson = component.get('selectedLesson');

    component.set('loading', true);

    let peersPromise = classId
      ? component
        .get('analyticsService')
        .getLessonPeers(classId, courseId, unitId, lessonId)
      : Ember.RSVP.resolve(lessonPeers);
    return Ember.RSVP.hash({
      lesson: selectedLesson.collections
        ? selectedLesson
        : component
          .get('courseMapService')
          .getLessonInfo(
            classId,
            courseId,
            unitId,
            lessonId,
            isTeacherProfile,
            userId
          ),
      peers: peersPromise
    })
      .then(({ lesson, peers }) => {
        collections = lesson.get('children') || lesson.get('collections');
        let userId = component.get('studentId');
        let collectionIds = collections.mapBy('id');
        let lessonParam = {
          userId,
          collectionIds
        };
        let collectionComp = collections
          .mapBy('gutCode')
          .flat(1)
          .filter(item => item);
        if (collectionComp.length) {
          let userId = component.get('studentId');
          let classId = component.get('classId');
          let param = {
            data: {
              competencyCodes: new Set([...collectionComp]),
              subject: component.get('currentClass.preference.subject'),
              userId,
              classId
            }
          };
          let userRole = component.get('session.role');
          if (userRole === 'teacher') {
            Ember.RSVP.hash({
              statusList: component
                .get('competencyService')
                .fetchCompetency(param),
              lessonState: component
                .get('lessonService')
                .itemLesson(lessonParam)
            }).then(({ statusList, lessonState }) => {
              collections.forEach(item => {
                let statusCode = statusList.filter(
                  list =>
                    item.gutCode &&
                    item.gutCode.indexOf(list.competencyCode) !== -1
                );
                let lowestStatus = '';
                if (statusCode.length && lessonState[item.id]) {
                  let total = statusCode.length;
                  let completed = statusCode.filter(item => item.status > 1)
                    .length;
                  let notstaterd = statusCode.filter(item => !item.status)
                    .length;
                  lowestStatus =
                    total === completed ? 4 : notstaterd === total ? 0 : 1;
                }

                item.set('status', lowestStatus);
              });
            });
          }
        }
        lessonPeers = peers;
        let loadDataPromise = Ember.RSVP.resolve();
        if (classId) {
          isTeacher
            ? component
              .loadTeacherData(
                classId,
                courseId,
                unitId,
                lessonId,
                classMembers,
                lessonPeers,
                collections
              )
              .then(function() {
                loadDataPromise = component.loadCollectionData(
                  classId,
                  courseId,
                  unitId,
                  lessonId,
                  classMembers,
                  collections
                );
              })
            : (loadDataPromise = component.loadStudentData(
              userId,
              classId,
              courseId,
              unitId,
              lessonId,
              classMembers,
              lessonPeers,
              collections
            ));
        } else {
          loadDataPromise = component.loadLearnerData(
            courseId,
            unitId,
            lessonId,
            classMembers,
            lessonPeers,
            collections
          );
        }
        return loadDataPromise;
      })
      .then(() => {
        if (!component.isDestroyed) {
          collections.map(collection => {
            component.setVisibility(collection, collection.format);
          });
          component.set('items', collections);
          component.set('loading', false);
        }
      });
  },
  loadTeacherData: function(
    classId,
    courseId,
    unitId,
    lessonId,
    classMembers,
    lessonPeers,
    collections
  ) {
    const component = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      component
        .get('performanceService')
        .findClassPerformanceByUnitAndLesson(
          classId,
          courseId,
          unitId,
          lessonId,
          classMembers
        )
        .then(function(performance) {
          const promises = collections.map(function(collection) {
            const isAssessment = collection.get('format') === 'assessment';
            const isExternalAssessment =
              collection.get('format') === 'assessment-external';
            collection.set('isExternalAssessment', isExternalAssessment);
            const collectionId = collection.get('id');
            const peer = lessonPeers.findBy('id', collectionId);
            const assessmentDataPromise = isAssessment
              ? component.get('assessmentService').readAssessment(collectionId)
              : Ember.RSVP.resolve(true);
            return assessmentDataPromise.then(function(assessmentData) {
              const averageScore = performance.calculateAverageScoreByItem(
                collectionId
              );
              const timeSpent = performance.calculateAverageTimeSpentByItem(
                collectionId
              );
              const completionDone = performance.calculateSumCompletionDoneByItem(
                collectionId
              );
              const completionTotal = performance.calculateSumCompletionTotalByItem(
                collectionId
              );

              collection.set(
                'performance',
                Ember.Object.create({
                  score: averageScore,
                  hasStarted: averageScore > 0 || timeSpent > 0,
                  isDisabled: isAssessment
                    ? !assessmentData.get('classroom_play_enabled')
                    : undefined,
                  isCompleted:
                    completionDone > 0 && completionDone >= completionTotal
                })
              );

              if (peer) {
                return component
                  .get('profileService')
                  .readMultipleProfiles(peer.get('peerIds'))
                  .then(function(profiles) {
                    collection.set('members', profiles);
                  });
              }
            });
          });
          Ember.RSVP.all(promises).then(resolve, reject);
        });
    });
  },

  loadCollectionData: function(
    classId,
    courseId,
    unitId,
    lessonId,
    classMembers,
    collections
  ) {
    const component = this;
    return new Ember.RSVP.Promise(function() {
      component
        .get('performanceService')
        .findClassPerformanceByUnitAndLesson(
          classId,
          courseId,
          unitId,
          lessonId,
          classMembers,
          {
            collectionType: CONTENT_TYPES.COLLECTION
          }
        )
        .then(function(performance) {
          collections.map(function(collection) {
            const isCollection = collection.get('format') === 'collection';
            const isExternalCollection =
              collection.get('format') === 'collection-external';
            const timeSpent = performance.calculateAverageTimeSpentByItem(
              collection.get('id')
            );
            if (isCollection || isExternalCollection) {
              collection.set('performance.timeSpent', timeSpent);
              collection.set('performance.hasStarted', timeSpent > 0);
            }
          });
          Ember.RSVP.resolve(true);
        });
    });
  },

  loadStudentData: function(
    userId,
    classId,
    courseId,
    unitId,
    lessonId,
    classMembers,
    lessonPeers,
    collections
  ) {
    const component = this;
    const isResourceSelected = collections.findBy(
      'id',
      this.get('activeElement')
    );

    if (!(component.get('isDestroyed') || component.get('isDestroying'))) {
      component.set('isResourceSelected', isResourceSelected);
    }

    return new Ember.RSVP.Promise(function(resolve, reject) {
      const classMinScore = component.get('currentClass.minScore');
      Ember.RSVP.hash({
        performanceAssessment: component
          .get('performanceService')
          .findStudentPerformanceByLesson(
            userId,
            classId,
            courseId,
            unitId,
            lessonId,
            collections,
            {
              collectionType: CONTENT_TYPES.ASSESSMENT
            }
          ),
        performanceCollection: component
          .get('performanceService')
          .findStudentPerformanceByLesson(
            userId,
            classId,
            courseId,
            unitId,
            lessonId,
            collections,
            {
              collectionType: CONTENT_TYPES.COLLECTION
            }
          )
      }).then(({ performanceAssessment, performanceCollection }) => {
        let assessments = performanceAssessment.filterBy('type', 'assessment');
        let collection = performanceCollection.filterBy('type', 'collection');
        let externalCollection = performanceCollection.filterBy(
          'type',
          'collection-external'
        );
        let externalAssessment = performanceCollection.filterBy(
          'type',
          'assessment-external'
        );

        let performance = assessments.concat(
          collection,
          externalCollection,
          externalAssessment
        );
        const promises = collections.map(function(collection) {
          const collectionId = collection.get('id');
          const isAssessment = collection.get('format') === 'assessment';
          const isExternalAssessment =
            collection.get('format') === 'assessment-external';
          const isResource =
            collection.get('format') !== CONTENT_TYPES.ASSESSMENT &&
            collection.get('format') !== CONTENT_TYPES.EXTERNAL_ASSESSMENT &&
            collection.get('format') !== CONTENT_TYPES.EXTERNAL_COLLECTION &&
            collection.get('format') !== CONTENT_TYPES.COLLECTION &&
            collection.get('format') !== CONTENT_TYPES.OFFLINE_ACTIVITY;
          const peer = lessonPeers.findBy('id', collectionId);
          if (peer) {
            component
              .get('profileService')
              .readMultipleProfiles(peer.get('peerIds'))
              .then(function(profiles) {
                collection.set('members', profiles);
              });
          }

          collection.set('isResource', isResource);
          collection.set('isAssessment', isAssessment);
          collection.set('isExternalAssessment', isExternalAssessment);

          const collectionPerformanceData = performance.findBy(
            'id',
            collectionId
          );
          if (collectionPerformanceData) {
            const score = collectionPerformanceData.get('score');
            const timeSpent = collectionPerformanceData.get('timeSpent');
            const completionDone = collectionPerformanceData.get(
              'completionDone'
            );
            const completionTotal = collectionPerformanceData.get(
              'completionTotal'
            );

            const hasStarted = score > 0 || timeSpent > 0;
            const isCompleted =
              completionDone > 0 && completionDone >= completionTotal;
            const hasTrophy =
              score && score > 0 && classMinScore && score >= classMinScore;

            collectionPerformanceData.set('timeSpent', timeSpent);
            collectionPerformanceData.set('hasTrophy', hasTrophy);
            collectionPerformanceData.set('hasStarted', hasStarted);
            collectionPerformanceData.set('isCompleted', isCompleted);

            collection.set('performance', collectionPerformanceData);

            let showTrophy =
              collection.get('performance.hasTrophy') &&
              component.get('isStudent') &&
              !collection.get('collectionSubType');
            collection.set('showTrophy', showTrophy);
          }
        });
        Ember.RSVP.all(promises).then(resolve, reject);
      });
    });
  },

  loadLearnerData: function(
    courseId,
    unitId,
    lessonId,
    classMembers,
    lessonPeers,
    collections
  ) {
    const component = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      const classMinScore = component.get('currentClass.minScore');
      Ember.RSVP.hash({
        performanceAssessment: component
          .get('learnerService')
          .fetchPerformanceLesson(
            courseId,
            unitId,
            lessonId,
            CONTENT_TYPES.ASSESSMENT
          ),
        performanceCollection: component
          .get('learnerService')
          .fetchPerformanceLesson(
            courseId,
            unitId,
            lessonId,
            CONTENT_TYPES.COLLECTION
          )
      }).then(({ performanceAssessment, performanceCollection }) => {
        let performance = performanceAssessment.concat(performanceCollection);
        const promises = collections.map(function(collection) {
          const collectionId = collection.get('id');
          const isAssessment = collection.get('format') === 'assessment';
          const isResource =
            collection.get('format') !== CONTENT_TYPES.ASSESSMENT &&
            collection.get('format') !== CONTENT_TYPES.EXTERNAL_ASSESSMENT &&
            collection.get('format') !== CONTENT_TYPES.EXTERNAL_COLLECTION &&
            collection.get('format') !== CONTENT_TYPES.COLLECTION &&
            collection.get('format') !== CONTENT_TYPES.OFFLINE_ACTIVITY;
          const peer = lessonPeers.findBy('id', collectionId);
          if (peer) {
            component
              .get('profileService')
              .readMultipleProfiles(peer.get('peerIds'))
              .then(function(profiles) {
                collection.set('members', profiles);
              });
          }

          collection.set('isResource', isResource);

          const collectionPerformanceData = performance.findBy(
            'collectionId',
            collectionId
          );
          if (collectionPerformanceData) {
            const score = collectionPerformanceData.get('scoreInPercentage');
            const timeSpent = collectionPerformanceData.get('timeSpent');
            const completionDone = collectionPerformanceData.get(
              'completedCount'
            );
            const completionTotal = collectionPerformanceData.get('totalCount');
            const hasStarted = score > 0 || timeSpent > 0;
            const isCompleted =
              completionDone > 0 && completionDone >= completionTotal;
            const hasTrophy =
              score && score > 0 && classMinScore && score >= classMinScore;

            collectionPerformanceData.set('timeSpent', timeSpent);
            collectionPerformanceData.set('hasTrophy', hasTrophy);
            collectionPerformanceData.set('hasStarted', hasStarted);
            collectionPerformanceData.set('isCompleted', isCompleted);

            collection.set('performance', collectionPerformanceData);

            let showTrophy =
              collection.get('performance.hasTrophy') &&
              component.get('isStudent') &&
              !collection.get('collectionSubType');
            collection.set('showTrophy', showTrophy);

            const attempts = collectionPerformanceData.get('attempts');
            if (isAssessment) {
              return component
                .get('assessmentService')
                .readAssessment(collectionId)
                .then(function(assessment) {
                  const attemptsSettings = assessment.get('attempts');
                  if (attemptsSettings) {
                    const noMoreAttempts =
                      attempts &&
                      attemptsSettings > 0 &&
                      attempts >= attemptsSettings;
                    collectionPerformanceData.set(
                      'noMoreAttempts',
                      noMoreAttempts
                    );
                    collectionPerformanceData.set(
                      'isDisabled',
                      !assessment.get('classroom_play_enabled')
                    );
                  }
                });
            } else {
              return Ember.RSVP.resolve(true);
            }
          }
        });
        Ember.RSVP.all(promises).then(resolve, reject);
      });
    });
  },
  setVisibility: function(collection, type = false) {
    if (
      this.get('contentVisibility') &&
      this.get('contentVisibility.course') &&
      this.get('contentVisibility.course.units')
    ) {
      this.get('contentVisibility.course.units').filter(unit => {
        if (unit.lessons) {
          unit.lessons.filter(lesson => {
            if (lesson.id === collection.id) {
              const visible = lesson.visible === 'on';
              collection.set('visible', visible);
            }
            let content;
            if (type === 'collection') {
              content = lesson.collections;
            } else if (type === 'assessment') {
              content = lesson.assessments;
            }
            if (content) {
              content.filter(assessment => {
                if (assessment.id === collection.id) {
                  if (
                    this.get('contentVisibility').contentVisibility ===
                      'visible_collections' &&
                    type === 'assessment' &&
                    this.get('isStudent')
                  ) {
                    collection.set('visible', false);
                  } else {
                    const visible = assessment.visible === 'on';
                    collection.set('visible', visible);
                  }
                }
              });
            }
          });
        }
      });
    }
  }
});
