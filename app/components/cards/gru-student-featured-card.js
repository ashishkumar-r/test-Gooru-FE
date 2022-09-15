import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -----------------------------------------------------------------
  // Attributes

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  /**
   * @type {FeaturedCourseService} Service to retrieve Featured Courses Service information
   */
  featuredCourseService: Ember.inject.service('api-sdk/featured-courses'),

  classNames: ['gru-student-featured-card'],

  // Attributes

  classNameBindings: ['coursedSeq'],

  coursedSeq: Ember.computed(function() {
    return `course-${this.get('contentSeq')}`;
  }),

  // ---------------------------------------------------------------
  // Properties

  // Properties

  /**
   * @property {Course} course information
   */
  course: null,

  /**
   * @property {Boolean}
   */
  isExpand: false,

  didInsertElement: function() {
    const component = this;
    component.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
  },

  actions: {
    /**
     * Action triggered when click on expand icon
     */
    toggleContent() {
      //
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
      this.joinPublicClassbyGrade();
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
    },

    close() {
      this.set('isExpand', false);
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLOSE_STUDY_VOW
      );
    }
  },

  /**
   * @function joinPublicClassbyGrade
   * Method to join public class by student
   */
  joinPublicClassbyGrade() {
    let courseId = this.get('course.id');
    this.get('router').transitionTo('student-independent-study', {
      queryParams: {
        courseId: courseId
      }
    });
  }
});
