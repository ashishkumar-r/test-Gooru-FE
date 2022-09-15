import Ember from 'ember';
import {
  sortFeaturedCourses,
  getSubjects
} from 'gooru-web/utils/sort-featured-courses';
import { getCategoryCodeFromSubjectId } from 'gooru-web/utils/taxonomy';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered to bookmark a course
     * @param {Course} course
     * @param {Boolean} showType
     */
    onBookmarkCourse: function(course, showType) {
      this.sendAction('onBookmarkCourse', course, showType);
    },

    /**
     * Action triggered to open the independent player
     * @param {string} collectionId collection identifier
     */
    onIndependentPlayer: function(collection) {
      this.sendAction('onOpenIndependentPlayer', collection);
    },

    /**
     * Action triggered to open the course player
     * @param {string} courseId course identifier
     */
    playCourse: function(course) {
      this.sendAction('onOpenContentPlayer', course);
    }
  },

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['library', 'gru-browse-library'],

  /**
   * @property {Courses[]} courses to show
   */
  courses: null,

  /**
   * @property {Object[]} group courses by subject
   */
  formattedContent: Ember.computed('courses', function() {
    return getSubjects(this.get('courses')).map((subjectBucket, index) =>
      Ember.Object.create({
        category: getCategoryCodeFromSubjectId(subjectBucket.subject),
        subject: subjectBucket.taxonomySubject,
        courses: sortFeaturedCourses(this.get('courses'))[index]
      })
    );
  }),

  /**
   * Profile information
   * @property {Profile} profile
   */
  profile: null,

  /**
   * Action to send when creating a bookmark
   */
  onBookmarkCourse: null,

  /**
   * @property {string} on independent player action
   */
  onOpenIndependentPlayer: null
});
