import Ember from 'ember';
import EndPointsConfig from 'gooru-web/utils/endpoint-config';
import Env from '../config/environment';

export default {
  name: 'ajax',
  after: 'gooru-configuration',
  initialize: function(/* app */) {
    Ember.$.ajaxSetup({
      cache: false,
      crossDomain: true,
      beforeSend: function(jqXHR, settings) {
        const url = settings.url;
        if (url.startsWith('/')) {
          if (
            url.startsWith(EndPointsConfig.getRealTimeWebServiceUri()) ||
            url.startsWith(EndPointsConfig.getRealTimeWebSocketUri())
          ) {
            const realTimeUrl = EndPointsConfig.getRealTimeWebServiceUrl();
            settings.url = `${realTimeUrl}${url}`;
          } else {
            const endpointUrl = EndPointsConfig.getEndpointUrl();
            settings.url = `${endpointUrl}${url}`;
          }
        }
      }
    });

    let rootElement = Env.rootElement;
    Ember.$(document).ajaxStart(function() {
      Ember.$(rootElement).addClass('network-inprogress');
    });

    Ember.$(document).ajaxStop(function() {
      Ember.$(rootElement).removeClass('network-inprogress');
    });
    Ember.$(document).ajaxError(function() {
      Ember.$(rootElement).removeClass('network-inprogress');
    });
  }
};
