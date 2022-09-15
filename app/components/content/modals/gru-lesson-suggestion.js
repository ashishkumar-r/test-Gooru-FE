import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-lesson-suggestion'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/course-map
   */
  courseMapService: Ember.inject.service('api-sdk/course-map'),

  session: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Properties

  dependentLesson: null,

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    let component = this;
    component.animateComponent();
    component.fetchDependentLesson();
    Ember.$('body').addClass('system-suggested');
  },

  willDestroyElement() {
    this._super(...arguments);
    Ember.$('body').removeClass('system-suggested');
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    onContinueLessonSuggestion() {
      this.sendAction('onContinueLessonSuggestion');
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function animateComponent
   * Method to animate the component
   */
  animateComponent() {
    let component = this;
    component.$().animate(
      {
        bottom: '50px'
      },
      850
    );
  },

  fetchDependentLesson() {
    let pathParams = {
      userId: this.get('session.userId'),
      classId: this.get('classId')
    };
    let milestoneId = this.get('milestoneId');
    let lessonId = this.get('lessonId');
    this.get('courseMapService')
      .fetchMilestoneDependentPath(milestoneId, pathParams)
      .then(dependentLessons => {
        this.set(
          'dependentLesson',
          dependentLessons.findBy('lesson_id', lessonId)
        );
      });
  }

  // -------------------------------------------------------------------------
  // Properties
});
