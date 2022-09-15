import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['gru-adw-report-preview'],

  tableHeaders: null,

  studentEvidence: null,

  didInsertElement() {
    this.getEvidenceData();
  },

  getEvidenceData() {
    const tableHeaders = this.get('tableHeaders');
    const studentEvidence = this.get('studentEvidence');
    studentEvidence.forEach(item => {
      const studentData = {};
      item.evidence.forEach(evidence => {
        tableHeaders.forEach(header => {
          if (!studentData[header]) {
            studentData[header] = [];
          }
          if (header === 'images') {
            studentData[header] = studentData[header].concat(evidence[header]);
          } else {
            studentData[header].push(evidence[header]);
          }
        });
      });
      item.set('studentData', studentData);
    });
  }
});
