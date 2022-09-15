import Ember from 'ember';
import ErrorSerializer from 'gooru-web/serializers/error/error';
import ErrorAdapter from 'gooru-web/adapters/error/error';
import { APP_ID } from 'gooru-web/config/parse-event';
import { getDeviceInfo } from 'gooru-web/utils/device-info';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Service.extend(ConfigurationMixin, {
  errorSerializer: null,

  errorAdapter: null,
  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  appVersion: Ember.computed.alias('configuration.APP_VERSION'),

  init: function() {
    this._super(...arguments);
    this.set(
      'errorSerializer',
      ErrorSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'errorAdapter',
      ErrorAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   *
   * @param {Error} error
   * @returns {Test.Promise|*|RSVP.Promise}
   */
  createError: function(error) {
    var service = this;
    Ember.Logger.error(error);
    const eventData = {
      errorType: 'fatal',
      userId: error.userId,
      sessionId: service.get('parseEventService').getParseEventId(),
      appId: APP_ID,
      appVersion: service.get('appVersion'),
      deviceInfo: getDeviceInfo(),
      timezone: moment.tz(moment.tz.guess()).zoneAbbr(),
      log: error.details.stack
    };
    service.get('errorAdapter').errorParseEvent(eventData);

    return new Ember.RSVP.Promise(function(resolve) {
      const errorContent = service.get('errorSerializer').serializeError(error);
      service
        .get('errorAdapter')
        .createError({ body: errorContent })
        .then(
          function() {
            resolve();
          },
          function() {
            resolve();
          }
        );
    });
  }
});
