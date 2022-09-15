import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { getObjectCopy } from 'gooru-web/utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'backdrop-pull-ups', 'pull-up-student-lesson-report'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/learner
   */
  learnerService: Ember.inject.service('api-sdk/learner'),

  /**
   * @type {PerformanceService}
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

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
    /**
     * Action triggered when the user invoke the pull up.
     **/
    onPullUpClose(closeAll) {
      this.closePullUp(closeAll);
    },

    onClickPrev() {
      let component = this;
      component
        .$(
          '.student-lesson-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let lessons = component.get('lessonsHasPerformance');
      let selectedElement = component.$(
        '.student-lesson-report-container #report-carousel-wrapper .item.active'
      );
      let currentIndex = selectedElement.data('item-index');
      let selectedIndex = selectedElement.data('item-index') - 1;
      if (currentIndex === 0) {
        selectedIndex = lessons.length - 1;
      }
      component.set('selectedLesson', lessons.objectAt(selectedIndex));
      component
        .$('.student-lesson-report-container #report-carousel-wrapper')
        .carousel('prev');
      component.loadData();
    },

    onClickNext() {
      let component = this;
      component
        .$(
          '.student-lesson-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let lessons = component.get('lessonsHasPerformance');
      let selectedElement = component.$(
        '.student-lesson-report-container #report-carousel-wrapper .item.active'
      );
      let currentIndex = selectedElement.data('item-index');
      let selectedIndex = currentIndex + 1;
      if (lessons.length - 1 === currentIndex) {
        selectedIndex = 0;
      }
      component.set('selectedLesson', lessons.objectAt(selectedIndex));
      component
        .$('.student-lesson-report-container #report-carousel-wrapper')
        .carousel('next');
      component.loadData();
    },

    openCollectionReport(collection) {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_LJ_LESSON_REPORT);
      let params = {
        userId: component.get('userId'),
        classId: component.get('classId'),
        courseId: component.get('courseId'),
        unitId: component.get('unit.id'),
        lessonId: component.get('lesson.id'),
        collectionId: collection.get('id'),
        type: collection.get('format'),
        lesson: component.get('lesson'),
        isStudent: component.get('isStudent'),
        isTeacher: component.get('isTeacher'),
        collection,
        isUnit0: component.get('unit.isUnit0')
      };
      let reportType = collection.get('format');
      if (reportType === CONTENT_TYPES.EXTERNAL_ASSESSMENT) {
        component.set('isShowStudentExternalAssessmentReport', true);
        component.set('showCollectionReport', false);
      } else if (reportType === CONTENT_TYPES.OFFLINE_ACTIVITY) {
        component.set('isShowStudentOfflineActivityReport', true);
        params.performance = collection.get('performance');
      } else {
        component.set('isShowStudentExternalAssessmentReport', false);
        component.set('showCollectionReport', true);
      }
      component.set('studentCollectionReportContext', params);
    },

    onClosePullUp() {
      let component = this;
      component.set('isShowStudentExternalAssessmentReport', false);
      component.set('showCollectionReport', false);
      component.closePullUp(true);
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
    this.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
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
    this.initialize();
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * ClassId belongs to this lesson report.
   * @type {String}
   */
  classId: Ember.computed.alias('context.classId'),

  /**
   * Maintains state of user is teacher.
   * @type {Boolean}
   */
  isTeacher: Ember.computed.alias('context.isTeacher'),

  /**
   * Maintains state of user is student.
   * @type {Boolean}
   */
  isStudent: Ember.computed.alias('context.isStudent'),

  /**
   * CourseId belongs to this lesson report.
   * @type {String}
   */
  courseId: Ember.computed.alias('context.courseId'),

  /**
   * Course belongs to this lesson report.
   * @type {String}
   */
  course: Ember.computed.alias('context.course'),

  /**
   * Unit Id belongs to this lesson report.
   * @type {String}
   */
  unitId: Ember.computed.alias('context.unit.id'),

  /**
   * Unit  belongs to this lesson report.
   * @type {String}
   */
  unit: Ember.computed.alias('context.unit'),

  /**
   * Unit  belongs to this lesson report.
   * @type {String}
   */
  lessons: Ember.computed.alias('context.lessons'),

  /**
   * Maintains list of lessons has performance.
   * @type {Array}
   */
  lessonsHasPerformance: Ember.computed('lessons', function() {
    let lessons = this.get('lessons');
    return lessons.get('performance')
      ? lessons.filterBy('performance.hasStarted', true)
      : [];
  }),

  /**
   * Maintains list of lesson items.
   * @type {Array}
   */
  collections: Ember.A([]),

  /**
   * Selected Lesson.
   * @type {Object}
   */
  selectedLesson: Ember.computed.alias('context.lesson'),

  /**
   * Property to hide the default pullup.
   * @property {showPullUp}
   */
  showPullUp: false,

  /**
   * UserId of student report
   * @type {Object}
   */
  userId: Ember.computed.alias('context.userId'),

  /**
   * It maintains the state of loading
   * @type {Boolean}
   */
  isLoading: false,

  /**
   * Maintains the state of collection report pull up
   * @type {Boolean}
   */
  showCollectionReport: false,

  isShowStudentOfflineActivityReport: false,

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
          component.sendAction('onClosePullUp');
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
    component
      .$('.student-lesson-report-container .report-content')
      .scroll(function() {
        let scrollTop = component
          .$('.student-lesson-report-container .report-content')
          .scrollTop();
        let scrollFixed = component.$(
          '.student-lesson-report-container .report-content .on-scroll-fixed'
        );
        let reportCarouselTagsHeight =
          component
            .$(
              '.student-lesson-report-container .report-content .report-carousel-tags'
            )
            .height() + 15;
        if (scrollTop >= reportCarouselTagsHeight) {
          let position = scrollTop - reportCarouselTagsHeight;
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
      .$('.student-lesson-report-container #report-carousel-wrapper')
      .carousel(selectedIndex);
  },

  loadData() {
    let component = this;
    const classId = this.get('classId');
    let courseId = component.get('courseId');
    let unitId = component.get('unitId');
    const unit = component.get('unit');
    let lessonId = component.get('selectedLesson.id');
    let selectedLesson = component.get('selectedLesson');
    if (unit.isUnit0) {
      selectedLesson = unit.get('lessons').findBy('lesson_id', lessonId);
    }
    component.set('isLoading', true);
    return Ember.RSVP.hash({
      lesson: unit.isUnit0
        ? selectedLesson
        : component
          .get('courseMapService')
          .getLessonInfo(classId, courseId, unitId, lessonId, false)
    }).then(({ lesson }) => {
      if (!component.isDestroyed) {
        component.set('lesson', lesson);
        component.set(
          'collections',
          lesson.get('children') || lesson.get('collections')
        );
      }
      if (classId) {
        component.fetchClassCollectionPerformance();
      } else {
        component.fetchNonClassCollectionPerformance();
      }
    });
  },

  fetchClassCollectionPerformance() {
    let component = this;
    const classId = this.get('classId');
    let courseId = component.get('courseId');
    let unitId = component.get('unitId');
    let lessonId = component.get('selectedLesson.id');
    let userId = component.get('userId');
    let collections = component.get('collections');

    let collectionList = collections.filterBy(
      'format',
      CONTENT_TYPES.COLLECTION
    );

    let assessmentList = collections.filter(collection => {
      let collectionType = collection.get('format');
      return (
        collectionType === CONTENT_TYPES.ASSESSMENT ||
        collectionType === CONTENT_TYPES.EXTERNAL_ASSESSMENT ||
        collectionType === CONTENT_TYPES.OFFLINE_ACTIVITY
      );
    });

    Ember.RSVP.hash({
      collectionsPerformance: component
        .get('performanceService')
        .findStudentPerformanceByLesson(
          userId,
          classId,
          courseId,
          unitId,
          lessonId,
          collectionList,
          {
            collectionType: 'collection'
          }
        ),
      assessmentsPerformance: component
        .get('performanceService')
        .findStudentPerformanceByLesson(
          userId,
          classId,
          courseId,
          unitId,
          lessonId,
          assessmentList
        )
    }).then(({ collectionsPerformance, assessmentsPerformance }) => {
      if (!component.isDestroyed) {
        let performances = assessmentsPerformance.concat(
          collectionsPerformance
        );
        component.renderCollectionsPerformance(performances, 'id');
        component.set('isLoading', false);
        component.handleCarouselControl();
      }
    });
  },

  fetchNonClassCollectionPerformance() {
    let component = this;
    let lessonId = component.get('selectedLesson.id');
    let unitId = component.get('unitId');
    let courseId = component.get('courseId');
    Ember.RSVP.hash({
      assessmentPerformance: component
        .get('learnerService')
        .fetchPerformanceLesson(
          courseId,
          unitId,
          lessonId,
          CONTENT_TYPES.ASSESSMENT
        ),
      collectionPerformance: component
        .get('learnerService')
        .fetchPerformanceLesson(
          courseId,
          unitId,
          lessonId,
          CONTENT_TYPES.COLLECTION
        )
    }).then(({ assessmentPerformance, collectionPerformance }) => {
      let collectionsPerformance = assessmentPerformance.concat(
        collectionPerformance
      );
      if (!component.isDestroyed) {
        component.renderCollectionsPerformance(
          collectionsPerformance,
          'collectionId'
        );
        component.set('isLoading', false);
        component.handleCarouselControl();
      }
    });
  },

  renderCollectionsPerformance(collectionsPerformance, key) {
    let component = this;
    let collections = component.get('collections');
    collections.forEach(collection => {
      let collectionPerformance = collectionsPerformance.findBy(
        key,
        collection.get('id')
      );
      if (collectionPerformance) {
        collection.set('performance', collectionPerformance);
      }
    });
  },

  handleCarouselControl() {
    let component = this;
    let lessons = component.get('lessonsHasPerformance');
    let selectedLesson = lessons.findBy(
      'id',
      component.get('selectedLesson.id')
    );
    let currentIndex = lessons.indexOf(selectedLesson);
    if (lessons.length - 1 === 0) {
      component
        .$(
          '.student-lesson-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
    } else {
      if (currentIndex === 0) {
        component
          .$(
            '.student-lesson-report-container #report-carousel-wrapper .carousel-control.left'
          )
          .addClass('in-active');
      } else {
        component
          .$(
            '.student-lesson-report-container #report-carousel-wrapper .carousel-control.left'
          )
          .removeClass('in-active');
      }
      if (currentIndex === lessons.length - 1) {
        component
          .$(
            '.student-lesson-report-container #report-carousel-wrapper .carousel-control.right'
          )
          .addClass('in-active');
      } else {
        component
          .$(
            '.student-lesson-report-container #report-carousel-wrapper .carousel-control.right'
          )
          .removeClass('in-active');
      }
    }
  },

  initialize() {
    const classId = this.get('classId');
    if (classId) {
      this.fetchClassLessonPerformance();
    } else {
      this.fetchNonClassLessonPerformance();
    }
  },

  fetchClassLessonPerformance() {
    let component = this;
    const classId = this.get('classId');
    let courseId = component.get('courseId');
    let userId = component.get('userId');
    let unitId = component.get('unitId');
    return Ember.RSVP.hash({
      lessonsPerformance: component
        .get('performanceService')
        .findStudentPerformanceByUnit(
          userId,
          classId,
          courseId,
          unitId,
          component.get('lessons')
        )
    }).then(({ lessonsPerformance }) => {
      if (!component.isDestroyed) {
        component.renderLessonsPerformance(lessonsPerformance, 'id');
        component.loadData();
      }
    });
  },

  fetchNonClassLessonPerformance() {
    let component = this;
    let unitId = component.get('unitId');
    let courseId = component.get('courseId');
    Ember.RSVP.hash({
      lessonsPerformance: component
        .get('learnerService')
        .fetchPerformanceUnit(courseId, unitId, CONTENT_TYPES.ASSESSMENT)
    }).then(({ lessonsPerformance }) => {
      if (!component.isDestroyed) {
        component.renderLessonsPerformance(lessonsPerformance, 'lessonId');
        component.loadData();
      }
    });
  },

  renderLessonsPerformance(lessonsPerformance, key) {
    let component = this;
    let lessons = component.get('lessons');
    const unit = component.get('unit');
    let lessonList = Ember.A([]);
    lessons.forEach(lesson => {
      let lessonCopy = unit.isUnit0 ? getObjectCopy(lesson) : lesson.copy();
      let lessonPerformance = lessonsPerformance.findBy(key, lesson.get('id'));
      lessonCopy.set('performance', lessonPerformance);
      lessonList.pushObject(lessonCopy);
    });
    component.set('lessons', lessonList);
  }
});
