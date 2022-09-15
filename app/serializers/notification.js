import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({
  teacherFetch(data) {
    return data;
  },

  studentFetch(data) {
    return data;
  },

  normalizeFetch: data => {
    data.notifications.forEach(d => {
      if (d.milestoneId) {
        d.ctxMilestoneId = d.milestoneId;
        delete d.milestoneId;
      }
    });
    return data;
  },

  updateAction: data => {
    return data;
  }
});
