import Ember from 'ember';
import SessionMixin from 'gooru-web/mixins/session';

export default Ember.Object.extend(SessionMixin, {
  namespace: '/api/nucleus-insights/v2',
  externalNamespace: '/api/nucleus-insights/v2/event',

  headers: Ember.computed('session.token-api3', function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }),

  postData: function(data) {
    const namespace = this.get('namespace');
    const apiKey = data.query.apiKey;
    const path = `${namespace}/event?apiKey=${apiKey}`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: this.get('headers'),
      data: JSON.stringify(data.body)
    };
    return Ember.$.ajax(path, options);
  },

  postExternalData: function(data) {
    const namespace = this.get('externalNamespace');
    const apiKey = data.query.apiKey;
    const path = `${namespace}/external?apiKey=${apiKey}`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: this.get('headers'),
      data: JSON.stringify(data.body)
    };
    return Ember.$.ajax(path, options);
  }
});
