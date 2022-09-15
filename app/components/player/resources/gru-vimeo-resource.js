import Ember from 'ember';
import Env from '../../../config/environment';
/**
 * Vimeo resource component
 *
 * Component responsible for controlling the logic and appearance of the vimeo resource type
 *
 * @module
 * @see controllers/player.js
 * @see components/player/gru-viewer.js
 * @augments Ember/Component
 **/
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-vimeo-resource'],

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Resource} the resource
   */
  resource: null,

  /**
   * @property {string} full resource vimeo url
   */
  vimeoUrl: Ember.computed('resource.url', function() {
    const component = this;
    var vimeoPlayerUrl = Env.player.vimeoPlayerUrl;

    return vimeoPlayerUrl + component.getVimeoID(this.get('resource.url'));
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Get Video ID from a URL
   * @param {string} text
   * @returns {{id: number}} id
   */
  getVimeoID: function(text) {
    const regex = /([^/.]+)$/gm;

    var match = regex.exec(text);
    var id = '';
    if (match !== null) {
      id = match[0];
    }
    return id;
  }
});
