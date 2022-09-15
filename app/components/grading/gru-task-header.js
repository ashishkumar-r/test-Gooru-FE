import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-task-header'],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Title to show on the header
   * @property {String} promptTitle
   */
  promptTitle: null,

  /**
   * Text to show on the header
   * @property {String} promptText
   */
  promptText: null,

  /**
  * Thumbnail to show on the header
  * @property {String} promptThumbnail
  */
  promptThumbnail: null
});
