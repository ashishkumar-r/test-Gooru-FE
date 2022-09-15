import Ember from 'ember';
import SessionMixin from 'gooru-web/mixins/session';

export default Ember.Object.extend(SessionMixin, {
  namespace: '/nucleus/realtime',

  headers: Ember.computed('session.token', function() {
    return {
      'gooru-session-token': this.get('session.token'), //TODO change RT BE to support authorization token
      Authorization: `Token ${this.get('session.token')}`
    };
  }),

  postData: function(data) {
    const namespace = this.get('namespace');
    const classId = data.query.classId;
    const collectionId = data.query.collectionId;
    const userId = data.query.userId;
    const url = `${namespace}/class/${classId}/collection/${collectionId}/user/${userId}/event`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: this.get('headers'),
      data: JSON.stringify(data.body)
    };
    return Ember.$.ajax(url, options);
  },

  getData: function(query) {
    const namespace = this.get('namespace');
    const classId = query.classId;
    const collectionId = query.collectionId;
    const path = `${namespace}/class/${classId}/collection/${collectionId}/events`;
    const options = {
      type: 'GET',
      dataType: 'json',
      headers: this.get('headers')
    };
    return Ember.$.ajax(path, options);
  },

  postAttempt: function(query) {
    const namespace = this.get('namespace');
    const classId = query.classId;
    const collectionId = query.collectionId;
    const userId = query.userId;
    const path = `${namespace}/class/${classId}/collection/${collectionId}/user/${userId}/complete`;
    const options = {
      type: 'POST',
      dataType: 'text',
      headers: this.get('headers')
    };
    return Ember.$.ajax(path, options);
  },

  deleteAttempt: function(query) {
    const namespace = this.get('namespace');
    const classId = query.classId;
    const collectionId = query.collectionId;
    const userId = query.userId;
    const url = `${namespace}/class/${classId}/collection/${collectionId}/user/${userId}/reset`;
    const options = {
      type: 'DELETE',
      dataType: 'text',
      headers: this.get('headers')
    };
    return Ember.$.ajax(url, options);
  },

  postOnAir: function(query) {
    const url = this.urlForOnAir(query);
    const options = {
      type: 'POST',
      dataType: 'text',
      headers: this.get('headers')
    };
    return Ember.$.ajax(url, options);
  },

  deleteOnAir: function(query) {
    const url = this.urlForOnAir(query);
    const options = {
      type: 'DELETE',
      dataType: 'text',
      headers: this.get('headers')
    };
    return Ember.$.ajax(url, options);
  },

  isOnAir: function(query) {
    const url = this.urlForOnAir(query);
    const options = {
      type: 'GET',
      dataType: 'text',
      headers: this.get('headers')
    };
    return Ember.$.ajax(url, options);
  },

  urlForOnAir: function(query) {
    const namespace = this.get('namespace');
    const classId = query.classId;
    const collectionId = query.collectionId;
    return `${namespace}/class/${classId}/collection/${collectionId}/onair`;
  }
});
