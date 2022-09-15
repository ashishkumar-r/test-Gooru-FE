import Ember from 'ember';
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['individual-student-report-preview'],

  // -------------------------------------------------------------------------
  // Dependencies

  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Date} timeSeriesStartDate
   */
  timeSeriesStartDate: Ember.computed.alias('class.startDate'),

  currentDate: moment().format('MMMM DD, YYYY'),

  studentCompetencies: Ember.computed('reportData', function() {
    let reportData = this.get('reportData');
    let competenciesData = Ember.A([]);
    if (reportData) {
      let masteredCompetencies = reportData.get('masteredCompetencies');
      let inprogressCompetencies = reportData.get('inprogressCompetencies');
      if (
        (masteredCompetencies && masteredCompetencies.length) >
        (inprogressCompetencies && inprogressCompetencies.length)
      ) {
        masteredCompetencies.forEach((competencies, index) => {
          let competencyObj = Ember.Object.create({
            masteredCompetencyData:
              competencies.status > 3
                ? `${competencies.code}-${competencies.competencyStudentDesc}`
                : '',
            inprogressCompetencyData: inprogressCompetencies[index]
              ? inprogressCompetencies[index].status === 1
                ? `${inprogressCompetencies[index].code}-${inprogressCompetencies[index].competencyStudentDesc}`
                : ''
              : ''
          });
          competenciesData.push(competencyObj);
        });
      } else {
        inprogressCompetencies.forEach((competencies, index) => {
          let competencyObj = Ember.Object.create({
            masteredCompetencyData: masteredCompetencies[index]
              ? masteredCompetencies[index].status > 3
                ? `${masteredCompetencies[index].code}-${masteredCompetencies[index].competencyStudentDesc}`
                : ''
              : '',
            inprogressCompetencyData:
              competencies.status === 1
                ? `${competencies.code}-${competencies.competencyStudentDesc}`
                : ''
          });
          competenciesData.push(competencyObj);
        });
      }
    }
    return competenciesData;
  }),

  /**
   * @property {Number} maxWidth
   */
  maxWidth: 450,

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  //--------------------------------------------------------------------------
  //Actions
  actions: {
    onPrintPreview() {
      let firstName = this.get('studentProfile.firstName');
      let lastName = this.get('studentProfile.lastName');
      let className = this.get('class.title');
      let startDate = moment(this.get('reportStartDate')).format(
        'DD MMMM YYYY'
      );
      let endDate = moment(this.get('reportEndDate')).format('DD MMMM YYYY');
      var tempTitle = document.title;
      document.title = `${lastName}-${firstName}-${className}-${startDate} to ${endDate}`;
      window.print();
      document.title = tempTitle;
    },

    isShowLoaderSet(value) {
      this.set('isShowLoader', value);
    }
  }
});
