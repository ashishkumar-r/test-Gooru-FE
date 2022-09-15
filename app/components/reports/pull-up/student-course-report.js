import Ember from 'ember';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { getObjectCopy } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'backdrop-pull-ups', 'pull-up-student-course-report'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {PerformanceService}
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * @requires service:api-sdk/learner
   */
  learnerService: Ember.inject.service('api-sdk/learner'),

  /**
   * @type {Session}
   */
  session: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when the user invoke the pull up.
     **/
    onPullUpClose(closeAll) {
      this.closePullUp(closeAll);
    },

    /**
     * Action triggered when click unit report.
     * @param  {Unit} unit
     * @param  {Units} units
     */
    openUnitReport(unit, units) {
      let component = this;
      let params = {
        classId: component.get('classId'),
        isTeacher: component.get('isTeacher'),
        isStudent: component.get('isStudent'),
        courseId: component.get('courseId'),
        unitId: unit.get('id'),
        unit: unit,
        units: units,
        userId: component.get('userId')
      };
      component.set('showUnitReport', true);
      component.set('studentUnitReportContext', params);
    },

    onClosePullUp() {
      let component = this;
      component.set('showUnitReport', false);
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
    this.loadData();
  },
  // -------------------------------------------------------------------------
  // Properties

  /**
   * ClassId belongs to this course report.
   * @type {String}
   */
  classId: Ember.computed.alias('context.classId'),

  /**
   * Class belongs to this course report.
   * @type {String}
   */
  class: Ember.computed.alias('context.class'),

  /**
   * Performance belongs to this course report.
   * @type {String}
   */
  performance: Ember.computed.alias('context.performance'),

  /**
   * Maintains the performance summary data of class and non class
   * @type {Object}
   */
  performanceSummary: Ember.computed('class', 'performance', function() {
    let classes = this.get('class');
    if (classes) {
      return this.get('class.performanceSummary');
    } else {
      return this.get('performance');
    }
  }),

  /**
   * CourseId belongs to this course report.
   * @type {String}
   */
  courseId: Ember.computed.alias('context.courseId'),

  /**
   * Course belongs to this course report.
   * @type {String}
   */
  course: Ember.computed.alias('context.course'),

  /**
   * Maintains list of course items.
   * @type {Array}
   */
  units: Ember.computed('context.course', function() {
    let units = this.get('context.course.children');
    return units;
  }),

  /**
   * Property to hide the default pullup.
   * @property {showPullUp}
   */
  showPullUp: false,

  /**
   * Student user id
   * @type {Object}
   */
  userId: Ember.computed.alias('context.userId'),

  /**
   * It maintains the state of loading
   * @type {Boolean}
   */
  isLoading: false,

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('course.taxonomy.[]', function() {
    let standards = this.get('course.taxonomy');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
      return TaxonomyTag.getTaxonomyTags(standards);
    }
  }),

  /**
   * Maintains the state of unit report.
   * @type {Boolean}
   */
  showUnitReport: false,

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
   * It will decided the necessity of load units performance
   * @type {Boolean}
   */
  loadUnitsPerformance: Ember.computed.alias('context.loadUnitsPerformance'),

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

  closePullUp(closePullUp) {
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.set('showPullUp', false);
        if (closePullUp) {
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
      .$('.student-course-report-container .report-content')
      .scroll(function() {
        let scrollTop = component
          .$('.student-course-report-container .report-content')
          .scrollTop();
        let scrollFixed = component.$(
          '.student-course-report-container .report-content  .on-scroll-fixed'
        );
        let reportCarouselTagsHeight =
          component
            .$(
              '.student-course-report-container .report-content .report-carousel-tags'
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

  loadData() {
    let component = this;
    if (component.get('loadUnitsPerformance')) {
      const classId = this.get('classId');
      component.set('isLoading', true);
      if (component.get('isTeacher')) {
        component.getStudentClassPerformance();
      }
      if (classId) {
        component.fetchClassUnitPerformance();
      } else {
        component.fetchNonClassUnitPerformance();
      }
    }
  },

  fetchClassUnitPerformance() {
    let component = this;
    let units = component.get('units');
    const classId = this.get('classId');
    let courseId = component.get('courseId');
    let userId = component.get('userId');
    return Ember.RSVP.hash({
      unitsPerformance: component
        .get('performanceService')
        .findStudentPerformanceByCourse(userId, classId, courseId, units)
    }).then(({ unitsPerformance }) => {
      if (!component.isDestroyed) {
        component.renderUnitsPerformance(unitsPerformance, 'id');
        component.set('isLoading', false);
      }
    });
  },

  fetchNonClassUnitPerformance() {
    let component = this;
    let courseId = component.get('courseId');
    Ember.RSVP.hash({
      unitsPerformance: component
        .get('learnerService')
        .fetchPerformanceCourse(courseId, CONTENT_TYPES.ASSESSMENT)
    }).then(({ unitsPerformance }) => {
      if (!component.isDestroyed) {
        component.renderUnitsPerformance(unitsPerformance, 'unitId');
        component.set('isLoading', false);
      }
    });
  },

  renderUnitsPerformance(unitsPerformance, key) {
    let component = this;
    let units = component.get('units');
    let unitList = Ember.A([]);
    units.forEach(unit => {
      let unitCopy = unit.isUnit0 ? getObjectCopy(unit) : unit.copy();
      let unitPerformance = unitsPerformance.findBy(key, unit.get('id'));
      unitCopy.set('performance', unitPerformance);
      unitList.pushObject(unitCopy);
    });
    component.set('units', unitList);
  },

  /**
   * @function getStudentClassPerformance
   * Method to get selected student's class performance
   */
  getStudentClassPerformance() {
    let component = this;
    let classCourseId = null;
    let classId = component.get('classId');
    let courseId = component.get('courseId');
    let userId = component.get('userId');
    if (courseId) {
      classCourseId = Ember.A([
        {
          classId,
          courseId
        }
      ]);
    }
    const performanceSummaryPromise = classCourseId
      ? component
        .get('performanceService')
        .findClassPerformanceSummaryByStudentAndClassIds(
          userId,
          classCourseId
        )
      : null;
    Ember.RSVP.hash({
      studentClassPerformanceSummary: performanceSummaryPromise
    }).then(({ studentClassPerformanceSummary }) => {
      component.set(
        'performanceSummary',
        studentClassPerformanceSummary.objectAt(0)
      );
    });
  }
});
