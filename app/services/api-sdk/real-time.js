import Ember from 'ember';

export default Ember.Service.extend({
  notifyResourceResult: function(
    classId,
    collectionId,
    userId,
    resourceResult
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      const eventContent = service
        .get('realTimeSerializer')
        .serialize(resourceResult);
      service
        .get('realTimeAdapter')
        .postData({
          body: eventContent,
          query: {
            classId: classId,
            collectionId: collectionId,
            userId: userId
          }
        })
        .then(
          function() {
            resolve();
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  findResourcesByCollection: function(classId, collectionId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('realTimeAdapter')
        .getData({
          classId: classId,
          collectionId: collectionId
        })
        .then(
          function(events) {
            resolve(
              service.get('realTimeSerializer').normalizeResponse(events)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  notifyAttemptStarted: function(classId, collectionId, userId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('realTimeAdapter')
        .deleteAttempt({
          classId: classId,
          collectionId: collectionId,
          userId: userId
        })
        .then(
          function() {
            resolve();
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  notifyAttemptFinished: function(classId, collectionId, userId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('realTimeAdapter')
        .postAttempt({
          classId: classId,
          collectionId: collectionId,
          userId: userId
        })
        .then(
          function() {
            resolve();
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  turnOnAirOn: function(classId, collectionId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('realTimeAdapter')
        .postOnAir({
          classId: classId,
          collectionId: collectionId
        })
        .then(
          function() {
            resolve();
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  turnOnAirOff: function(classId, collectionId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('realTimeAdapter')
        .deleteOnAir({
          classId: classId,
          collectionId: collectionId
        })
        .then(
          function() {
            resolve();
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  isOnAir: function(classId, collectionId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('realTimeAdapter')
        .isOnAir({
          classId: classId,
          collectionId: collectionId
        })
        .then(
          function() {
            resolve();
          },
          function(error) {
            reject(error);
          }
        );
    });
  }
});
