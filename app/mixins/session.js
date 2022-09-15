import Ember from 'ember';

/**
 * @typedef {Object} SessionMixin
 */
export default Ember.Mixin.create({
  /**
   * @property {GooruSessionService} Gooru custom session service
   */
  session: Ember.inject.service()
});
