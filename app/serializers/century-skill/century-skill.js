import Ember from 'ember';
import { CENTURY_SKILLS_GROUPS } from 'gooru-web/config/config';
import CenturySkillModel from 'gooru-web/models/century-skill/century-skill';

/**
 *
 * @typedef {Object} CenturySkillSerializer
 */
export default Ember.Object.extend({
  init: function() {
    this._super(...arguments);
  },

  /**
   * Normalize the century skills endpoint response
   * @param payload The endpoint response in JSON format
   * @returns {CenturySkill[]} a list of century skill model objects
   */
  normalizeCenturySkills: function(payload) {
    const serializer = this;
    let centurySkills = payload['21_century_skills'];
    let cognitiveSkillsGroup =
      centurySkills[CENTURY_SKILLS_GROUPS.KEY_COGNITIVE_SKILLS_AND_STRATEGIES];
    let contentSkillsGroup =
      centurySkills[CENTURY_SKILLS_GROUPS.KEY_CONTENT_KNOWLEDGE];
    let learningSkillsGroup =
      centurySkills[CENTURY_SKILLS_GROUPS.KEY_LEARNING_SKILLS_AND_TECHNIQUES];
    let normalizedCenturySkills = [];

    cognitiveSkillsGroup.forEach(function(cognitiveSkill) {
      normalizedCenturySkills.push(
        serializer.normalizeReadCenturySkillInfo(
          cognitiveSkill,
          CENTURY_SKILLS_GROUPS.KEY_COGNITIVE_SKILLS_AND_STRATEGIES
        )
      );
    });

    contentSkillsGroup.forEach(function(contentSkill) {
      normalizedCenturySkills.push(
        serializer.normalizeReadCenturySkillInfo(
          contentSkill,
          CENTURY_SKILLS_GROUPS.KEY_CONTENT_KNOWLEDGE
        )
      );
    });

    learningSkillsGroup.forEach(function(learningSkill) {
      normalizedCenturySkills.push(
        serializer.normalizeReadCenturySkillInfo(
          learningSkill,
          CENTURY_SKILLS_GROUPS.KEY_LEARNING_SKILLS_AND_TECHNIQUES
        )
      );
    });

    return normalizedCenturySkills;
  },

  /**
   * Normalize the Read Century Skill info endpoint response
   *
   * @param payload is the endpoint response in JSON format
   * @param {String} group of century skill
   * @returns {CenturySkillModel} a centurySkill model object
   */
  normalizeReadCenturySkillInfo: function(payload, group = null) {
    return CenturySkillModel.create(Ember.getOwner(this).ownerInjection(), {
      id: payload.id,
      label: payload.label,
      hewlettDeepLearningModel: payload.hewlett_deep_learning_model,
      conleyFourKeysModel: payload.conley_four_keys_model,
      p21FrameworkModel: payload.p21_framework_model,
      nationalResearchCenterModel: payload.national_research_center_model,
      group: group
    });
  }
});
