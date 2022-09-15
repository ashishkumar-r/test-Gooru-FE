import Ember from 'ember';
import { CENTURY_SKILLS_GROUPS } from 'gooru-web/config/config';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-century-skills-content'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * select or not the skill item.
     * @function actions:selectSkillItem
     * @param {CenturySkill} skillItem
     */
    selectSkillItem: function(skillItem) {
      let component = this;
      var selectedCenturySkills = component.get('tempSelectedCenturySkills');
      var skillItemId = skillItem.get('id');

      if (component.isSelected(skillItemId)) {
        selectedCenturySkills.removeObject(skillItemId);
      } else {
        selectedCenturySkills.pushObject(skillItemId);
      }
    },

    saveSelectedSkills() {
      var selectedCenturySkills = this.get('tempSelectedCenturySkills');
      this.get('onSave')(selectedCenturySkills);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  init() {
    let component = this;
    component._super(...arguments);

    var tempSelectedCenturySkills = component
      .get('selectedCenturySkills')
      .copy();

    if (tempSelectedCenturySkills) {
      this.set('tempSelectedCenturySkills', tempSelectedCenturySkills);
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    this.set('centurySkills', null);
    this.set('selectedCenturySkills', null);
    this.set('tempSelectedCenturySkills', null);
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * List of Century Skills
   * @prop {CenturySkill[]}
   */
  centurySkills: Ember.A([]),

  /**
   * List of selected Century Skills
   * @prop {CenturySkill[]}
   */
  selectedCenturySkills: Ember.A([]),

  /**
   * @property {centurySkill[]} cognitive group of century skills
   */
  cognitiveSkillsGroup: Ember.computed(
    'centurySkills.[]',
    'tempSelectedCenturySkills.[]',
    function() {
      let component = this;

      return this.get('centurySkills').filter(function(centurySkill) {
        centurySkill.set(
          'isSelected',
          component.isSelected(centurySkill.get('id'))
        );
        return (
          centurySkill.get('group') ===
          CENTURY_SKILLS_GROUPS.KEY_COGNITIVE_SKILLS_AND_STRATEGIES
        );
      });
    }
  ),

  /**
   * @property {centurySkill[]} content group of century skills
   */
  contentSkillsGroup: Ember.computed(
    'centurySkills.[]',
    'tempSelectedCenturySkills.[]',
    function() {
      let component = this;

      return this.get('centurySkills').filter(function(centurySkill) {
        centurySkill.set(
          'isSelected',
          component.isSelected(centurySkill.get('id'))
        );
        return (
          centurySkill.get('group') ===
          CENTURY_SKILLS_GROUPS.KEY_CONTENT_KNOWLEDGE
        );
      });
    }
  ),

  /**
   * @property {centurySkill[]} learning group of century skills
   */
  learningSkillsGroup: Ember.computed(
    'centurySkills.[]',
    'tempSelectedCenturySkills.[]',
    function() {
      let component = this;

      return this.get('centurySkills').filter(function(centurySkill) {
        centurySkill.set(
          'isSelected',
          component.isSelected(centurySkill.get('id'))
        );
        return (
          centurySkill.get('group') ===
          CENTURY_SKILLS_GROUPS.KEY_LEARNING_SKILLS_AND_TECHNIQUES
        );
      });
    }
  ),

  // ----------------------------
  // Methods

  /**
   * Returns if a skillItem is in the selectedCenturySkills
   * @param {Number} skillItem id
   * @return {Boolean}
   */
  isSelected: function(skillItemId) {
    var selectedCenturySkills = this.get('tempSelectedCenturySkills');
    return selectedCenturySkills.includes(skillItemId);
  },

  /**
   * List of temp selected Century Skills ids
   * @prop {Number[]}
   */
  tempSelectedCenturySkills: Ember.A([])
});
