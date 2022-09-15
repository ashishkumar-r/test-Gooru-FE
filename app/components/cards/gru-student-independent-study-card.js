import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Component.extend(ConfigurationMixin, {
  // -----------------------------------------------------------------
  // Attributes

  classNames: ['gru-student-independent-study-card'],

  // ------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {FeaturedCourseService} Service to retrieve Featured Courses Service information
   */
  featuredCourseService: Ember.inject.service('api-sdk/featured-courses'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // ----------------------------------------------------------------------
  // Properties

  course: null,

  thumbnailUrl: Ember.computed('course', function() {
    const course = this.get('course');
    let randomNumber = parseInt(Math.random() * 3, 0);
    return course
      ? course.thumbnailUrl
      : DEFAULT_IMAGES[`CLASS_DEFAULT_${randomNumber}`];
  }),

  // ------------------------------------------------------------
  // Hooks

  didInsertElement() {
    this.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
    this._super(...arguments);
  },

  // --------------------------------------------------------------------------
  // Actions

  actions: {
    onGoDashboardPage() {
      this.get('router').transitionTo(
        'student.class.dashboard',
        this.get('course.id')
      );
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
      const { getOwner } = Ember;
      let studentClass = getOwner(this).lookup('controller:student.class');
      studentClass.set('isDisableNavbar', false);
    }
  },

  // -------------------------------------------------------------------
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
