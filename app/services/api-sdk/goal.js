import Ember from 'ember';
import GoalSerializer from 'gooru-web/serializers/goal/goal';
import GoalAdapter from 'gooru-web/adapters/goal/goal';

/**
 * Goal Service
 *
 * Service responsible for performing CRUD operations on a goal model
 *
 * @typedef {Object} GoalService
 * @augments Ember/Service
 */
export default Ember.Service.extend({
  // -------------------------------------------------------------------------
  // Events

  init: function() {
    this._super(...arguments);
    this.set(
      'serializer',
      GoalSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'adapter',
      GoalAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  // -------------------------------------------------------------------------
  // Properties

  i18n: Ember.inject.service(),

  /**
   * @property {GoalSerializer} serializer
   */
  serializer: null,

  /**
   * @property {GoalAdapter} adapter
   */
  adapter: null,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Creates a goal
   * @param {Goal} goal
   * @returns {Promise|Goal} returns the goal model with the newly assigned ID
   */
  createGoal: function(goal) {
    var data = this.get('serializer').serializeCreateGoal(goal);

    return this.get('adapter').createGoal(data).then(function(goalId) {
      goal.set('id', goalId);
      return goalId;
    });
  },

  /**
   * Updates a goal
   * @param {Goal} goal
   * @returns {Promise|Goal} returns the goal model
   */
  updateGoal: function(goal, goalId) {
    var data = this.get('serializer').serializeGoal(goal);

    return this.get('adapter').updateGoal(data, goalId).then(function() {
      return goal;
    });
  },

  /**
   * Deletes a goal
   * @param {String} goalId
   * @returns {Promise|boolean} returns true if deleted
   */
  deleteGoal: function(goalId) {
    return this.get('adapter').deleteGoal(goalId);
  },

  /**
   * Returns user goals
   * @param {string} userId
   * @returns {Promise|Goal[]}
   */
  getGoalsByUser: function(userId) {
    const service = this;
    return service
      .get('adapter')
      .getGoalsByUser(userId)
      .then(function(goalsData) {
        return service.get('serializer').normalizeGetGoals(goalsData);
      });
  },

  /**
   * Get Status Options
   * @returns {Array} returns the list of possible status for a goal
   */
  getGoalStatusOptions: function() {
    let options = [
      {
        id: 'not_started',
        name: this.get('i18n').t('goals.manage.not_started').string
      },
      {
        id: 'activated',
        name: this.get('i18n').t('goals.manage.activated').string
      },
      {
        id: 'completed',
        name: this.get('i18n').t('goals.manage.completed').string
      },
      {
        id: 'dropped',
        name: this.get('i18n').t('goals.manage.dropped').string
      }
    ];
    return options;
  },

  /**
   * Check the order of dates
   * @param {Goal} goal
   * @returns Boolean
   */
  checkBothDates: function(startDate, endDate) {
    let areOk = true;
    if (startDate > endDate) {
      areOk = false;
    }
    return areOk;
  }
});
