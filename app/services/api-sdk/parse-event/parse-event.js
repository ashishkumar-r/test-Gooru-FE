import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import { APP_ID } from 'gooru-web/config/parse-event';
import { getDeviceInfo } from 'gooru-web/utils/device-info';
import ParseEventsAdapter from 'gooru-web/adapters/parse-events/parse-event';
import { generateUUID } from 'gooru-web/utils/utils';

/**
 * Service to forward events to cast and catch API
 *
 * @typedef {Object} ParseEventsService
 */
export default Ember.Service.extend(ConfigurationMixin, {
  /**
   * @property {Service} Session service
   */
  sessionService: Ember.inject.service('api-sdk/session'),

  appVersion: Ember.computed.alias('configuration.APP_VERSION'),

  init: function() {
    this._super(...arguments);
    this.set(
      'parseEventsAdapter',
      ParseEventsAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  postParseEvent(eventName, eventItem) {
    const service = this;
    const eventData = {
      sessionId: service.getParseEventId(),
      appId: APP_ID,
      eventName: eventName,
      appVersion: service.get('appVersion'),
      deviceInfo: getDeviceInfo(),
      tenantId: service.get('sessionService').get('session.tenantId'),
      userId: service.get('sessionService').get('session.userId'),
      userName: service.get('sessionService').get('session.userData.username'),
      timezone: moment.tz(moment.tz.guess()).zoneAbbr(),
      tenantShortName: service
        .get('sessionService')
        .get('session.tenantShortName')
    };
    if (eventItem) {
      eventData.context = eventItem;
    }
    service.get('parseEventsAdapter').postParseEvent(eventData);
  },

  getParseConfig() {
    const service = this;
    return service.get('parseEventsAdapter').getParseConfig();
  },

  getCurrentLocation() {
    return this.get('parseEventsAdapter').getCurrentLocation();
  },

  getParseEventId() {
    let existingSessionId = window.localStorage.getItem('parse_event_session');
    if (!existingSessionId) {
      existingSessionId = generateUUID();
      window.localStorage.setItem('parse_event_session', existingSessionId);
    }
    return existingSessionId;
  }
});
