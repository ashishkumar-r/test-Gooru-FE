import Ember from 'ember';

export default Ember.Object.extend({
  session: Ember.inject.service(),

  namespace: '/api/ds/users/v2',

  namespace1: '/api/nucleus/v2/classes',

  fetchDashboardPerformance(params) {
    let adapter = this;
    const endpoint = `${adapter.get('namespace')}/stats/class/timespent`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      dataType: 'json',
      data: JSON.stringify(params)
    };
    return Ember.$.ajax(endpoint, options);
  },

  fetchLessonStats(params) {
    let adapter = this;
    const endpoint = `${adapter.get('namespace')}/stats/class/lesson`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      dataType: 'json',
      data: JSON.stringify(params)
    };
    return Ember.$.ajax(endpoint, options);
  },

  fetchSuggestionStats(params) {
    let adapter = this;
    const endpoint = `${adapter.get('namespace')}/stats/class/suggestions`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      dataType: 'json',
      data: JSON.stringify(params)
    };
    return Ember.$.ajax(endpoint, options);
  },

  fetchStreakStats(params) {
    let adapter = this;
    const endpoint = `${adapter.get(
      'namespace'
    )}/stats/class/streakcompetencies`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      dataType: 'json',
      data: JSON.stringify(params)
    };
    return Ember.$.ajax(endpoint, options);
  },

  fetchMasteredStats(params) {
    let adapter = this;
    const endpoint = `${adapter.get(
      'namespace'
    )}/stats/class/competency/greaterthan90`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      dataType: 'json',
      data: JSON.stringify(params)
    };
    return Ember.$.ajax(endpoint, options);
  },

  fetchMilestoneStats(params) {
    let adapter = this;
    const endpoint = `${adapter.get('namespace')}/stats/class/milestone`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      dataType: 'json',
      data: params
    };
    return Ember.$.ajax(endpoint, options);
  },

  fetchDiagnasticStats(params) {
    let adapter = this;
    const endpoint = `${adapter.get('namespace')}/stats/class/diagnostic`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      dataType: 'json',
      data: params
    };
    return Ember.$.ajax(endpoint, options);
  },

  fetchRemindersList(params) {
    let adapter = this;
    const endpoint = `${adapter.get('namespace1')}/${
      params.classId
    }/contents/reminders`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      dataType: 'json'
    };
    return Ember.$.ajax(endpoint, options);
  },
  fetchAssessment(classId) {
    let adapter = this;
    const url = `${adapter.get(
      'namespace'
    )}/stats/class/diagnostic/assessments?classId=${classId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      dataType: 'json'
    };
    return Ember.$.ajax(url, options);
  },
  getDiagnosticAssessment(params) {
    let adapter = this;
    const endpoint = `${adapter.get(
      'namespace'
    )}/stats/class/diagnostic/domain`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      dataType: 'json',
      data: params
    };
    return Ember.$.ajax(endpoint, options);
  },
  getAllDomain(classId) {
    let adapter = this;
    const endpoint = `${adapter.get(
      'namespace'
    )}/stats/class/diagnostic/domain/details?classId=${classId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      dataType: 'json'
    };
    return Ember.$.ajax(endpoint, options);
  },
  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
