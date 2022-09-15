import Ember from 'ember';
import QuestionResult from 'gooru-web/models/result/question';

/**
 * User resource results
 *
 * @typedef {Object} UserResourcesResult
 *
 */
export default Ember.Object.extend({
  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {boolean} isAttemptStarted - is the user starting a new attempt?
   */
  isAttemptStarted: false,

  /**
   * @property {boolean} isAttemptFinished - is the user finishing the current attempt?
   */
  isAttemptFinished: false,

  /**
   * @property {QuestionResult[]} questionResults
   */
  questionResults: Ember.computed('resourceResults.[]', function() {
    return this.get('resourceResults').filter(function(resourceResult) {
      return resourceResult instanceof QuestionResult;
    });
  }),

  /**
   * @property {ResourceResult[]} questionResults
   */
  resourceResults: [],

  /**
   * @property {string} user
   */
  user: null

  // -------------------------------------------------------------------------
  // Methods
});
