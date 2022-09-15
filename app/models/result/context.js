import Ember from 'ember';
/**
 * Model for context inside collection play resource event.
 *
 * @typedef {Object} Context
 *
 */
export default Ember.Object.extend({
  /**
   * @property {string} collectionId - Playing collection / assessment UUID
   */
  collectionId: null,

  /**
   * @property {string} parentGooruId - This event should be collection.play eventId for analytics to associate this event with collection.
   */
  parentEventId: null,

  /**
   * @property {string} sessionId - Session id for the assessment
   */
  sessionId: null,

  /**
   * @property {string} classId - Class unique Id associated for the collection / assessment.
   * Can be null if play is outside context of class.
   */
  classId: null,

  /**
   * @property {string} courseId - Unique of course associated to the class. Can be null if play is outside context of class.
   */
  courseId: null,

  /**
   * @property {string} unitId - Unit unique Id. Can be null if play is outside context of class.
   */
  unitId: null,

  /**
   * @property {string} lessonId - Lesson unique Id. Can be null if play is outside context of class.
   */
  lessonId: null,

  /**
   * @property {string} collectionType - Type of collection/assessment: collection or assessment
   */
  collectionType: null,

  /**
   * @property {string} clientSource - Get Collection/Assessment API will return how many questions available inside assessments.
   */
  clientSource: 0,

  /**
   * @property  {boolean}
   */
  isInContext: Ember.computed.bool('classId')
});
