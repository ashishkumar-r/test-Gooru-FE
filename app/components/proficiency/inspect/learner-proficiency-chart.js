import Ember from 'ember';
import LearnerProficiency from 'gooru-web/mixins/learner-proficiency-mixin';
import { getTaxonomySubject } from 'gooru-web/utils/taxonomy';

export default Ember.Component.extend(LearnerProficiency, {
  // ----------------------------------------------------------------------
  // Attributes

  classNames: ['learner-proficiency-chart'],

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

  activeSubject: Ember.computed('class', 'competencySubject', function() {
    const competencySubject = this.get('competencySubject');
    return Ember.Object.create({
      id: competencySubject || this.get('class.preference.subject'),
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

  /**
   * @property {Number} classGrade
   */
  classGrade: Ember.computed('class.gradeCurrent', function() {
    return this.get('class.gradeCurrent');
  }),

  classGradesList: Ember.A(),

  isLoading: false,

  chartData: Ember.A(),

  competencySubject: null,

  didInsertElement() {
    let taxonomyTag = this.get('taxonomyTag');
    let data = taxonomyTag.data;
    if (data && data.id && data.frameworkCode) {
      this.set('competencySubject', getTaxonomySubject(data.id));
      let framework = {
        code: data.frameworkCode
      };
      this.loadDataBySubject(framework);
    } else {
      this.loadDataBySubject();
    }
  },

  // --------------------------------------------------------------------------
  // Actions

  actions: {
    onLoadedProficiency() {
      this.set('isLoading', true);
      this.parseDomainData();
      this.getTaxonomySubjects();
    },
    onClosePullup() {
      this.sendAction('onCloseProficiency');
    },

    //Action triggered when the user click a subject from the right panel
    onSelectItem(item) {
      let controller = this;
      controller.set('selectedSubject', item);
      controller.set('showDomainInfo', false);
      controller.set('showCompetencyInfo', false);
      controller.set('selectedCompetency', null);
      controller.set('selectedDomain', null);
      this.set('onSelectedDomain', null);
      this.set('onSelectedCompetency', null);
      controller.loadDataBySubject(item);
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
      let totalCompetencies = 0;
      proficiencyChartData.forEach(domain => {
        let competenciesSeq = -1;
        domain.set('compSeqList', Ember.A());
        domain.set('classGradeCompetencies', 0);
        domain.topics.forEach(topic => {
          totalCompetencies += topic.competencies.length;
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
      this.set('totalCompetencies', totalCompetencies);
      this.set('chartData', proficiencyChartData);
      this.set('isLoading', false);
      this.getCurrentDomain(proficiencyChartData);
    });
  },

  getTaxonomySubjects() {
    let component = this;
    let taxonomyService = component.get('taxonomyDataService');
    let params = {
      subject: component.get('subjectCode')
    };

    Ember.RSVP.hash({
      taxonomySubject: taxonomyService.fetchSubjectFWKs(
        component.get('subjectCode')
      ),
      taxonomyGrades: taxonomyService.fetchGradesBySubject(params)
    }).then(({ taxonomySubject, taxonomyGrades }) => {
      let defaultSubject = taxonomySubject.findBy(
        'code',
        component.get('framework')
      );
      let selectedSubject = defaultSubject
        ? defaultSubject
        : taxonomySubject.objectAt(0);
      component.set('taxonomyGrades', taxonomyGrades);
      component.set('taxonomySubjects', taxonomySubject);
      component.set('selectedSubject', selectedSubject);
    });
  },

  getCurrentDomain(proficiencyChartData) {
    let crossWalkFWC = this.get('crossWalkFWC') || [];
    let taxonomyTag = this.get('taxonomyTag');
    let data = taxonomyTag.data;
    if (data && data.id && data.frameworkCode) {
      crossWalkFWC.forEach(domain => {
        domain.topics.forEach(topic => {
          topic.competencies.forEach(competency => {
            if (competency.frameworkCompetencyCode === data.id) {
              let domainMatrix = proficiencyChartData.find(
                matrix => matrix.domainCode === domain.domainCode
              );
              if (domainMatrix) {
                this.set('onSelectedDomain', domainMatrix);
                let topicList = domainMatrix.topics.find(
                  matrix => matrix.topicCode === topic.topicCode
                );
                if (topicList) {
                  let competenctyList = topicList.competencies.find(
                    matrix =>
                      matrix.competencyCode === competency.competencyCode
                  );
                  this.set('onSelectedCompetency', competenctyList);
                }
              }
            }
          });
        });
      });
    }
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
    return params.courseId
      ? component.get('competencyService').fetchLJCompetency(params)
      : Promise.resolve([]);
  }
});
