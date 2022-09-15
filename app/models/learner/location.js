import Ember from 'ember';

/**
 * Learner location model
 *
 * @typedef {Object} Location
 */
const LearnerLocationModel = Ember.Object.extend({
  /**
   * @property {String} collectionId - Gooru id for the collection
   */
  collectionId: null,

  /**
   * @property {String} courseId - Gooru id for the course
   */
  courseId: null,

  /**
   * @property {String} lessonId - Gooru id for the lesson
   */
  lessonId: null,

  /**
   * @property {String} unitId - Gooru id for the unit
   */
  unitId: null,

  /**
   * @property {String} currentId - current activity id
   */
  currentId: null,

  /**
   * @property {String} currentTitle - current activity title
   */
  currentTitle: null,

  /**
   * @property {String} currentType - current activity type
   */
  currentType: null,

  /**
   * @property {Boolean} isCompleted - if the content has been completed
   */
  isCompleted: Ember.computed.equal('status', 'complete'),

  /**
   * @property {Date} lastAccessed - last date the content was accessed
   */
  lastAccessed: null,

  /**
   * @property {String} title - content title
   */
  title: null,

  /**
   * @property {String} type - one of course, assessment or collection
   */
  type: null
});

export default LearnerLocationModel;
