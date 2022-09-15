import Ember from 'ember';

export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus/v1/lookups/fluency',

  updateNamespace: '/api/nucleus/v1',

  classSettingNamespace: '/api/nucleus/v2/classes/members/fluency/list',

  classSettingUpdateNamespace: '/api/nucleus/v2/classes/members/fluency/assign',

  getFluencyLevel: function(requestParams) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: requestParams
    };
    return Ember.$.ajax(url, options);
  },

  updateFluencyLevel: function(data, type, id) {
    const adapter = this;
    const updateNamespace = this.get('updateNamespace');
    const url = `${updateNamespace}/${type}/${id}/fluency`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data)
    };
    return Ember.$.ajax(url, options);
  },

  getClassSettingFluency(dataParams) {
    const adapter = this;
    const url = this.get('classSettingNamespace');
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify(dataParams)
    };
    return Ember.$.ajax(url, options);
  },

  updateClassSettingFluencyLevel: function(data) {
    const adapter = this;
    const url = this.get('classSettingUpdateNamespace');
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data)
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
