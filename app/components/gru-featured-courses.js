import Ember from 'ember';
import {
  sortFeaturedCourses,
  getSubjects
} from 'gooru-web/utils/sort-featured-courses';

/**
 * featured courses component
 *
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-featured-courses'],

  attributeBindings: [
    'dataSpy:data-spy',
    'dataTarget:data-target',
    'dataOffset:data-offset'
  ],

  dataSpy: 'scroll',
  dataTarget: '.navbar',
  dataOffset: '50',
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Remix course action, when clicking remix at the course card
     * @param {Content/Course}
     */
    onRemixCourse: function(course) {
      /*
      *@TODO: get the correct information from the Course Searches from taxonomy so we can *normalize it accordingly so it can be copied.
      */
      this.sendAction('onRemixCourse', course);
    }
  },
  // -------------------------------------------------------------------------
  // Properties

  courses: null,

  formattedContent: Ember.computed('courses', function() {
    return getSubjects(this.get('courses')).map((subjectBucket, index) =>
      Ember.Object.create({
        category: subjectBucket.subject.slice(
          subjectBucket.subject.indexOf('.') + 1,
          subjectBucket.subject.lastIndexOf('.')
        ),
        subject: subjectBucket.taxonomySubject,
        courses: sortFeaturedCourses(this.get('courses'))[index]
      })
    );
  }),

  // -------------------------------------------------------------------------
  // Methods
  didInsertElement: function() {
    this._super(...arguments);
    $('#subject-navbar').affix({
      offset: 200
    });
  }
});
