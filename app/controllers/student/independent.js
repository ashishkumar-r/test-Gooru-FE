import Ember from 'ember';

export default Ember.Controller.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Collapses the header section
     * @param {boolean} state
     */
    toggleHeader: function(state) {
      var $panels = $('.header .panel');
      if (state) {
        $panels.slideUp();
      } else {
        $panels.slideDown();
      }
    },

    /**
     * Trigger the event to open student course report
     */
    openCourseReport: function() {
      this.openStudentCourseReport();
    }
  },

  // -------------------------------------------------------------------------
  // Events

  /**
   * DidInsertElement ember event
   */
  didInsertElement: function() {
    var item = this.get('menuItem');
    this.selectItem(item);
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * The course presented to the user
   * @property {Course}
   */
  course: null,

  /**
   * The performance for the presented course
   * @property {Performance}
   */
  performance: null,

  /**
   * The units presented to the user
   * @property {Unit}
   */
  units: null,

  /**
   * The menuItem selected
   * @property {String}
   */
  menuItem: null,

  ILActivity: null,

  /**
   * Percentage value for the score chart
   * @property {Boolean}
   */
  percentageToShow: Ember.computed('performance.scoreInPercentage', function() {
    const score = this.get('performance.scoreInPercentage');
    return score || score === 0 ? `${score}%` : '--';
  }),

  /**
   * @property {boolean} Indicates if course has 1 or more units
   */
  hasUnits: Ember.computed.gt('course.unitCount', 0),

  /**
   * @property {Boolean}
   * Computed property  to identify class is started or not
   */
  hasStarted: Ember.computed('performance', function() {
    const scorePercentage = this.get('performance.score');
    return scorePercentage !== null && scorePercentage >= 0;
  }),

  // -------------------------------------------------------------------------
  // Methods
  /**
   * Selected the menu item
   * @param {string} item
   */
  selectMenuItem: function(item) {
    this.set('menuItem', item);
  },

  openStudentCourseReport() {
    let controller = this;
    controller.set('showCourseReport', true);
    let params = Ember.Object.create({
      userId: controller.get('session.userId'),
      courseId: controller.get('course.id'),
      course: controller.get('course'),
      performance: controller.get('performance'),
      isTeacher: false,
      isStudent: true,
      loadUnitsPerformance: true
    });
    controller.set('studentCourseReportContext', params);
  }
});
