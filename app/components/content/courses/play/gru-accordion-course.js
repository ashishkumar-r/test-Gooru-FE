import Ember from 'ember';
import BuilderMixin from 'gooru-web/mixins/content/builder';

/**
 * Course content viewer: Accordion Course
 *
 * Component responsible for listing a set of units
 *
 * @module
 * @augments Ember/Component
 * @mixes mixins/content/builder
 */
export default Ember.Component.extend(BuilderMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'courses', 'gru-accordion-course', 'gru-accordion'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    expandUnit: function(unitId, expanded) {
      const component = this;

      if (expanded) {
        component.sendAction('onLocationChange', unitId);
      } else {
        component.sendAction('onLocationChange', undefined);
      }

      component.closeAllUnits();
    },

    expandLesson: function(unitId, lessonId, expanded) {
      const component = this;

      if (expanded) {
        component.sendAction('onLocationChange', unitId, lessonId);
      } else {
        component.sendAction('onLocationChange', unitId, undefined);
      }
    },

    closeAllUnits: function() {
      this.closeAllUnits();
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {string}
   */
  selectedLessonId: null,

  /**
   * @property {string} action name when the location is changed
   */
  onLocationChange: null,

  // -------------------------------------------------------------------------
  // Methods
  closeAllUnits: function() {
    this.get('items').forEach(function(builderItem) {
      builderItem.set('isExpanded', false);
    });
  }
});
