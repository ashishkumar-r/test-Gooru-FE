import Ember from 'ember';
import HelpAdapter from 'gooru-web/adapters/notification/help';

/**
 * @typedef {Object} HelpService
 */
export default Ember.Service.extend({
  /**
   * @property {HelpAdapter} helpAdapter
   */
  helpAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'helpAdapter',
      HelpAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  setHelpInfo: function() {
    const service = this;
    service
      .get('helpAdapter')
      .getHelpInfo()
      .then(response => {
        return this.getLocalStorage().setItem(
          'helpInfo',
          JSON.stringify(response.pageIdentifiers)
        );
      });
  },

  getHelpInfoDescription: function(appId, lang) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('helpAdapter')
        .getHelpInfoDescription(appId, lang)
        .then(response => {
          resolve(response), reject;
        });
    });
  },

  /**
   * @function getLocalStorage
   * Method to get local storage instance
   */
  getLocalStorage: function() {
    return window.localStorage;
  },
  getHelpInfo() {
    return this.getLocalStorage().getItem('helpInfo');
  }
});
