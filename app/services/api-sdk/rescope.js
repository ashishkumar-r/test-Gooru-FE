import Ember from 'ember';
import RescopeSerializer from 'gooru-web/serializers/rescope/rescope';
import RescopeAdapter from 'gooru-web/adapters/rescope/rescope';

export default Ember.Service.extend({
  /**
   * @property {RescopeSerializer} rescopeSerializer
   */
  rescopeSerializer: null,

  /**
   * @property {RescopeAdapter} rescopeAdapter
   */
  rescopeAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'rescopeSerializer',
      RescopeSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'rescopeAdapter',
      RescopeAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Get rescope contents from the scope skipped API
   * @function getSkippedContents
   * @returns {Ember.RSVP.Promise}
   */
  getSkippedContents(filter) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('rescopeAdapter')
        .getSkippedContents(filter)
        .then(
          response =>
            resolve(
              service
                .get('rescopeSerializer')
                .normalizeSkippedContents(response)
            ),
          reject
        );
    });
  },
  /**
   * Get rescope contents from the API
   * @function getRescopeItems
   * @returns {Ember.RSVP.Promise}
   */
  getRescopeItems(params) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('rescopeAdapter')
        .getRescopeItems(params)
        .then(
          response =>
            resolve(
              service
                .get('rescopeSerializer')
                .normalizeRescopeContents(response)
            ),
          reject
        );
    });
  }
});
