import Ember from 'ember';
import EndPointsConfig from 'gooru-web/utils/endpoint-config';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-launch'],

  // -------------------------------------------------------------------------
  // Dependencies
  launchService: Ember.inject.service('api-sdk/launch'),

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    let component = this;
    component.initialize();
  },
  initialize() {
    let component = this;
    let toolDetails = component.get('toolDetails');
    let classId = component.get('mapLocation.context.classId');
    if (!classId) {
      classId = component.get('resource.id');
    }
    const url = toolDetails.toolConfig.initate_login_url;
    let launchContainer = toolDetails.toolConfig.default_launch_container;

    if (launchContainer !== 'Embed') {
      component.$('form')[0].target = '_blank';
      const parentUrl = new URL(window.location.href);
      window.location.href = parentUrl.href;
    }

    component.$('form')[0].action = url;
    document.getElementById(
      'iss'
    ).value = EndPointsConfig.getEndpointSecureUrl();
    document.getElementById('tlink').value = toolDetails.toolConfig.tool_url;
    document.getElementById('login_hint').value = this.get('session.userId');
    document.getElementById('lti_message_hint').value = classId;
    document.getElementById('client_id').value = toolDetails.clientId;
    document.getElementById('lti_deployment_id').value =
      toolDetails.toolConfig.deployment_id;
    document.ltiInitiateLoginForm.submit();
  }
});
