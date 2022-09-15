import Ember from 'ember';
import SessionMixin from 'gooru-web/mixins/session';

export default Ember.Object.extend(SessionMixin, {
  namespace: '/api/nucleus-insights/v2',
  //namespace: '/api/events/nucleus-insights/v2',

  headers: Ember.computed('session.token-api3', function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }),

  postData: function(data) {
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: this.get('headers'),
      data: JSON.stringify(data.body)
    };
    const apiKey = data.query.apiKey;
    const path = `/event?apiKey=${apiKey}`;

    return Ember.$.ajax(this.get('namespace') + path, options);
  }
});
