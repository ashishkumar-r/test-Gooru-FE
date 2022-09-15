import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {FeaturedCourseService} Service to retrieve Featured Courses Service information
   */
  featuredCourseService: Ember.inject.service('api-sdk/featured-courses'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-student-featured-course-card'],

  classNameBindings: ['coursedSeq'],

  coursedSeq: Ember.computed(function() {
    return `course-${this.get('contentSeq')}`;
  }),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when click on expand icon
     */
    toggleContent() {
      this.toggleProperty('isExpand');
      if (this.get('isExpand')) {
        const context = {
          classId: this.get('course').id,
          courseTitle: this.get('course').title,
          courseId: this.get('course').id,
          originalCoourseId: this.get('course').originalCourseId,
          subject: this.get('course').subject,
          hasJoined: this.get('course').hasJoined,
          learnerCount: this.get('course').learnerCount
        };
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.EXPAND_RECOMMENDED_COURSE,
          context
        );
      }
    },

    /**
     * Action triggered when click on study now button
     */
    studyNow() {
      let courseSettings = this.get('course.settings');
      let gradeCurrent = courseSettings.get('gradeCurrent');
      this.joinPublicClassbyGrade(gradeCurrent);
      this.set('isExpand', false);
      const context = {
        classId: this.get('course').id,
        courseTitle: this.get('course').title,
        courseId: this.get('course').id,
        originalCoourseId: this.get('course').originalCourseId,
        subject: this.get('course').subject,
        hasJoined: this.get('course').hasJoined,
        learnerCount: this.get('course').learnerCount
      };
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.STUDY_RECOMMENDED_COURSE,
        context
      );
    }
  },

  didInsertElement() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Course} course information
   */
  course: null,

  /**
   * @property {Boolean}
   */
  isExpand: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function joinPublicClassbyGrade
   * Method to join public class by student
   */
  joinPublicClassbyGrade(gradeLowerBound) {
    let courseId = this.get('course.id');
    let featuredCourseService = this.get('featuredCourseService');
    return Ember.RSVP.hash({
      joinClass: Ember.RSVP.resolve(
        featuredCourseService.joinPublicClassbyGrade(courseId, gradeLowerBound)
      )
    }).then(({ joinClass }) => {
      this.sendAction('updateUserClasses'); // Triggers the refresh of user classes in top header
      let courseSettings = this.get('course.settings');
      if (!courseSettings.get('gradeCurrent')) {
        this.get('router').transitionTo(
          'student.class.course-map',
          joinClass.get('classId')
        );
      } else {
        this.get('router').transitionTo(
          'student.class.proficiency',
          joinClass.get('classId')
        );
      }
    });
  }
});
