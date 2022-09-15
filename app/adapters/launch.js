import Ember from 'ember';
import EndPointsConfig from 'gooru-web/utils/endpoint-config';

export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  initiateLtiTool: function(toolDetails, resourceId) {
    const url = toolDetails.toolConfig.initate_login_url;
    const dataString = {
      iss: EndPointsConfig.getEndpointSecureUrl(),
      target_link_uri: toolDetails.toolConfig.tool_url,
      login_hint: this.get('session.userId'),
      lti_message_hint: resourceId,
      client_id: toolDetails.clientId,
      lti_deployment_id: toolDetails.toolConfig.deployment_id
    };
    const options = {
      type: 'POST',
      contentType: 'application/x-www-form-urlencoded; charset=utf-8',
      dataType: 'json',
      data: dataString
    };
    return Ember.$.ajax(url, options);
  }
});
