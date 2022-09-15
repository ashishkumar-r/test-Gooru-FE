import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @type {CourseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  performanceService: Ember.inject.service('api-sdk/performance'),

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['cards gru-class-card '],

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Class} class information
   */
  class: null,

  /**
   * @property {course} course information
   */
  course: null,

  /**
   * @property {Object} Object containing student count by class
   */
  classStudentCount: null,

  /**
   * @property {Boolean} Indicates if units count is displayed
   */
  showUnitsCount: false,

  /**
   * @property {Profile}
   */
  profile: null,

  /**
   * @property {boolean} Indicates if the class path
   */
  classPath: Ember.computed('profile', function() {
    return this.get('profile').get('role') === 'student'
      ? 'student.class'
      : 'class.overview';
  }),

  /**
   * @property {Number} Count of collaborators in the class
   */
  collaboratorsCount: Ember.computed('class.collaborators', function() {
    const collaborators = this.get('class.collaborators');
    return collaborators && collaborators.length > 1
      ? collaborators.length - 1
      : 0;
  }),

  /**
   * @property {Number} Count of students in the class
   */
  studentCount: Ember.computed('class.id', 'classStudentCount', function() {
    let classStudentCount = this.get('classStudentCount');
    return classStudentCount && Ember.keys(classStudentCount).length
      ? classStudentCount[this.get('class.id')]
        ? classStudentCount[this.get('class.id')]
        : 0
      : 0;
  }),

  /**
   * @property {Number} score percentage
   * Computed property for performance score percentage
   */
  scorePercentage: Ember.computed('class.performanceSummary', function() {
    const scorePercentage = this.get('class.performanceSummary.score');
    return scorePercentage >= 0 && scorePercentage !== null
      ? `${scorePercentage}%`
      : '_';
  }),

  /**
   * @property {Boolean}
   * Computed property  to identify class is started or not
   */
  hasStarted: Ember.computed('class.performanceSummary', function() {
    const scorePercentage = this.get('class.performanceSummary.score');
    return scorePercentage !== null && scorePercentage >= 0;
  }),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     *
     * Triggered when an menu item is selected
     * @param item
     */
    selectItem: function(item) {
      const classId = this.get('class.id');
      if (this.get('onItemSelected')) {
        this.sendAction('onItemSelected', item, classId);
      }
    },

    /**
     * Action triggered when click on archived class report
     */
    onShowArchivedClassReport() {
      const component = this;
      component.fetchClassDetails().then(function(classData) {
        component.sendAction('onShowArchivedClassReport', classData);
      });
    }
  },

  // -------------------------------------------------------------------------
  // Events

  init: function() {
    const component = this;
    component._super(...arguments);
  },

  // -------------------------------------------------------------------------
  // Functions

  /**
   * @function fetchClassDetails
   * Method used to fetch class members and course data
   */
  fetchClassDetails() {
    const component = this;
    const classService = component.get('classService');
    const courseService = component.get('courseService');
    let classData = component.get('class');
    return Ember.RSVP.hash({
      classMembers: Ember.RSVP.resolve(classService.readClassMembers(classData.get('id'))),
      course: Ember.RSVP.resolve(courseService.fetchById(classData.get('courseId')))
    })
      .then(({classMembers, course}) => {
        if (!component.isDestroyed) {
          classData.set('owner', classMembers.get('owner'));
          classData.set('collaborators', classMembers.get('collaborators'));
          classData.set('memberGradeBounds', classMembers.get('memberGradeBounds'));
          classData.set('members', classMembers.get('members'));
          classData.set('course', course);
          return classData;
        }
      });
  }
});
