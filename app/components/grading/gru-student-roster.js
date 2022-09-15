import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['grading', 'gru-student-roster'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Select student
     */
    selectStudent: function(student) {
      this.sendAction('onChangeUser', student.get('id'));
    },
    /**
     * Close student roster
     */
    close: function() {
      this.sendAction('onClose');
    }
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Student} Current user on review
   */
  currentUser: null,
  /**
   * @property {Boolean} If grading player is showing a full rubric
   * @see controllers/grading-player
   */
  fullRubric: false,
  /**
   * @property {[]} List of student
   */
  students: null,

  // -------------------------------------------------------------------------
  // Observers

  closeStudentRoster: Ember.observer('fullRubric', function() {
    if (this.get('fullRubric')) {
      this.sendAction('onClose');
    }
  })
});
