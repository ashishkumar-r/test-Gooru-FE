import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['cards', 'no-suggest-result-found'],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Maintains  the state of search result
   * @type {Boolean}
   */
  isFromSearch: false
});
