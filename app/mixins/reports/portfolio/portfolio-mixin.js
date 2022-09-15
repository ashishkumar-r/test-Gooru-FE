import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';

export default Ember.Mixin.create({
  // -------------------------------------------------------------------------
  // Dependencies
  portfolioService: Ember.inject.service('api-sdk/portfolio'),

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered while selecting an attempt
    onSelectAttempt(attempt) {
      const mixin = this;
      mixin.set('activeAttempt', attempt);
      mixin.loadActivityPerformance(attempt);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {UUID} userId
   */
  userId: Ember.computed(function() {
    return this.get('session.userId');
  }),

  /**
   * @property {Object} activeAttempt
   * Property for active/selected attempt object
   */
  activeAttempt: Ember.computed('activityAttempts.[]', function() {
    const mixin = this;
    const activityAttempts = mixin.get('activityAttempts');
    return activityAttempts
      ? activityAttempts.objectAt(0)
      : Ember.Object.create({});
  }),

  /**
   * @property {Object} latestAttempt
   * Property for latest attempt
   */
  latestAttempt: Ember.computed('activityAttempts.[]', function() {
    const mixin = this;
    const activityAttempts = mixin.get('activityAttempts');
    return activityAttempts
      ? activityAttempts.objectAt(0)
      : Ember.Object.create({});
  }),

  /**
   * @property {Object} currentAttempt
   * Property for current attempt
   */
  currentAttempt: Ember.computed('currentAttempts.[]', function() {
    const mixin = this;
    const currentAttempts = mixin.get('currentAttempts');
    return currentAttempts
      ? currentAttempts.objectAt(0)
      : Ember.Object.create({});
  }),

  /**
   * @property {Number} totalNumberOfAttempts
   * Property for total number of attempts done by student
   */
  totalNumberOfAttempts: Ember.computed('activityAttempts.[]', function() {
    return this.get('activityAttempts.length');
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadActivityAttempts
   * @return {Array} activityAttempts
   * Method to load list of activity attempts
   */
  loadActivityAttempts() {
    const mixin = this;
    return Ember.RSVP.hash({
      activityAttempts: mixin.fetchActivityAttempts()
    }).then(({ activityAttempts }) => {
      if (!mixin.isDestroyed) {
        mixin.set('activityAttempts', activityAttempts);

        let currentAttempts;
        let otherAttempts;
        let startDate = new Date(mixin.get('startDate')).getTime();
        let endDate = new Date(mixin.get('endDate')).getTime();
        if (startDate && endDate) {
          currentAttempts = activityAttempts.filter(d => {
            var currentDate = new Date(d.updatedAt).getTime();
            return startDate < currentDate && endDate > currentDate;
          });
          otherAttempts = activityAttempts.filter(d => {
            var otherDate = new Date(d.updatedAt).getTime();
            return startDate > otherDate || endDate < otherDate;
          });
        } else if (endDate) {
          currentAttempts = activityAttempts.filter(d => {
            var currentDate = new Date(d.updatedAt).getTime();
            return endDate < currentDate;
          });
          otherAttempts = activityAttempts.filter(d => {
            var otherDate = new Date(d.updatedAt).getTime();
            return endDate > otherDate;
          });
        }
        mixin.set('currentAttempts', currentAttempts);
        mixin.set('otherAttempts', otherAttempts);
      }
      return activityAttempts;
    });
  },

  /**
   * @function loadActivityPerformance
   * @param {Object} activityAttempt
   * @return {Object} activityPerformance
   * Method to load performance summary of an activity
   */
  loadActivityPerformance(activityAttempt) {
    const mixin = this;
    return Ember.RSVP.hash({
      activityPerformance: mixin.fetchActivityAttemptPerformance(
        activityAttempt
      )
    }).then(({ activityPerformance }) => {
      if (!mixin.isDestroyed) {
        mixin.set('activeAttempt.timespent', activityPerformance.timespent);
        mixin.set('activityPerformance', activityPerformance);
      }
      return activityPerformance;
    });
  },

  /**
   * @function fetchActivityAttempts
   * @return {Promise.activityAttempts}
   * Method to fetch activity attempts promise
   */
  fetchActivityAttempts() {
    const mixin = this;
    const userId = mixin.get('userId');
    const itemId = mixin.get('contentId');
    const requestParams = {
      userId,
      itemId
    };
    return mixin.get('portfolioService').getAllAttemptsByItem(requestParams);
  },

  /**
   * @function fetchActivityAttemptPerformance
   * @param {Object} activityAttempt
   * @return {Promise.activityPerformance}
   * Method to fetch activity performance by given attempt
   */
  fetchActivityAttemptPerformance(activityAttempt) {
    const mixin = this;
    const activityAttempts = this.get('activityAttempts');
    const currentAttempts = activityAttempts.sortBy('updatedAt');
    const currentAttempt = activityAttempt
      ? activityAttempt
      : currentAttempts[currentAttempts.length - 1];
    const userId = mixin.get('userId');
    let sessionId = currentAttempt
      ? currentAttempt.get('sessionId')
      : activityAttempts[activityAttempts.length - 1].get('sessionId');
    if (mixin.get('isNotShowListAttempt')) {
      sessionId = activityAttempt.get('sessionId');
    }
    const itemId = activityAttempt.get('id');
    const contentSource = activityAttempt.get('contentSource');
    const activityType = activityAttempt
      .get('type')
      .includes(CONTENT_TYPES.ASSESSMENT)
      ? CONTENT_TYPES.ASSESSMENT
      : CONTENT_TYPES.COLLECTION;
    const requestParams = {
      userId,
      itemId,
      sessionId,
      contentSource
    };
    return mixin
      .get('portfolioService')
      .getActivityPerformanceBySession(requestParams, activityType);
  }
});
