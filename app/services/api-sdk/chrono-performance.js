import Ember from 'ember';

import ChronoSerializer from 'gooru-web/serializers/performance/chrono-performance';
import ChronoAdapter from 'gooru-web/adapters/performance/chrono-performance';

export default Ember.Service.extend({
  session: Ember.inject.service(),

  store: Ember.inject.service(),

  chronoSerializer: null,

  chronoAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'chronoSerializer',
      ChronoSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'chronoAdapter',
      ChronoAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  getStudentPerformanceOfIndepedentLearning: function(filter) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let serializedFilterData = service
        .get('chronoSerializer')
        .serializedFilterData(filter);

      service
        .get('chronoAdapter')
        .getStudentPerformanceOfIndepedentLearning({
          body: serializedFilterData
        })
        .then(
          function(responseData) {
            responseData = service
              .get('chronoSerializer')
              .normalizeUsageData(responseData);
            resolve(responseData);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  getStudentPerformanceOfAllItemsInClass: function(filter) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let serializedFilterData = service
        .get('chronoSerializer')
        .serializedFilterData(filter);

      service
        .get('chronoAdapter')
        .getStudentPerformanceOfAllItemsInClass({
          body: serializedFilterData
        })
        .then(
          function(responseData) {
            responseData = service
              .get('chronoSerializer')
              .normalizeUsageData(responseData);
            resolve(responseData);
          },
          function(error) {
            reject(error);
          }
        );
    });
  }
});
