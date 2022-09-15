import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';

/**
 * Builder lesson item
 *
 * @typedef {Object} Content/LessonItem
 */
export default Ember.Object.extend({
  /**
   * @property {String} id - Gooru id for the lesson item
   */
  id: '',

  /**
   * @property {String} thumbnailUrl - Lesson item image url
   */
  thumbnailUrl: null,

  /**
   * @property {Boolean} isCollection
   */
  isCollection: Ember.computed('format', function() {
    return this.get('format') === CONTENT_TYPES.COLLECTION;
  }),

  /**
   * @property {Boolean} isExternalAssessment
   */
  isExternalAssessment: Ember.computed('format', function() {
    return this.get('format') === CONTENT_TYPES.EXTERNAL_ASSESSMENT;
  }),

  /**
   * @property {Boolean} isOfflineActivity
   */
  isOfflineActivity: Ember.computed('format', function() {
    return this.get('format') === CONTENT_TYPES.OFFLINE_ACTIVITY;
  }),

  /**
   * @property {Boolean} isAssessment
   */
  isAssessment: Ember.computed('format', function() {
    return this.get('format') === CONTENT_TYPES.ASSESSMENT;
  }),

  /**
   * @property {String} format - Type of lesson item
   */
  format: null,

  /**
   * @property {String} url
   */
  url: null,

  collectionType: Ember.computed.alias('format'),

  /**
   * @property {Number} questionCount - total number of questions in the lesson
   */
  questionCount: 0,

  /**
   * @property {Number} openEndedQuestionCount - total number of open ended questions in the lesson
   */
  openEndedQuestionCount: 0,

  /**
   * @property {Number} resourceCount - total number of resources in the lesson
   */
  resourceCount: 0,

  /**
   * @property {String} sequence - sequence order among other lesson items
   */
  sequence: 0,

  /**
   * @property {String} title
   */
  title: '',

  /**
   * @property {Number} membersCount - number of members in the collection|assessment (for analytics)
   */
  membersCount: 0,

  /**
   * @property {Profile[]} members - members in the collection|assessment (for analytics)
   */
  members: [],

  /**
   * This property is not always available, it contains the lesson item(collection) performance information
   * @see components/class/overview/gru-accordion-lesson.js
   * @property {CollectionPerformance|Ember.Object}
   */
  performance: null,

  /**
   * @propery {boolean} indicates if the lesson item has non open ended questions
   */
  hasNonOpenEndedQuestions: Ember.computed(
    'questionCount',
    'openEndedQuestionCount',
    function() {
      return this.get('questionCount') !== this.get('openEndedQuestionCount');
    }
  )
});
