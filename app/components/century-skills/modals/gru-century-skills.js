import Ember from 'ember';

/**
 * 21st century skills
 *
 * Component responsible for displaying three panels of 21st century skills
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['century-skills', 'modals', 'gru-century-skills'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    updateSelectedSkills(selectedCenturySkills) {
      this.get('model.callback').success(selectedCenturySkills);
      this.triggerAction({ action: 'closeModal' });
    }
  },

  // -------------------------------------------------------------------------
  // Events

  init() {
    let component = this;
    component._super(...arguments);

    var selectedCenturySkills = component.get('model.selectedCenturySkills');
    var centurySkills = component.get('model.centurySkills');

    if (selectedCenturySkills) {
      this.set('selectedCenturySkills', selectedCenturySkills);
    }
    if (centurySkills) {
      this.set('centurySkills', centurySkills);
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    this.set('centurySkills', null);
    this.set('selectedCenturySkills', null);
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * List of Century Skills
   * @prop {CenturySkill[]}
   */
  centurySkills: Ember.A([]),

  /**
   * List of selected Century Skills ids
   * @prop {Number[]}
   */
  selectedCenturySkills: Ember.A([])
});
