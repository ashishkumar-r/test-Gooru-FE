import Ember from 'ember';

/**
 * Properties in common for resource and rubric preview/player.
 *
 * @mixin
 */
export default Ember.Mixin.create({
  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Resource} resource
   */
  resource: null,

  /**
   * The protocol the user is using to access the page (http or https)
   * @property {String}
   */
  currentProtocol: window.location.protocol,

  /**
   * The protocol for the resource url
   * @property {String}
   */
  resourceProtocol: Ember.computed('resource.url', function() {
    const httpsPattern = /^(https:\/\/)/;
    return httpsPattern.test(this.get('resource.url')) ? 'https:' : 'http:';
  }),

  /**
   * Indicates if the current protocol matches the resource protocol
   * @property {boolean}
   */
  sameProtocol: Ember.computed(function() {
    return this.get('currentProtocol') === this.get('resourceProtocol');
  })
});
