import Ember from 'ember';

/**
 * Initialize session validation function
 */
export function initialize(application) {
  const sessionService = application.lookup('service:session');

  Ember.$(document).ajaxError(function(event, jqXHR) {
    if (jqXHR.status === 401) {
      let url = window.location.href;
      let hasAccessTokenInRequestParam = url.indexOf('access_token') > 0;
      if (hasAccessTokenInRequestParam) {
        window.location.href = '/login';
      } else {
        sessionService.invalidate();
      }
    } else if (jqXHR.status === 403) {
      window.location.href = '/';
    }
  });
}

export default {
  name: 'gooru-session-validation',
  after: 'gooru-session-service',
  initialize: initialize
};
