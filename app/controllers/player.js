import QuizzesPlayerController from 'quizzes-addon/controllers/player';

/**
 * @module
 * @typedef {Object} PlayerController
 *
 * @augments Ember/Controller
 */
export default QuizzesPlayerController.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  queryParams: [
    'resourceId',
    'role',
    'type',
    'sourceId',
    'source',
    'classId',
    'isStudyPlayer',
    'caContentId',
    'isIframeMode',
    'isPreviewReferrer'
  ],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Query param
   * @property {string} resourceId
   */
  resourceId: null,

  /**
   * Query param
   * @property {string} caContentId
   */
  caContentId: null,

  /**
   * Indicates the user's role, could be 'student', 'teacher' or null
   * This property is not used for the context-player
   * @property {string}
   */
  role: null,

  /**
   * Indicates the component of the application that is originating the events
   * @property {String} source
   */
  source: null,

  /**
   * Query param indicating if it is a collection or assessment
   * @property {string}
   */
  type: null,

  /**
   * @property {Boolean}
   * Property to find out whether study-player rendered or not
   */
  isStudyPlayer: false,

  /**
   * @property {Boolean}
   * Property to find out whether player pullup close or not
   */
  isIframeMode: false,

  // -------------------------------------------------------------------------
  // Methods
  /**
   * Resets to default values
   */
  resetValues: function() {
    this.setProperties({
      role: null,
      source: null,
      sourceId: null,
      resourceId: null,
      caContentId: null,
      type: null
    });
  }
});
