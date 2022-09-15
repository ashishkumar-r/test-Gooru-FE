import Ember from 'ember';
import { GOAL_STATUS } from 'gooru-web/config/config';
import { /*validator,*/ buildValidations } from 'ember-cp-validations';
import createGoalValidations from 'gooru-web/validations/create-goal';

const Validations = buildValidations({});

/**
 * Goal model
 *
 * @typedef {Object} Goal
 */
const GoalModel = Ember.Object.extend(Validations, {
  /**
   * @property {String} id - Gooru id for the goal
   */
  id: null,

  /**
   * @property {String} title
   */
  title: null,

  /**
   * @property {String} description
   */
  description: null,

  /**
   * @property {Date} startDate
   */
  startDate: null,

  /**
   * @property {Date} endDate
   */
  endDate: null,

  /**
   * @property {String} status
   * @see gooru-web/config/config.js#GOAL_STATUS
   */
  status: null,

  /**
   * @property {String} reflection
   */
  reflection: null,

  /**
   * @property {number}
   */
  order: null,

  /**
   * @property {boolean} dropped
   */
  dropped: Ember.computed.equal('status', GOAL_STATUS.DROPPED),

  /**
   * @property {boolean} active
   */
  active: Ember.computed.equal('status', GOAL_STATUS.ACTIVE),

  /**
   * @property {boolean} notStarted
   */
  notStarted: Ember.computed.equal('status', GOAL_STATUS.NOT_STARTED),

  /**
   * @property {boolean} completed
   */
  completed: Ember.computed.equal('status', GOAL_STATUS.COMPLETED),

  /**
   * Return a copy of the goal
   *
   * @function
   * @return {Goal}
   */
  copy: function() {
    var properties = this.getProperties(this.modelProperties());

    let title = this.get('title');
    let description = this.get('description');
    let startDate = this.get('startDate');
    let endDate = this.get('endDate');
    let status = this.get('status');
    let reflection = this.get('reflection');

    // Copy info values
    properties.title = title;
    properties.description = description;
    properties.startDate = startDate;
    properties.endDate = endDate;
    properties.status = status;
    properties.reflection = reflection;

    var newGoal = GoalModel.extend(createGoalValidations);
    return newGoal.create(Ember.getOwner(this).ownerInjection(), properties);
  },

  /**
   * Copy a list of property values from another model to override the current ones
   *
   * @function
   * @param {Goal} model
   * @param {String[]} propertyList
   * @return {null}
   */
  merge: function(model, propertyList = []) {
    var properties = model.getProperties(propertyList);
    this.setProperties(properties);
  },

  /**
   * Return a list of Goal properties
   *
   * @function
   * @return {Array}
   */
  modelProperties: function() {
    var properties = [];
    const enumerableKeys = Object.keys(this);
    for (let i = 0; i < enumerableKeys.length; i++) {
      let key = enumerableKeys[i];
      let value = Ember.typeOf(this.get(key));
      if (value === 'string' || value === 'number' || value === 'boolean') {
        properties.push(key);
      }
    }
    return properties;
  }
});

export default GoalModel;
