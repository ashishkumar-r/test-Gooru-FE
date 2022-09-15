import Ember from 'ember';

export default Ember.Component.extend({
  // -----------------------------------------------------------------
  // Attributes

  classNames: ['gru-student-show-all-class'],

  // ----------------------------------------------------------------------
  // Properties

  isShowAllCourses: false,

  activeClassList: Ember.A(),

  archivedClassList: Ember.A(),

  independedCourses: Ember.A(),

  contentItem: null,

  activeBucket: null,

  pageContent: Ember.computed('contentItem', function() {
    const component = this;
    return (
      component.get(component.get('contentItem')) ||
      component.get('activeBucket.courseList')
    );
  }),

  // ---------------------------------------------------------------------
  // Hooks

  // ----------------------------------------------------------------------
  // Actions

  actions: {
    onGoBack() {
      this.set('isShowAllCourses', false);
    }
  }

  // ----------------------------------------------------------------------
  // Methods
});
