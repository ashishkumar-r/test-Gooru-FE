import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['student-class-milestone-course-map-route0-preview'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:session
   */
  session: Ember.inject.service(),

  /**
   * route0 Service to perform route0 data operations
   */
  route0Service: Ember.inject.service('api-sdk/route0'),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Maintains the state of data loading
   * @type {Boolean}
   */
  isLoading: false,

  /**
   * Class Id extract from class object
   * @type {String}
   */
  classId: Ember.computed.alias('class.id'),

  /**
   * Course Id which is mapped to this class.
   * @type {String}
   */
  courseId: Ember.computed.alias('class.courseId'),

  /**
   * Maintains the state of route0 preview expand or collapse
   * @type {Boolean}
   */
  isRoute0PreviewExpand: false,

  /**
   * Maintains the state whether we need to show chart or not.
   * @type {Boolean}
   */
  showChart: true,

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    updateRoute0: function(status) {
      this.updateRoute0(status);
    },

    showRoute0Preview() {
      let element = '.route0-preview-container';
      let component = this;
      if (component.get('isRoute0PreviewExpand')) {
        component.$(element).slideUp(400, function() {
          component.set('isRoute0PreviewExpand', false);
        });
      } else {
        component.$(element).slideDown(400, function() {
          component.set('isRoute0PreviewExpand', true);
        });
      }
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  updateRoute0: function(status) {
    let component = this;
    let route0 = component.get('route0');
    route0.set('status', status);
  }
});
