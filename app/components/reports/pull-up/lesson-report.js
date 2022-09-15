import Ember from 'ember';
import {
  aggregateMilestonePerformanceScore,
  aggregateMilestonePerformanceTimeSpent
} from 'gooru-web/utils/performance-data';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'backdrop-pull-ups', 'pull-up-lesson-report'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {PerformanceService}
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * @type {LessonService} Service to retrieve lesson information
   */
  lessonService: Ember.inject.service('api-sdk/lesson'),

  courseMapService: Ember.inject.service('api-sdk/course-map'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when the user invoke the pull up.
     **/
    onPullUpClose(closeAll) {
      this.closePullUp(closeAll);
    },

    onChooseCollectionView() {
      this.set('filterByCollectionType', 'collection');
    },

    onChooseAssessmentView() {
      this.set('filterByCollectionType', 'assessment');
    },

    onToggleTimeSpentFlt() {
      this.toggleProperty('isTimeSpentFltApplied');
    },

    onClickPrev() {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_LJ_IS_UNIT_REPORT_PRE);
      component
        .$(
          '.lesson-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let lessons = component.get('lessonsHasPerformance');
      let selectedElement = component.$(
        '.lesson-report-container #report-carousel-wrapper .item.active'
      );
      let currentIndex = selectedElement.data('item-index');
      let selectedIndex = selectedElement.data('item-index') - 1;
      if (currentIndex === 0) {
        selectedIndex = lessons.length - 1;
      }
      component.set('selectedLesson', lessons.objectAt(selectedIndex));
      component
        .$('.lesson-report-container #report-carousel-wrapper')
        .carousel('prev');
      if (component.get('isShowMilestoneReport')) {
        component.loadMilestoneLessonsPerformanceData();
      } else {
        component.loadData();
      }
    },

    onClickNext() {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_LJ_IS_UNIT_REPORT_NEXT);
      component
        .$(
          '.lesson-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let lessons = component.get('lessonsHasPerformance');
      let selectedElement = component.$(
        '.lesson-report-container #report-carousel-wrapper .item.active'
      );
      let currentIndex = selectedElement.data('item-index');
      let selectedIndex = currentIndex + 1;
      if (lessons.length - 1 === currentIndex) {
        selectedIndex = 0;
      }
      component.set('selectedLesson', lessons.objectAt(selectedIndex));
      component
        .$('.lesson-report-container #report-carousel-wrapper')
        .carousel('next');
      if (component.get('isShowMilestoneReport')) {
        component.loadMilestoneLessonsPerformanceData();
      } else {
        component.loadData();
      }
    },

    openCollectionReport(collection, collections) {
      let component = this;
      let params = {
        classId: component.get('classId'),
        courseId: component.get('courseId'),
        unitId: component.get('unitId'),
        lessonId: component.get('lessonId'),
        collection: collection,
        lessonModel: component.get('selectedLesson'),
        unitModel: component.get('unit'),
        collections: collections,
        classMembers: component.get('classMembers')
      };
      if (component.get('isShowMilestoneReport')) {
        const selectedLesson = component.get('selectedLesson');
        params.lessonId = selectedLesson.get('lesson_id');
        params.lessonModel.id = selectedLesson.get('lesson_id');
        params.unitModel.id = selectedLesson.get('unit_id');
        params.unitId = selectedLesson.get('unit_id');
      }
      this.sendAction('teacherCollectionReport', params);
    },

    onClosePullUp() {
      let component = this;
      component.set('showStudentLessonReport', false);
      component.closePullUp(true);
    },

    openStudentLessonReport(userId) {
      this.onOpenStudentLessonReport(userId);
    },

    onClickChart(userId, showReport) {
      if (showReport && !this.get('isShowMilestoneReport')) {
        this.onOpenStudentLessonReport(userId);
      }
    },

    sortByFirstName() {
      let component = this;
      component.toggleProperty('sortByFirstnameEnabled');
      if (component.get('sortByFirstnameEnabled')) {
        component.set(
          'collectionStudentReportData',
          component.get('collectionStudentReportData').sortBy('firstName')
        );
        component.set(
          'assessmentStudentReportData',
          component.get('assessmentStudentReportData').sortBy('firstName')
        );
      } else {
        component.set(
          'collectionStudentReportData',
          component
            .get('collectionStudentReportData')
            .sortBy('firstName')
            .reverse()
        );
        component.set(
          'assessmentStudentReportData',
          component
            .get('assessmentStudentReportData')
            .sortBy('firstName')
            .reverse()
        );
      }
    },

    sortByLastName() {
      let component = this;
      component.toggleProperty('sortByLastnameEnabled');
      if (component.get('sortByLastnameEnabled')) {
        component.set(
          'collectionStudentReportData',
          component.get('collectionStudentReportData').sortBy('lastName')
        );
        component.set(
          'assessmentStudentReportData',
          component.get('assessmentStudentReportData').sortBy('lastName')
        );
      } else {
        component.set(
          'collectionStudentReportData',
          component
            .get('collectionStudentReportData')
            .sortBy('lastName')
            .reverse()
        );
        component.set(
          'assessmentStudentReportData',
          component
            .get('assessmentStudentReportData')
            .sortBy('lastName')
            .reverse()
        );
      }
    },

    sortByScore() {
      let component = this;
      component.toggleProperty('sortByScoreEnabled');
      let assessmentStudentReportData;
      if (component.get('sortByScoreEnabled')) {
        assessmentStudentReportData = component
          .get('assessmentStudentReportData')
          .sortBy('score')
          .reverse();
      } else {
        assessmentStudentReportData = component
          .get('assessmentStudentReportData')
          .sortBy('score');
      }
      component.set('assessmentStudentReportData', assessmentStudentReportData);
    },

    sortByTimeSpent() {
      let component = this;
      component.toggleProperty('sortByTimeSpentEnabled');
      let collectionStudentReportData;
      if (component.get('sortByTimeSpentEnabled')) {
        collectionStudentReportData = component
          .get('collectionStudentReportData')
          .sortBy('totalTimeSpent')
          .reverse();
      } else {
        collectionStudentReportData = component
          .get('collectionStudentReportData')
          .sortBy('totalTimeSpent');
      }
      component.set('collectionStudentReportData', collectionStudentReportData);
    },
    reportClose() {
      let component = this;
      component.$().animate(
        {
          top: '100%'
        },
        400,
        function() {
          component.set('showPullUp', false);
        }
      );
    }
  },

  // -------------------------------------------------------------------------
  // Events

  didRender() {
    this.handleAppContainerScroll();
  },

  didDestroyElement() {
    this.handleAppContainerScroll();
  },
  /**
   * Function to triggered once when the component element is first rendered.
   */
  didInsertElement() {
    this.handleScrollToFixHeader();
    this.openPullUp();
    this.slideToSelectedLesson();
    if (this.get('isShowMilestoneReport')) {
      this.loadMilestoneLessonsPerformanceData();
    } else {
      this.loadData();
    }
  },
  // -------------------------------------------------------------------------
  // Properties

  /**
   * ClassId belongs to this lesson report.
   * @type {String}
   */
  classId: Ember.computed.alias('context.classId'),

  /**
   * CourseId belongs to this lesson report.
   * @type {String}
   */
  courseId: Ember.computed.alias('context.courseId'),

  /**
   * Unit Id belongs to this lesson report.
   * @type {String}
   */
  unitId: Ember.computed.alias('context.unitId'),

  /**
   * Unit belongs to this lesson report.
   * @type {String}
   */
  unit: Ember.computed.alias('context.unit'),

  /**
   * List of lessons mapped to unit.
   * @type {Array}
   */
  lessons: Ember.computed('context.lessons', function() {
    let lessons = this.get('context.lessons').map(lesson => {
      if (
        lesson.get('performance.score') !== null &&
        lesson.get('performance.score') >= 0
      ) {
        lesson.set('performance.hasStarted', true);
      }
      return lesson;
    });
    return lessons;
  }),

  /**
   * List of lessons has performance
   * @type {Array}
   */
  lessonsHasPerformance: Ember.computed('lessons', function() {
    let lessons = this.get('lessons');
    return lessons.filterBy('performance.hasStarted', true);
  }),

  /**
   * lesson
   * @type {Object}
   */
  lesson: null,

  /**
   * Maintains list of lesson items.
   * @type {Array}
   */
  collections: Ember.A([]),

  /**
   * Selected lesson.
   * @type {Object}
   */
  selectedLesson: Ember.computed.alias('context.lesson'),

  /**
   * Propery to hide the default pullup.
   * @property {showPullUp}
   */
  showPullUp: false,

  /**
   * This property will get change based on filter selection, by default timespent filter off.
   * @type {Boolean}
   */
  isTimeSpentFltApplied: false,

  /**
   * List of class members
   * @type {Object}
   */
  classMembers: Ember.computed.alias('context.classMembers'),

  /**
   * Collection Stutent  report data
   * @type {Object}
   */
  collectionStudentReportData: Ember.A([]),

  /**
   * Assessment Stutent  report data
   * @type {Object}
   */
  assessmentStudentReportData: Ember.A([]),

  /**
   * It maintains the state of loading
   * @type {Boolean}
   */
  isLoading: false,

  /**
   * This attribute decide default sorting key
   * @type {String}
   */
  defaultSortCriteria: 'lastName',

  /**
   * Maintain the status of sort by firstName
   * @type {String}
   */
  sortByFirstnameEnabled: false,

  /**
   * Maintain the status of sort by lastName
   * @type {String}
   */
  sortByLastnameEnabled: true,

  /**
   * Maintain the status of sort by score
   * @type {String}
   */
  sortByScoreEnabled: false,

  /**
   * Maintain the status of sort by Time spent
   * @type {String}
   */
  sortByTimeSpentEnabled: false,

  /**
   * Maintains the state of role.
   * @type {Boolean}
   */
  isStudent: Ember.computed.alias('context.isStduent'),

  /**
   * Filter by collection type
   * @type {String}
   */
  filterByCollectionType: 'assessment',

  /**
   * Lesson has collection Only
   * @type {Boolean}
   */
  hasLessonContainsCollectionOnly: Ember.computed('collections', function() {
    return (
      this.get('collections').filterBy('format', 'assessment').length === 0 &&
      this.get('collections').filterBy('format', 'assessment-external')
        .length === 0
    );
  }),

  /**
   * Lesson has assessment Only
   * @type {Boolean}
   */
  hasLessonContainsAssessmentOnly: Ember.computed('collections', function() {
    return (
      this.get('collections').filterBy('format', 'collection').length === 0 &&
      this.get('collections').filterBy('format', 'collection-external')
        .length === 0
    );
  }),

  /**
   * Filtered assessment format
   * @type {Array}
   */
  assessmentList: Ember.computed('collections', function() {
    const component = this;
    const collections = component.get('collections');
    let assessmentList = collections.filter(collection => {
      let collectionType = collection.get('format');
      return (
        collectionType === CONTENT_TYPES.ASSESSMENT ||
        collectionType === CONTENT_TYPES.EXTERNAL_ASSESSMENT ||
        collectionType === CONTENT_TYPES.OFFLINE_ACTIVITY
      );
    });
    return assessmentList;
  }),

  /**
   * Filtered collection format
   * @type {Array}
   */
  collectionList: Ember.computed('collections', function() {
    return this.get('collections').filterBy('format', 'collection');
  }),

  /**
   * Maintains the state of student lesson report
   * @type {Boolean}
   */
  showStudentLessonReport: false,

  //--------------------------------------------------------------------------
  // Methods

  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    let component = this;
    component.$().animate(
      {
        top: '10%'
      },
      400
    );
  },

  closePullUp(closeAll) {
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.set('showPullUp', false);
        if (closeAll) {
          component.sendAction('onClosePullUp', true);
        }
      }
    );
  },

  handleAppContainerScroll() {
    let activePullUpCount = Ember.$(document.body).find('.backdrop-pull-ups')
      .length;
    if (activePullUpCount > 0) {
      Ember.$(document.body).addClass('no-vertical-scroll');
    } else if (activePullUpCount === 0) {
      Ember.$(document.body).removeClass('no-vertical-scroll');
    }
  },

  handleScrollToFixHeader() {
    let component = this;
    component.$('.lesson-report-container .report-content').scroll(function() {
      let scrollTop = component
        .$('.lesson-report-container .report-content')
        .scrollTop();
      let scrollFixed = component.$(
        '.lesson-report-container .report-content .pull-up-lesson-report-listview .on-scroll-fixed'
      );
      let height =
        component
          .$('.lesson-report-container .report-content .report-carousel')
          .height() +
        component
          .$(
            '.lesson-report-container .report-content .report-header-container'
          )
          .height();
      if (scrollTop >= height) {
        let position = scrollTop - height;
        component.$(scrollFixed).css('top', `${position}px`);
      } else {
        component.$(scrollFixed).css('top', '0px');
      }
    });
  },

  slideToSelectedLesson() {
    let component = this;
    let lessons = component.get('lessonsHasPerformance');
    let selectedLesson = component.get('selectedLesson');
    let selectedIndex = lessons.indexOf(selectedLesson);
    component
      .$('.lesson-report-container #report-carousel-wrapper')
      .carousel(selectedIndex);
  },

  loadData() {
    let component = this;
    const classId = this.get('classId');
    let lessonId = component.get('selectedLesson.id');
    let unitId = component.get('unit.id');
    let courseId = component.get('courseId');
    let classMembers = this.get('classMembers');
    const selectedLesson = component.get('selectedLesson');
    const selectedUnit = component.get('unit');
    component.set('isLoading', true);
    return Ember.RSVP.hash({
      lesson: selectedUnit.isUnit0
        ? selectedLesson
        : component.get('lessonService').fetchById(courseId, unitId, lessonId)
    }).then(({ lesson }) => {
      if (!component.isDestroyed) {
        component.set('lesson', lesson);
        component.set(
          'collections',
          lesson.get('children') || lesson.get('collections')
        );
      }
      return Ember.RSVP.hash({
        assessmentPerformance: component
          .get('performanceService')
          .findClassPerformanceByUnitAndLesson(
            classId,
            courseId,
            unitId,
            lessonId,
            classMembers
          )
      }).then(({ assessmentPerformance }) => {
        if (!component.isDestroyed) {
          component.calcluateCollectionPerformance(
            assessmentPerformance,
            'assessment'
          );
          component.parseClassMemberAndPerformanceData(
            assessmentPerformance,
            'assessment'
          );
        }
        return Ember.RSVP.hash({
          collectionPerformance: component
            .get('performanceService')
            .findClassPerformanceByUnitAndLesson(
              classId,
              courseId,
              unitId,
              lessonId,
              classMembers,
              {
                collectionType: 'collection'
              }
            )
        }).then(({ collectionPerformance }) => {
          if (!component.isDestroyed) {
            component.calcluateCollectionPerformance(
              collectionPerformance,
              'collection'
            );
            component.parseClassMemberAndPerformanceData(
              collectionPerformance,
              'collection'
            );
            if (component.get('hasLessonContainsCollectionOnly')) {
              component.set('filterByCollectionType', 'collection');
            }
            component.set('sortByLastnameEnabled', true);
            component.set('sortByFirstnameEnabled', false);
            component.set('sortByScoreEnabled', false);
            component.set('sortByTimeSpentEnabled', false);
            component.set('isLoading', false);
            component.handleCarouselControl();
          }
        });
      });
    });
  },

  calcluateCollectionPerformance(performance, collectionType) {
    let component = this;
    let collections =
      collectionType === CONTENT_TYPES.ASSESSMENT
        ? component.get('assessmentList')
        : component.get('collectionList');

    collections.map(function(collection) {
      let collectionId = collection.get('id');
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
          timeSpent: timeSpent,
          hasStarted: averageScore > 0 || timeSpent > 0,
          isCompleted: completionDone > 0 && completionDone >= completionTotal
        })
      );
      return collection;
    });
  },

  parseClassMemberAndPerformanceData(performance, collectionType) {
    let component = this;
    let classMembers = component.get('classMembers');
    let users = Ember.A([]);
    let usersTotaltimeSpent = Ember.A([]);
    let totalTimeSpent = 0;
    classMembers.forEach(member => {
      let user = component.createUser(member);
      let collections =
        collectionType === CONTENT_TYPES.ASSESSMENT
          ? component.get('assessmentList')
          : component.get('collectionList');
      let performanceData = performance.get('studentPerformanceData');
      let userId = member.get('id');
      let userPerformance = performanceData.findBy('user.id', userId);
      let resultSet = component.parsePerformanceCollectionAndUserData(
        userId,
        collections,
        userPerformance
      );
      user.set('userPerformanceData', resultSet.userPerformanceData);
      user.set('hasStarted', resultSet.hasStarted);
      user.set('totalTimeSpent', resultSet.totalTimeSpent);
      totalTimeSpent = totalTimeSpent + resultSet.totalTimeSpent;
      user.set('score', resultSet.overAllScore);
      user.set('isShowLearnerData', member.isShowLearnerData);
      // Reform score value and store in score-use-for-sort field, to handle sort.
      // -1 defines not started.
      if (!resultSet.hasStarted) {
        user.set('score-use-for-sort', -1);
      } else {
        user.set('score-use-for-sort', resultSet.overAllScore);
      }
      user.set('difference', 100 - resultSet.overAllScore);
      users.pushObject(user);
      usersTotaltimeSpent.push(resultSet.totalTimeSpent);
    });
    users = users.sortBy(component.get('defaultSortCriteria'));
    if (collectionType === 'collection') {
      let maxTimeSpent = Math.max(...usersTotaltimeSpent);
      component.calculateTimeSpentScore(users, maxTimeSpent);
      component.set('collectionStudentReportData', users);
      if (component.get('selectedLesson.performance')) {
        component.set('selectedLesson.performance.timeSpent', totalTimeSpent);
      } else {
        component.set(
          'selectedLesson.performance',
          Ember.Object.create({
            timeSpent: totalTimeSpent
          })
        );
      }
    } else {
      component.set('assessmentStudentReportData', users);
    }
  },

  createUser(user) {
    return Ember.Object.create({
      id: user.get('id'),
      firstName: user.get('firstName'),
      lastName: user.get('lastName'),
      avatarUrl: user.get('avatarUrl')
    });
  },

  parsePerformanceCollectionAndUserData(userId, collections, userPerformance) {
    let userPerformanceData = Ember.A([]);
    let totalScore = 0;
    let totalTimeSpent = 0;
    let hasStarted = false;
    let numberCollectionStarted = 0;
    let collectionResults = userPerformance.get('performanceData');
    collections.forEach((collection, index) => {
      let collectionId = collection.get('id');
      let performanceData = Ember.Object.create({
        id: collection.get('id'),
        sequence: index + 1
      });
      if (userPerformance) {
        let collectionResult = collectionResults.findBy(
          'id',
          `${userId}@${collectionId}`
        );
        if (collectionResult) {
          performanceData.set('hasStarted', true);
          hasStarted = true;
          let score = collectionResult.get('score')
            ? collectionResult.get('score')
            : 0;
          performanceData.set('timeSpent', collectionResult.get('timeSpent'));
          performanceData.set('score', score);
          totalScore = totalScore + score;
          totalTimeSpent = totalTimeSpent + collectionResult.get('timeSpent');
          numberCollectionStarted++;
        } else {
          performanceData.set('hasStarted', false);
        }
      } else {
        performanceData.set('hasStarted', false);
      }
      userPerformanceData.pushObject(performanceData);
    });
    let overAllScore =
      numberCollectionStarted > 0
        ? Math.floor(totalScore / numberCollectionStarted)
        : 0;
    let resultSet = {
      userPerformanceData: userPerformanceData,
      overAllScore: overAllScore,
      hasStarted: hasStarted,
      totalTimeSpent: totalTimeSpent
    };
    return resultSet;
  },

  handleCarouselControl() {
    let component = this;
    let selectedLesson = component.get('selectedLesson');
    let lessons = component.get('lessonsHasPerformance');
    let currentIndex = lessons.indexOf(selectedLesson);
    if (lessons.length - 1 === 0) {
      component
        .$(
          '.lesson-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
    } else {
      if (currentIndex === 0) {
        component
          .$(
            '.lesson-report-container #report-carousel-wrapper .carousel-control.left'
          )
          .addClass('in-active');
      } else {
        component
          .$(
            '.lesson-report-container #report-carousel-wrapper .carousel-control.left'
          )
          .removeClass('in-active');
      }
      if (currentIndex === lessons.length - 1) {
        component
          .$(
            '.lesson-report-container #report-carousel-wrapper .carousel-control.right'
          )
          .addClass('in-active');
      } else {
        component
          .$(
            '.lesson-report-container #report-carousel-wrapper .carousel-control.right'
          )
          .removeClass('in-active');
      }
    }
  },

  calculateTimeSpentScore(users, maxTimeSpent) {
    users.forEach(data => {
      let timeSpentScore = Math.round(
        (data.get('totalTimeSpent') / maxTimeSpent) * 100
      );
      data.set('timeSpentScore', timeSpentScore);
      data.set('timeSpentDifference', 100 - timeSpentScore);
    });
  },

  getLessonPerformanceForClassMember(userId) {
    let component = this;
    let filterByCollectionType = component.get('filterByCollectionType');
    let studentReportData =
      filterByCollectionType === 'collection'
        ? component.get('collectionStudentReportData')
        : component.get('assessmentStudentReportData');
    let userPerformance = studentReportData.findBy('id', userId);
    if (userPerformance.get('hasStarted')) {
      return Ember.Object.create({
        score: userPerformance.get('score'),
        hasStarted: userPerformance.get('hasStarted')
      });
    }
  },

  onOpenStudentLessonReport(userId) {
    let component = this;
    let lesson = Ember.Object.create({
      id: component.get('lesson.id'),
      title: component.get('lesson.title'),
      description: component.get('lesson.description'),
      performance: component.getLessonPerformanceForClassMember(userId)
    });
    let params = {
      classId: component.get('classId'),
      courseId: component.get('courseId'),
      unitId: component.get('unitId'),
      lessonId: component.get('lessonId'),
      lesson: lesson,
      unit: component.get('unit'),
      lessons: component.get('lessons'),
      userId: userId
    };
    component.set('showStudentLessonReport', true);
    component.set('studentLessonReportContext', params);
  },

  loadMilestoneLessonsPerformanceData() {
    const component = this;
    return Ember.RSVP.hash({
      lessonInfo: component.fetchMilestoneLessonInfo(),
      lessonAssessmentsPerformance: component.fetchMilestoneCollectionPerformance(
        CONTENT_TYPES.ASSESSMENT
      ),
      lessonCollectionsPerformance: component.fetchMilestoneCollectionPerformance(
        CONTENT_TYPES.COLLECTION
      )
    }).then(
      ({
        lessonInfo,
        lessonAssessmentsPerformance,
        lessonCollectionsPerformance
      }) => {
        if (!component.isDestroyed) {
          component.set('collections', lessonInfo.get('children'));
          component.parseCollectionsPerformance(
            lessonAssessmentsPerformance.concat(lessonCollectionsPerformance)
          );
          let collections = component.get('collections');

          let assessmentsPerformanceData = collections.filter(collection => {
            let collectionType = collection.get('format');
            return (
              collectionType === CONTENT_TYPES.ASSESSMENT ||
              collectionType === CONTENT_TYPES.EXTERNAL_ASSESSMENT ||
              collectionType === CONTENT_TYPES.OFFLINE_ACTIVITY
            );
          });

          component.set(
            'assessmentStudentReportData',
            component.parseUsersMilestoneCollectionsPerformance(
              assessmentsPerformanceData,
              lessonAssessmentsPerformance
            )
          );
          let collectionsPerformanceData = collections.filter(collection => {
            let collectionType = collection.get('format');
            return (
              collectionType === CONTENT_TYPES.COLLECTION ||
              collectionType === CONTENT_TYPES.EXTERNAL_COLLECTION
            );
          });

          component.set(
            'collectionStudentReportData',
            component.parseUsersMilestoneCollectionsPerformance(
              collectionsPerformanceData,
              lessonCollectionsPerformance
            )
          );
          component.handleCarouselControl();
        }
      }
    );
  },

  /**
   * @function fetchLessonInfo
   */
  fetchMilestoneLessonInfo() {
    const component = this;
    const courseMapService = component.get('courseMapService');
    const lessonId = component.get('selectedLesson.lesson_id');
    const classId = component.get('classId');
    const courseId = component.get('courseId');
    const unitId = component.get('selectedLesson.unit_id');
    return courseMapService.getLessonInfo(
      classId,
      courseId,
      unitId,
      lessonId,
      true
    );
  },

  fetchMilestoneCollectionPerformance(contentType) {
    const component = this;
    const classId = component.get('classId');
    const courseId = component.get('courseId');
    const unitId = component.get('selectedLesson.unit_id');
    const lessonId = component.get('selectedLesson.lesson_id');
    return component
      .get('performanceService')
      .getCollectionsPerformanceByLessonId(
        classId,
        courseId,
        unitId,
        lessonId,
        contentType
      );
  },

  parseCollectionsPerformance(collectionsPerformance) {
    const component = this;
    let collections = component.get('collections');
    if (collections && collections.length && !component.isDestroyed) {
      collections.map(collection => {
        let collectionPerformances = collectionsPerformance.filterBy(
          'collectionId',
          collection.get('id')
        );
        let averageScore = null;
        let averageTimeSpent = null;
        if (collectionPerformances.length) {
          averageScore = aggregateMilestonePerformanceScore(
            collectionPerformances
          );
          averageTimeSpent = aggregateMilestonePerformanceTimeSpent(
            collectionPerformances
          );
        }
        collection.set(
          'performance',
          Ember.Object.create({
            score: averageScore,
            timeSpent: averageTimeSpent,
            hasStarted: averageScore >= 0 || averageTimeSpent >= 0
          })
        );
      });
    }
  },

  parseUsersMilestoneCollectionsPerformance(
    collections,
    collectionsPerformance
  ) {
    const component = this;
    let classMembers = component.get('classMembers');
    let usersCollectionsPerformanceSummary = Ember.A([]);
    let overAllCollectionTimeSpent = 0;
    if (!component.isDestroyed) {
      classMembers.forEach(member => {
        let userContext = component.createUser(member);
        let userId = member.get('id');
        let userCollectionsPerformance = collectionsPerformance.filterBy(
          'userUid',
          userId
        );
        let parsedUserCollectionsPerformance = component.parseMilestoneCollectionsPerformance(
          collections,
          userCollectionsPerformance
        );
        userContext.set(
          'userPerformanceData',
          parsedUserCollectionsPerformance.userPerformanceData
        );
        userContext.set(
          'hasStarted',
          parsedUserCollectionsPerformance.hasStarted
        );
        userContext.set(
          'totalTimeSpent',
          parsedUserCollectionsPerformance.totalTimeSpent
        );
        overAllCollectionTimeSpent +=
          parsedUserCollectionsPerformance.totalTimeSpent;
        if (!parsedUserCollectionsPerformance.hasStarted) {
          userContext.set('score-use-for-sort', -1);
        } else {
          userContext.set(
            'score-use-for-sort',
            parsedUserCollectionsPerformance.averageScore
          );
        }
        userContext.set('score', parsedUserCollectionsPerformance.averageScore);

        usersCollectionsPerformanceSummary.pushObject(userContext);
      });
    }
    component.set(
      'overAllCollectionTimeSpent',
      overAllCollectionTimeSpent ? overAllCollectionTimeSpent : null
    );
    return usersCollectionsPerformanceSummary.sortBy(
      component.get('defaultSortCriteria')
    );
  },

  parseMilestoneCollectionsPerformance(
    collections,
    userCollectionsPerformance
  ) {
    const component = this;
    let userPerformanceData = Ember.A([]);
    let totalScore = 0;
    let totalTimeSpent = 0;
    let isStudentHasStarted = false;
    let numberCollectionStarted = 0;
    if (!component.isDestroyed) {
      collections.forEach((collection, index) => {
        let collectionId = collection.get('id');
        let userCollectionPerformanceData = Ember.Object.create({
          id: collectionId,
          sequence: index + 1,
          hasStarted: false
        });
        if (userCollectionsPerformance && userCollectionsPerformance.length) {
          let userCollectionPerformance = userCollectionsPerformance.findBy(
            'collectionId',
            collection.get('id')
          );
          if (userCollectionPerformance) {
            let collectionScore = userCollectionPerformance.get(
              'performance.scoreInPercentage'
            );
            let collectionTimeSpent = userCollectionPerformance.get(
              'performance.timeSpent'
            );
            userCollectionPerformanceData.set('hasStarted', true);
            userCollectionPerformanceData.set('timeSpent', collectionTimeSpent);
            userCollectionPerformanceData.set('score', collectionScore);
            totalScore += collectionScore > 0 ? collectionScore : 0;
            totalTimeSpent += collectionTimeSpent > 0 ? collectionTimeSpent : 0;
            numberCollectionStarted++;
            isStudentHasStarted = true;
          }
        }
        userPerformanceData.pushObject(userCollectionPerformanceData);
      });
    }
    let averageScore =
      numberCollectionStarted > 0
        ? Math.floor(totalScore / numberCollectionStarted)
        : 0;
    return Ember.Object.create({
      userPerformanceData,
      averageScore,
      hasStarted: isStudentHasStarted,
      totalTimeSpent
    });
  }
});
