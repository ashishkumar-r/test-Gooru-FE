import Ember from 'ember';

/**
 * Alternate Path model
 * typedef {Object} AlternatePath
 */
export default Ember.Object.extend({
  /**
   * @property {number}
   */
  pathId: 0,

  /**
   * @property {string}
   */
  contextClassId: null,

  /**
   * @property {string}
   */
  contextCourseId: null,

  /**
   * @property {string}
   */
  contextUnitId: null,

  /**
   * @property {string}
   */
  contextLessonId: null,

  /**
   * @property {string}
   */
  contextCollectionId: null,

  /**
   * @property {string}
   */
  targetCourseId: null,

  /**
   * @property {string}
   */
  targetUnitId: null,

  /**
   * @property {string}
   */
  targetLessonId: null,

  /**
   * @property {string}
   */
  targetCollectionId: null,

  /**
   * @property {string}
   */
  targetResourceId: null,

  /**
   * @property {string}
   */
  targetContentType: null,

  /**
   * @property {string}
   */
  targetContentSubtype: null,

  /**
   * @property {string}
   */
  thumbnail: null,

  /**
   * @property {string}
   */
  title: null,

  /**
   * @property {number}
   */
  questionCount: 0,

  /**
   * @property {number}
   */
  openEndedQuestionCount: 0,

  /**
   * @property {number}
   */
  resourceCount: 0
});
