import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';

export default Ember.Component.extend({
  classNames: ['gru-learning-content-card'],

  session: Ember.inject.service('session'),
  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  actions: {
    onAddActivity() {
      const component = this;
      const content = component.get('content');
      if (!component.get('isEmptyContent')) {
        // based on token we trigger action
        if (component.get('enableVideoConference')) {
          component.sendAction('onAddActivityPop', content);
        } else {
          component.sendAction('onAddActivity', content);
        }
      }
    },

    onShowContentPreview() {
      const component = this;
      const content = component.get('content');
      component.sendAction('onShowContentPreview', content);
    }
  },

  contentType: Ember.computed.alias('content.format'),

  isAssessment: Ember.computed.equal('contentType', CONTENT_TYPES.ASSESSMENT),

  isCollection: Ember.computed.equal('contentType', CONTENT_TYPES.COLLECTION),

  isOfflineActivity: Ember.computed.equal(
    'contentType',
    CONTENT_TYPES.OFFLINE_ACTIVITY
  )
});
