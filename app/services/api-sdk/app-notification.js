import Ember from 'ember';
import NotificationSerializer from 'gooru-web/serializers/notification';
import NotificationAdapter from 'gooru-web/adapters/notification';

export default Ember.Service.extend({
  session: Ember.inject.service(),

  store: Ember.inject.service(),

  notificationSerializer: null,

  notificationAdapter: null,
  notification: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'notificationSerializer',
      NotificationSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'notificationAdapter',
      NotificationAdapter.create(Ember.getOwner(this).ownerInjection())
    );

    this.set('notification', []);
  },

  teacherFetch: function(filter) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let serializedFilterData = service
        .get('notificationSerializer')
        .teacherFetch(filter);
      service
        .get('notificationAdapter')
        .teacherFetch({
          body: serializedFilterData
        })
        .then(
          function(responseData) {
            responseData = service
              .get('notificationSerializer')
              .normalizeFetch(responseData);
            resolve(responseData);
          },
          function(error) {
            const status = error.status;
            if (status === 404) {
              resolve({ status: '404' });
            } else {
              reject(error);
            }
          }
        );
    });
  },

  studentFetch: function(filter) {
    const service = this;
    var that = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let serializedFilterData = (service || that)
        .get('notificationSerializer')
        .studentFetch(filter);
      service
        .get('notificationAdapter')
        .studentFetch({
          body: serializedFilterData
        })
        .then(
          function(responseData) {
            responseData = service
              .get('notificationSerializer')
              .normalizeFetch(responseData);
            resolve(responseData);
          },
          function(error) {
            const status = error.status;
            if (status === 404) {
              resolve({ status: '404' });
            } else {
              reject(error);
            }
          }
        );
    });
  },

  resetTeacherNotification: function(actionId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('notificationAdapter')
        .resetTeacherNotification(actionId)
        .then(
          function(responseData) {
            resolve(responseData);
          },
          function(error) {
            const status = error.status;
            if (status === 404) {
              resolve({ status: '200' });
            } else {
              reject(error);
            }
          }
        );
    });
  },

  resetStudentNotification: function(actionId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('notificationAdapter')
        .resetStudentNotification(actionId)
        .then(
          function(responseData) {
            resolve(responseData);
          },
          function(error) {
            const status = error.status;
            if (status === 404) {
              resolve({ status: '200' });
            } else {
              reject(error);
            }
          }
        );
    });
  }
});
