import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'backdrop-pull-ups', 'pull-up-question-report'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/analytics
   */
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when the user invoke the pull up.
     **/
    onPullUpClose(closeAll) {
      this.closePullUp(closeAll);
    },

    reportClose() {
      let component = this;
      component.$().animate(
        {
          top: '100%'
        },
        400,
        function() {
          component.set('showPullUp', false);
        }
      );
    }
  },

  /**
   * Function to triggered once when the component element is first rendered.
   */
  didInsertElement() {
    this.openPullUp();
    this.initialize();
  },
  // -------------------------------------------------------------------------
  // Properties

  /**
   * Maintains context data
   * @type {Object}
   */
  context: null,

  /**
   * ClassId belongs to this collection report.
   * @type {String}
   */
  classId: Ember.computed.alias('context.classId'),

  /**
   * CourseId belongs to this collection report.
   * @type {String}
   */
  courseId: Ember.computed.alias('context.courseId'),

  /**
   * Unit belongs to this collection report.
   * @type {String}
   */
  unit: Ember.computed.alias('context.unit'),

  /**
   * Lesson belongs to this question report.
   * @type {[type]}
   */
  lesson: Ember.computed.alias('context.lesson'),

  /**
   * Collection belongs to this question report.
   * @type {Object}
   */
  collection: Ember.computed.alias('context.collection'),

  /**
   * collectionId of this  question report.
   * @type {String}
   */
  collectionId: Ember.computed.alias('context.collection.id'),

  /**
   * Selected question for this report
   * @type {Object}
   */
  selectedQuestion: Ember.computed.alias('context.selectedQuestion'),

  /**
   * Propery to hide the default pullup.
   * @property {showPullUp}
   */
  showPullUp: false,

  /**
   * List of class members
   * @type {Object}
   */
  classMembers: Ember.computed.alias('context.classMembers'),

  /**
   * It maintains the state of loading
   * @type {Boolean}
   */
  isLoading: false,

  /**
   *  It enable chart component
   */
  isUserChart: false,

  isEmptyQuestionArray: false,

  initialize: function() {
    const component = this;
    component.set('isLoading', true);
    const classId = component.get('classId');
    const courseId = component.get('courseId');
    const unitId = component.get('unit.id');
    const lessonId = component.get('lesson.id');
    const collectionId = component.get('collection.id');
    const selectedQuestionId = component.get('selectedQuestion.id');
    return component
      .get('analyticsService')
      .findLikertResources(
        classId,
        courseId,
        unitId,
        lessonId,
        collectionId,
        'assessment',
        selectedQuestionId
      )
      .then(function(userResourcesResults) {
        if (userResourcesResults.length > 0) {
          component.set('userResourcesResults', userResourcesResults);
          component.set('isUserChart', true);
          component.set('userContext', component.get('context'));
        } else {
          component.set('isEmptyQuestionArray', true);
        }
      });
  },

  openPullUp() {
    let component = this;
    component.$().animate(
      {
        top: '10%'
      },
      400
    );
  },

  closePullUp(closeAll) {
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.set('showPullUp', false);
        if (closeAll) {
          component.sendAction('onClosePullUp');
        }
      }
    );
  }
});
