import Ember from 'ember';

/**
 * Century skill tag
 *
 * Component responsible for displaying a skill item as a century skill
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['century-skills', 'gru-century-skill-tag'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    removeSkill: function(skill) {
      if (this.get('onRemove')) {
        this.get('onRemove')(skill.get('id'));
      }
    }
  },

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {CenturySkill} model - Century Skill model
   */
  skill: null,

  /**
   * @property {boolean} - isReadOnly
   */
  isReadOnly: true

  // -------------------------------------------------------------------------
  // Methods
});
