import Ember from 'ember';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { getObjectCopy } from 'gooru-web/utils/utils';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'backdrop-pull-ups', 'pull-up-student-unit-report'],

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
   * @type {UnitService} Service to retrieve unitService information
   */
  unitService: Ember.inject.service('api-sdk/unit'),

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
          '.student-unit-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let units = component.get('unitsHasPerformance');
      let selectedElement = component.$(
        '.student-unit-report-container #report-carousel-wrapper .item.active'
      );
      let currentIndex = selectedElement.data('item-index');
      let selectedIndex = selectedElement.data('item-index') - 1;
      if (currentIndex === 0) {
        selectedIndex = units.length - 1;
      }
      component.set('selectedUnit', units.objectAt(selectedIndex));
      component
        .$('.student-unit-report-container #report-carousel-wrapper')
        .carousel('prev');
      component.loadData();
    },

    onClickNext() {
      let component = this;
      component
        .$(
          '.student-unit-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let units = component.get('unitsHasPerformance');
      let selectedElement = component.$(
        '.student-unit-report-container #report-carousel-wrapper .item.active'
      );
      let currentIndex = selectedElement.data('item-index');
      let selectedIndex = currentIndex + 1;
      if (units.length - 1 === currentIndex) {
        selectedIndex = 0;
      }
      component.set('selectedUnit', units.objectAt(selectedIndex));
      component
        .$('.student-unit-report-container #report-carousel-wrapper')
        .carousel('next');
      component.loadData();
    },

    openLessonReport(lesson, lessons) {
      let component = this;
      let params = {
        classId: component.get('classId'),
        courseId: component.get('courseId'),
        unitId: component.get('unitId'),
        lessonId: component.get('lessonId'),
        lesson: lesson,
        unit: component.get('unit'),
        lessons: lessons,
        userId: component.get('userId'),
        isStudent: component.get('isStudent'),
        isTeacher: component.get('isTeacher')
      };
      component.set('showLessonReport', true);
      component.set('studentLessonReportContext', params);
    },
    onClosePullUp() {
      let component = this;
      component.set('showLessonReport', false);
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
    this.slideToSelectedUnit();
    this.initialize();
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * ClassId belongs to this unit report.
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
   * CourseId belongs to this unit report.
   * @type {String}
   */
  courseId: Ember.computed.alias('context.courseId'),

  /**
   * Course belongs to this unit report.
   * @type {String}
   */
  course: Ember.computed.alias('context.course'),

  /**
   * Unit Id belongs to this unit report.
   * @type {String}
   */
  unitId: Ember.computed.alias('context.unitId'),

  /**
   * List of units mapped to unit.
   * @type {Array}
   */
  units: Ember.computed.alias('context.units'),

  /**
   * Maintains list of units has performance.
   * @type {Array}
   */
  unitsHasPerformance: Ember.computed('units', function() {
    let units = this.get('units');
    return units.filterBy('performance.hasStarted', true);
  }),

  /**
   * Maintains list of unit items.
   * @type {Array}
   */
  lessons: Ember.A([]),

  /**
   * Selected unit.
   * @type {Object}
   */
  selectedUnit: Ember.computed.alias('context.unit'),

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
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('unit.taxonomy.[]', function() {
    let standards = this.get('unit.taxonomy');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
      return TaxonomyTag.getTaxonomyTags(standards);
    }
  }),

  /**
   * Maintains the state of lesson report pull up
   * @type {Boolean}
   */
  showLessonReport: false,

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
      .$('.student-unit-report-container .report-content')
      .scroll(function() {
        let scrollTop = component
          .$('.student-unit-report-container .report-content')
          .scrollTop();
        let scrollFixed = component.$(
          '.student-unit-report-container .report-content .on-scroll-fixed'
        );
        let reportCarouselTagsHeight =
          component
            .$(
              '.student-unit-report-container .report-content .report-carousel-tags'
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

  slideToSelectedUnit() {
    let component = this;
    let units = component.get('unitsHasPerformance');
    let selectedUnit = component.get('selectedUnit');
    let selectedIndex = units.indexOf(selectedUnit);
    component
      .$('.student-unit-report-container #report-carousel-wrapper')
      .carousel(selectedIndex);
  },

  loadData() {
    let component = this;
    const classId = this.get('classId');
    const selectedUnit = component.get('selectedUnit');
    let unitId = component.get('selectedUnit.id');
    let courseId = component.get('courseId');
    component.set('isLoading', true);
    return Ember.RSVP.hash({
      unit:
        (selectedUnit.get('children') && selectedUnit.get('children').length) ||
        (selectedUnit.get('lessons') && selectedUnit.get('children').length)
          ? selectedUnit
          : component.get('unitService').fetchById(courseId, unitId)
    }).then(({ unit }) => {
      if (!component.isDestroyed) {
        component.set('unit', unit);
        component.set('lessons', unit.get('children') || unit.get('lessons'));
      }
      if (classId) {
        component.fetchClassLessonPerformance();
      } else {
        component.fetchNonClassLessonPerformance();
      }
    });
  },

  fetchClassLessonPerformance() {
    let component = this;
    const classId = this.get('classId');
    let unitId = component.get('selectedUnit.id');
    let courseId = component.get('courseId');
    let userId = component.get('userId');
    Ember.RSVP.hash({
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
        component.set('isLoading', false);
        component.handleCarouselControl();
      }
    });
  },

  fetchNonClassLessonPerformance() {
    let component = this;
    let unitId = component.get('selectedUnit.id');
    let courseId = component.get('courseId');
    Ember.RSVP.hash({
      lessonsPerformance: component
        .get('learnerService')
        .fetchPerformanceUnit(courseId, unitId, CONTENT_TYPES.ASSESSMENT)
    }).then(({ lessonsPerformance }) => {
      if (!component.isDestroyed) {
        component.renderLessonsPerformance(lessonsPerformance, 'lessonId');
        component.set('isLoading', false);
        component.handleCarouselControl();
      }
    });
  },

  renderLessonsPerformance(lessonsPerformance, key) {
    let component = this;
    let lessons = component.get('lessons');
    let lessonList = Ember.A([]);
    const selectedUnit = component.get('selectedUnit');
    lessons.forEach(lesson => {
      let lessonCopy = selectedUnit.isUnit0
        ? getObjectCopy(lesson)
        : lesson.copy();
      let lessonPerformance = lessonsPerformance.findBy(key, lesson.get('id'));
      lessonCopy.set('performance', lessonPerformance);
      lessonList.pushObject(lessonCopy);
    });
    component.set('lessons', lessonList);
  },

  handleCarouselControl() {
    let component = this;
    let units = component.get('unitsHasPerformance');
    let selectedUnit = units.findBy('id', component.get('selectedUnit.id'));
    let currentIndex = units.indexOf(selectedUnit);
    if (units.length - 1 === 0) {
      component
        .$(
          '.student-unit-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
    } else {
      if (currentIndex === 0) {
        component
          .$(
            '.student-unit-report-container #report-carousel-wrapper .carousel-control.left'
          )
          .addClass('in-active');
      } else {
        component
          .$(
            '.student-unit-report-container #report-carousel-wrapper .carousel-control.left'
          )
          .removeClass('in-active');
      }
      if (currentIndex === units.length - 1) {
        component
          .$(
            '.student-unit-report-container #report-carousel-wrapper .carousel-control.right'
          )
          .addClass('in-active');
      } else {
        component
          .$(
            '.student-unit-report-container #report-carousel-wrapper .carousel-control.right'
          )
          .removeClass('in-active');
      }
    }
  },

  initialize() {
    let component = this;
    const classId = component.get('classId');
    if (classId) {
      component.fetchClassUnitPerformance();
    } else {
      component.fetchNonClassUnitPerformance();
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
        let units = component.get('units');
        let selectedUnit = units.findBy('id', component.get('selectedUnit.id'));
        component.set('selectedUnit', selectedUnit);
        component.loadData();
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
        let units = component.get('units');
        let selectedUnit = units.findBy('id', component.get('selectedUnit.id'));
        component.set('selectedUnit', selectedUnit);
        component.loadData();
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
  }
});
