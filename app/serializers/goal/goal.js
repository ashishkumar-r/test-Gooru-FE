import Ember from 'ember';
import { momentToTimestamp, toUtc, toLocal } from 'gooru-web/utils/utils';
import Goal from 'gooru-web/models/goal/goal';

/**
 * Serializer to support the Goal CRUD operations
 *
 * @typedef {Object} GoalSerializer
 */
export default Ember.Object.extend({
  /**
   * Serialize a Goal/Goal object into a JSON representation required by the Create goal endpoint
   *
   * @param model - The goal model to be serialized
   * @returns {Object} JSON Object representation of the goal model
   */
  serializeCreateGoal: function(model) {
    return this.serializeGoal(model);
  },

  /**
   * Serialize a Goal/Goal object into a JSON representation
   *
   * @param {Goal} model - The goal model to be serialized
   * @returns {Object} JSON Object representation of the unit model
   */
  serializeGoal: function(model) {
    return {
      title: model.get('title'),
      description: model.get('description'),
      start_date: momentToTimestamp(toUtc(model.get('startDate'))),
      end_date: momentToTimestamp(toUtc(model.get('endDate'))),
      status: model.get('status'),
      reflection: model.get('reflection')
    };
  },

  /**
   * Normalize an array of goals
   *
   * @param payload endpoint response format in JSON format
   * @returns {Goal[]}
   */
  normalizeGetGoals: function(payload) {
    const serializer = this;
    if (payload && Ember.isArray(payload)) {
      return payload.map(function(goal) {
        return serializer.normalizeGoal(goal);
      });
    } else {
      return [];
    }
  },

  /**
   * Normalize a goal
   * @param {*} data
   * @return {Goal}
     */
  normalizeGoal: function(data) {
    return Goal.create(Ember.getOwner(this).ownerInjection(), {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      startDate: toLocal(data.start_date),
      endDate: toLocal(data.end_date),
      reflection: data.reflection,
      order: data.sequence_id
    });
  }
});
