import Ember from 'ember';

/**
 * @typedef {object} Index Controller
 */
export default Ember.Controller.extend({
  /**
   * Selected grades items
   * @property {array}
   */
  selectedGrades: null,

  /**
   * Selected subject item
   * @property {array}
   */
  selectedSubjects: null,

  /**
   * Selected standard item
   * @property {Standard}
   */
  selectedStandard: null,

  /**
   * Error message displayed when click Browse Content button
   * @property {}
   */
  errorMessage: null,

  /**
   * @property {[]} subjects
   * @see setupController at routes/index.js
   */
  subjects: null,

  /**
   * @property {[]} grades
   * @see setupController at routes/index.js
   */
  grades: null,

  /**
   * @property {[]} standards
   * @see setupController at routes/index.js
   */
  standards: null,

  /**
   * Validate if selectedGrades is null or empty
   * @property
   */
  isEmptyGrades: Ember.computed.empty('selectedGrades'),
  /**
   * Validate if selectedSubject is null or empty
   * @property
   */
  isEmptySubjects: Ember.computed.empty('selectedSubjects'),

  actions: {
    /**
     * Triggered when a subject selection changes
     * @param {DropdownItem[]} items
     */
    onSubjectChange: function(items) {
      this.set('selectedSubjects', items);
    },

    /**
     * Triggered when a standard selection changes
     * @param {DropdownItem} item
     */
    onStandardSelected: function(item) {
      this.set('selectedStandard', item);
    },

    /**
     * Triggered when grade selection changes
     * @param {DropdownItem[]} items
     */
    onGradeSelected: function(items) {
      this.set('selectedGrades', items);
    },
    /**
     * Triggered when click browseContent button
     */
    onBrowseContentClick: function() {
      const controller = this;
      const i18n = this.get('i18n');

      if (controller.get('isEmptyGrades')) {
        controller.set(
          'errorMessage',
          i18n.t('index.browseContent.grades_missing_message')
        );
      } else {
        controller.set('errorMessage', null);
        if (controller.get('isEmptySubjects')) {
          controller.set(
            'errorMessage',
            i18n.t('index.browseContent.subjects_missing_message')
          );
        } else {
          controller.set('errorMessage', null);
          var selectedGrades = controller
            .get('selectedGrades')
            .map(function(item) {
              return item.get('id');
            });
          var selectedSubjects = controller
            .get('selectedSubjects')
            .map(function(item) {
              return item.get('id');
            });

          controller.transitionToRoute(
            `/search/courses?gradeIds=${selectedGrades}&subjectIds=${selectedSubjects}`
          );
        }
      }
    }
  }
});
