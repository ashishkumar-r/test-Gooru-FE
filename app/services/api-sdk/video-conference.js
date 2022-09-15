import Ember from 'ember';
import VideoConferenceAdapter from 'gooru-web/adapters/video-conference/video-conference';

export default Ember.Service.extend({
  session: Ember.inject.service(),

  store: Ember.inject.service(),

  videoConferenceAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'videoConferenceAdapter',
      VideoConferenceAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  fetchConferenceToken() {
    const service = this;
    let localStorage = window.localStorage;
    return new Ember.RSVP.Promise((resolve, reject) => {
      if (
        !localStorage.getItem(
          `user_vid_config_${service.get('session.userId')}`
        )
      ) {
        return service
          .get('videoConferenceAdapter')
          .fetchConferenceToken()
          .then(
            token => {
              localStorage.setItem(
                `user_vid_config_${service.get('session.userId')}`,
                token.accessToken
              );
              resolve(token);
            },
            () => {
              resolve();
            },
            reject
          );
      } else {
        return resolve();
      }
    });
  },

  authorizeConference(redirectionUrl) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('videoConferenceAdapter')
        .authorizeConference(redirectionUrl)
        .then(
          () => {
            return;
          },
          xhr => {
            return resolve(xhr.getResponseHeader('Location'));
          },
          reject
        );
    });
  },

  createConferenceEvent(meetingInfo) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('videoConferenceAdapter')
        .createConferenceEvent(meetingInfo)
        .then(info => {
          resolve({
            meetingId: info.meetingEventId,
            meetingUrl: info.meetingHangoutUrl
          });
        }, reject);
    });
  },

  updateConferenceCalendarEvent(id, meetingInfo) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('videoConferenceAdapter')
        .updateConferenceCalendarEvent(id, meetingInfo)
        .then(resolve, reject);
    });
  },

  deleteConferenceCalendarEvent(id) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('videoConferenceAdapter')
        .deleteConferenceCalendarEvent(id)
        .then(resolve, reject);
    });
  },

  updateConferenceEvent(params) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('videoConferenceAdapter')
        .updateConferenceEvent(params)
        .then(() => {
          resolve();
        }, reject);
    });
  },

  deleteConferenceEvent(params) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('videoConferenceAdapter')
        .deleteConferenceEvent(params)
        .then(() => {
          resolve();
        }, reject);
    });
  },

  fetchZoomToken() {
    const service = this;
    let localStorage = window.localStorage;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('videoConferenceAdapter')
        .fetchZoomToken()
        .then(
          token => {
            localStorage.setItem(
              `user_zoom_vid_config_${service.get('session.userId')}`,
              token.accessToken
            );
            resolve(token);
          },
          () => {
            resolve();
          },
          reject
        );
    });
  },

  authorizeZoom(redirectionUrl) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('videoConferenceAdapter')
        .authorizeZoom(redirectionUrl)
        .then(
          () => {
            return;
          },
          xhr => {
            return resolve(xhr.getResponseHeader('Location'));
          },
          reject
        );
    });
  },

  createZoomMeeting(meetingInfo) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('videoConferenceAdapter')
        .createZoomMeeting(meetingInfo)
        .then(
          function(info) {
            resolve({
              meetingId: `${info.id}`,
              meetingUrl: info.join_url
            });
          },
          function(error) {
            if (error.status === 400 || error.status === 404) {
              resolve(error.status);
            } else {
              reject(error);
            }
          }
        );
    });
  },

  updateZoomMeeting(id, meetingInfo) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('videoConferenceAdapter')
        .updateZoomMeeting(id, meetingInfo)
        .then(resolve, reject);
    });
  },

  deleteZoomMeeting(id) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('videoConferenceAdapter')
        .deleteZoomMeeting(id)
        .then(resolve, reject);
    });
  },
  createConferenceCaCard(meetingInfo) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('videoConferenceAdapter')
        .createConferenceCaCard(meetingInfo)
        .then(resolve, reject);
    });
  }
});
