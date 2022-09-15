import Ember from 'ember';
import StudentLearnerProficiency from 'gooru-web/mixins/student-learner-proficiency';

export default Ember.Component.extend(StudentLearnerProficiency, {
  // ----------------------------------------------------------------------
  // Attributes

  classNames: ['student-data-standard-chart'],

  // ---------------------------------------------------------------------
  // Dependencies

  session: Ember.inject.service(),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyDataService: Ember.inject.service('api-sdk/taxonomy'),

  /**
   * competency service dependency injection
   * @type {Object}
   */
  competencyService: Ember.inject.service('api-sdk/competency'),

  // --------------------------------------------------------------------
  // Properties

  activeSubject: Ember.computed('class', function() {
    return Ember.Object.create({
      id: this.get('class.preference.subject'),
      title: null
    });
  }),

  studentProfile: Ember.computed('session', function() {
    return {
      id: this.get('session.userId')
    };
  }),

  isTeacherMatrix: true,

  framework: Ember.computed('class', function() {
    return this.get('class.preference.framework');
  }),

  classGradesList: Ember.A(),

  isLoading: false,

  chartData: Ember.A(),

  didInsertElement() {
    this.loadDataBySubject();
  },

  // --------------------------------------------------------------------------
  // Actions

  actions: {
    onLoadedProficiency() {
      this.set('isLoading', true);
      this.parseDomainData();
    },
    goBack() {
      this.set('class.isDisable', false);
      window.history.back();
    },
    isShowLoaderSet(value) {
      this.set('isShowLoader', value);
    }
  },

  // ------------------------------------------------------------------------
  // Methods

  parseDomainData() {
    this.fetchDomainGradeBoundary().then(competencyList => {
      const proficiencyChartData = this.get('proficiencyChartData');
      proficiencyChartData.forEach(domain => {
        let competenciesSeq = -1;
        domain.set('compSeqList', Ember.A());
        domain.set('classGradeCompetencies', 0);
        domain.topics.forEach(topic => {
          topic.competencies.forEach(competency => {
            competenciesSeq++;
            if (competencyList.indexOf(competency.competencyCode) !== -1) {
              domain.get('compSeqList').push(competenciesSeq);
              competency.set('isClassGrade', true);
              domain.incrementProperty('classGradeCompetencies');
            }
          });
        });
      });
      this.set('chartData', proficiencyChartData);
      this.set('isLoading', false);
    });
  },

  /**
   * @function fetchDomainGradeBoundary
   * Method to fetch domain grade boundary
   */
  fetchDomainGradeBoundary() {
    const component = this;
    const params = {
      classId: component.get('class.id'),
      courseId: component.get('class.courseId')
    };
    return component.get('competencyService').fetchLJCompetency(params);
  }
});
