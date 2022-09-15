import Ember from 'ember';
import Env from '../../../config/environment';

/**
 * Youtube resource component
 *
 * Component responsible for controlling the logic and appearance of the youtube resource type
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

  classNames: ['gru-youtube-resource'],

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
   * @property {string} full resource youtube url
   */
  youtubeUrl: Ember.computed('resource.url', function() {
    const url = this.get('resource.url');
    const youtubeId = this.getYoutubeIdFromUrl(url);
    const player = Env.player.youtubePlayerUrl;
    return `${player +
      youtubeId}?start=${this.get('start')}&end=${this.get('stop')}&rel=0`;
  }),

  /**
   * @property {string}Begin playing the video at the given number of seconds from the start of the video
   */
  start: Ember.computed('resource', function() {
    const component = this;
    let resourse = component.get('resource.playerMetadata');
    let timeLine = resourse ? resourse[resourse.length - 1] : null;
    return timeLine && timeLine.start_time
      ? component.convertToSeconds(timeLine.start_time)
      : null;
  }),

  /**
   * @property {string}The time, measured in seconds from the start of the video, when the player should stop playing the video
   */
  stop: Ember.computed('resource', function() {
    const component = this;
    let resourse = component.get('resource.playerMetadata');
    let timeLine = resourse ? resourse[resourse.length - 1] : null;
    return timeLine && timeLine.end_time
      ? component.convertToSeconds(timeLine.end_time)
      : 0;
  }),
  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods
  /**
   * Retrieves the youtube id from a url
   * @param url
   * @returns {*}
   */
  getYoutubeIdFromUrl: function(url) {
    const regexp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    var match = url.match(regexp);
    if (match && match[2].length === 11) {
      return match[2];
    }
  },

  /**
   * Convert the time in this format 00:00:00 to seconds
   */
  convertToSeconds: function(time) {
    var sections = time.split(':');
    return (
      parseInt(sections[0] * 3600) +
      parseInt(sections[1] * 60) +
      parseInt(sections[2])
    );
  }
});
