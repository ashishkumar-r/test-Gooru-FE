import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['player', 'gru-player-done'],
  // -------------------------------------------------------------------------
  // Properties

  /**
   * The class id to transition to
   * @property {String}
   */
  classId: null
});
