import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['student', 'gru-performance-courses'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Select the course
     * @param courseId
     */
    selectCourse: function(courseId) {
      this.sendAction('onSelectCourse', courseId);
    }
  },
  // -------------------------------------------------------------------------
  // Events
  /**
   * didRender  Event
   */
  didRender: function() {
    this.setDataSearchTerms();
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   *  * @property {[Course]} courses
   */
  courses: null,

  /**
   * @property {String} selected course id
   */
  courseId: null,
  // -------------------------------------------------------------------------
  // Methods
  /**
   * Filter course list by course name
   */
  searchCourse: function() {
    var searchTerm = $('.search-box')
      .val()
      .toLowerCase();

    $('.gru-performance-courses .item').each(function() {
      if (
        $(this).filter(`[data-search-term *= '${searchTerm}']`).length > 0 ||
        searchTerm.length < 1
      ) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  },
  /**
   * Set data search terms
   */
  setDataSearchTerms: function() {
    const component = this;
    $('.gru-performance-courses .item').each(function() {
      $(this).attr(
        'data-search-term',
        $(this)
          .text()
          .toLowerCase()
      );
    });
    $('.search-box').on('keyup', function() {
      component.searchCourse();
    });
  }
});
