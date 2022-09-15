import Ember from 'ember';
import FluencyAdapter from 'gooru-web/adapters/fluency';

export default Ember.Service.extend({
  fluencyAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'fluencyAdapter',
      FluencyAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  getFluencyLevel: function(content) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('fluencyAdapter')
        .getFluencyLevel(content)
        .then(function(responseData) {
          resolve(responseData);
        }, reject);
    });
  },

  updateFluencyLevel: function(data, type, id) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('fluencyAdapter')
        .updateFluencyLevel(data, type, id)
        .then(function() {
          resolve();
        }, reject);
    });
  },

  getClassSettingFluency(dataParams) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('fluencyAdapter')
        .getClassSettingFluency(dataParams)
        .then(function(response) {
          resolve(response);
        }, reject);
    });
  },

  updateClassSettingFluencyLevel: function(data) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('fluencyAdapter')
        .updateClassSettingFluencyLevel(data)
        .then(function() {
          resolve();
        }, reject);
    });
  }
});
