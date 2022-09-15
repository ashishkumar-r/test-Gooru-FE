import Ember from 'ember';
import { getObjectsDeepCopy } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // -----------------------------------------------------------------
  // Attributes

  classNames: ['student-data-by-standard'],

  // -------------------------------------------------------------------
  // Dependencies

  /**
   * @requires competencyService
   */
  competencyService: Ember.inject.service('api-sdk/competency'),

  // ---------------------------------------------------------------------
  // Properties

  domainCompetenciesList: Ember.A(),

  class: null,

  activeCompetency: null,

  preference: Ember.computed('class', function() {
    return this.get('class.preference');
  }),

  categoryCode: Ember.computed('preference', function() {
    let subject = this.get('preference.subject');
    return subject ? subject.split('.')[0] : null;
  }),

  selectedCompetency: Ember.computed(function() {
    let domain = this.get('domainCompetenciesList.firstObject');
    let competency = domain.get('competencies.firstObject');
    return competency;
  }),

  filteredCount: 0,

  totalSuggestions: Ember.computed('activeCompetency', function() {
    let students = this.get('activeCompetency.students');
    return students.reduce((a, b) => a + b.suggestions, 0);
  }),

  mastryDistribustion: Ember.computed('activeCompetency.students', function() {
    let students = this.get('activeCompetency.students');
    let progressCount = 0;
    let notstartedCount = 0;
    let masteredCount = 0;
    for (let student of students) {
      if (student.status >= 2) {
        masteredCount++;
      } else if (student.status === 1) {
        progressCount++;
      } else {
        notstartedCount++;
      }
    }
    let totalCount = students.length;
    let counts = value => {
      return parseInt((value / totalCount) * 100, 0);
    };
    return [
      {
        score: counts(notstartedCount),
        className: 'not-started'
      },
      {
        score: counts(progressCount),
        className: 'progress'
      },
      {
        score: counts(masteredCount),
        className: 'mastery'
      }
    ];
  }),

  performanceDistribution: Ember.computed(
    'activeCompetency.students',
    function() {
      let students = this.get('activeCompetency.students');
      let range1 = 0;
      let range2 = 0;
      let range3 = 0;
      let range4 = 0;
      let totalCount = students.length;
      let counts = value => {
        return parseInt((value / totalCount) * 100, 0);
      };
      for (let student of students) {
        if (student.score > 89) {
          range4++;
        } else if (student.score >= 60 && student.score <= 69) {
          range2++;
        } else if (student.score >= 70 && student.score <= 89) {
          range3++;
        } else {
          range1++;
        }
      }
      return [
        {
          score: counts(range1),
          className: 'fill-range-0-59'
        },
        {
          score: counts(range2),
          className: 'fill-range-60-69'
        },
        {
          score: counts(range3),
          className: 'fill-range-70-79'
        },
        {
          score: counts(range4),
          className: 'fill-range-90-100'
        }
      ];
    }
  ),

  domainDataStandard: Ember.computed(function() {
    return getObjectsDeepCopy(this.get('domainCompetenciesList'));
  }),

  // ---------------------------------------------------------------------
  // Hooks

  didInsertElement() {
    this.fetchUsersListByCompetency();
  },

  actions: {
    onSelectCompetency(competency) {
      this.set('selectedCompetency', competency);
      this.fetchUsersListByCompetency();
    },

    onSelectPrint() {
      window.print();
    },

    onSearchTerms(searchTerms) {
      this.searchFilterList(searchTerms);
    },

    onSelectDomains(domain) {
      let component = this;
      event.stopPropagation();
      let isSelected = !domain.isSelected;
      domain.set('isSelected', isSelected);
      let domainCompetenciesList = component.get('domainCompetenciesList');
      let filterList = domainCompetenciesList.filterBy('isSelected', true);
      component.set('filteredCount', filterList.length);
      let activeList = filterList.length ? filterList : domainCompetenciesList;
      component.set('domainDataStandard', getObjectsDeepCopy(activeList));
    }
  },

  // ----------------------------------------------------------------------
  // Methods

  fetchUsersListByCompetency() {
    let component = this;
    let params = {
      classId: component.get('class.id'),
      competency: component.get('selectedCompetency.competencyCode')
    };
    component
      .get('competencyService')
      .fetchStudentsByCompetency(params)
      .then(usersList => {
        component.set('activeCompetency', usersList);
      });
  },

  searchFilterList(searchTerms) {
    const component = this;
    let domainCompetenciesList = getObjectsDeepCopy(
      component.get('domainCompetenciesList')
    );
    let domainDataStandard = domainCompetenciesList;
    if (component.get('filteredCount')) {
      domainCompetenciesList = domainCompetenciesList.filterBy(
        'isSelected',
        true
      );
    }
    if (searchTerms.trim() !== '') {
      domainDataStandard = Ember.A();
      domainCompetenciesList.forEach(domain => {
        let topicList = Ember.A();
        domain.topics.forEach(topic => {
          let filterCompetencyList = topic.competencies.filter(competency =>
            competency.competencyName
              .toLowerCase()
              .startsWith(searchTerms.toLowerCase())
          );
          if (filterCompetencyList.length) {
            topicList.pushObject(topic);
            topic.set('competencies', filterCompetencyList);
            domainDataStandard.pushObject(domain);
          }
        });
        domain.set('topics', topicList);
      });
    }
    component.set('domainDataStandard', domainDataStandard);
  }
});
