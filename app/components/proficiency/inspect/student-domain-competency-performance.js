import Ember from 'ember';
import { SCREEN_SIZES } from 'gooru-web/config/config';
import { isCompatibleVW } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['inspect', 'student-domain-competency-performance'],

  searchService: Ember.inject.service('api-sdk/search'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    let component = this;
    component.parseStudentsDomainCompetencyPerformance();
  },

  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when click back arrow
    onClickBack() {
      let component = this;
      component.sendAction('onClickBack');
    },

    //Action triggered when carousel through domain sequence
    onChangeDomainSeq(direction) {
      let component = this;
      let curDomainSeq = component.get('activeDomainSeq');
      let updatedDomainSeq =
        direction === 'left' ? curDomainSeq - 1 : curDomainSeq + 1;
      let domainsCompetencyPerformance = component.get(
        'domainsCompetencyPerformance'
      );
      let activeDomain = domainsCompetencyPerformance.objectAt(
        updatedDomainSeq - 1
      );
      component.set('activeDomainSeq', updatedDomainSeq);
      component.set('activeDomainCompetencyPerformance', activeDomain);
      component.set('activeDomain', activeDomain.domainData);
      component.set('showCompetencyInfo', false);
    },

    //Action triggered when select a competency
    onSelectStudentCompetency(
      competency,
      studentId,
      studentCompetencyPerformance
    ) {
      const component = this;
      component.set('studentDetails', studentCompetencyPerformance);
      component.set('selectedCompetency', competency);
      component.set('selectedStudentUserId', studentId);
      if (studentId) {
        let studentCompetencies = component
          .get('studentCompetencies')
          .findBy('id', studentId);
        let userCompetencyMatrix = studentCompetencies.get(
          'userCompetencyMatrix'
        );
        component.proficiencyChartData.map(domain => {
          let userDomain = userCompetencyMatrix.findBy(
            'domainCode',
            domain.domainCode
          );
          domain.topics.map(topic => {
            topic.competencies.map(competency => {
              let userCompentecy = userDomain.competencies.findBy(
                'competencyCode',
                competency.competencyCode
              );
              if (userCompentecy) {
                competency.status = userCompentecy.competencyStatus;
              }
            });
          });
        });
      }
      component.set('isShowCompetencyContentReport', true);
    },

    onSelectCompetency(competency) {
      const component = this;
      component.set('selectedCompetencyForSuggestion', competency);
      component.set('showCompetencyInfo', true);
    },

    onClosePullOut() {
      const component = this;
      component.set('showPullOut', false);
    },

    onSelectStudentForSuggestion(student) {
      this.get('studentsSelectedForSuggest').pushObject(student);
      student.set('selectedForSuggestion', true);
    },

    onDeSelectStudentForSuggestion(student) {
      this.get('studentsSelectedForSuggest').removeObject(student);
      student.set('selectedForSuggestion', false);
    },

    onSuggestContent(collection, collectionType) {
      const component = this;
      component.set('suggestedCollection', collection);
      component.set('suggestedCollectionType', collectionType);
      component.set('showSuggestConfirmation', true);
    },

    onCancelSuggest() {
      const component = this;
      component.set('showSuggestConfirmation', false);
    },

    onConfirmSuggest() {
      const component = this;
      const collection = component.get('suggestedCollection');
      const collectionType = component.get('suggestedCollectionType');
      const competencyCode = component.get(
        'selectedCompetencyForSuggestion.competencyCode'
      );
      component.suggestContent(collection, collectionType, competencyCode);
    },

    onClosePullUp() {
      const component = this;
      component.set('showCompetencyInfo', false);
    },

    onCloseCompetencyReportPullUp() {
      this.set('isShowCompetencyContentReport', false);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  studentDetails: null,

  /**
   * @property {Boolean}
   * Property to store given screen value is compatible
   */
  isMobile: isCompatibleVW(SCREEN_SIZES.SMALL),

  /**
   * @property {service} suggestService
   */
  suggestService: Ember.inject.service('api-sdk/suggest'),

  /**
   * @property {String} classId
   */
  classId: Ember.computed.alias('class.id'),

  /**
   * @property {Array} studentsSelectedForSuggest
   */
  studentsSelectedForSuggest: Ember.A([]),

  /**
   * @property {Boolean} showPullOut
   */
  showPullOut: false,

  /**
   * @property {Array} domainsCompetencyPerformance
   */
  domainsCompetencyPerformance: Ember.A([]),

  /**
   * @property {JSON} activeDomain
   */
  activeDomain: null,

  /**
   * @property {Number} activeDomainSeq
   */
  activeDomainSeq: Ember.computed('activeDomain', function() {
    let component = this;
    let activeDomain = component.get('activeDomain');
    return activeDomain ? activeDomain.domainSeq : 1;
  }),

  /**
   * @property {JSON} activeDomainCompetencyPerformance
   */
  activeDomainCompetencyPerformance: Ember.computed(
    'domainsCompetencyPerformance',
    function() {
      let component = this;
      let domainsCompetencyPerformance = component.get(
        'domainsCompetencyPerformance'
      );
      let activeDomainSeq = component.get('activeDomainSeq');
      return domainsCompetencyPerformance.objectAt(`${activeDomainSeq - 1}`);
    }
  ),

  /**
   * @property {Object} activeDomainData
   * Property for active domain data + topics + competencies
   */
  activeDomainData: Ember.computed(
    'domainLevelSummary',
    'activeDomain',
    function() {
      return this.get('domainLevelSummary.domainCompetencies').findBy(
        'domainCode',
        this.get('activeDomain.domainCode')
      );
    }
  ),

  /**
   * @property {Number} numberOfDomains
   */
  numberOfDomains: Ember.computed.alias(
    'domainLevelSummary.domainCompetencies.length'
  ),

  /**
   * @property {Object} domainCompetencyList
   */
  domainCompetencyList: Ember.computed(
    'selectedStudentUserId',
    'activeDomain',
    function() {
      let competencies = this.get(
        'activeDomainCompetencyPerformance.studentCompetencies'
      );
      let studentId = this.get('selectedStudentUserId');
      let doaminCompetencies = competencies.findBy('userId', studentId);
      let activeDomain = this.get('activeDomain');
      return Ember.Object.create({
        domainCode: activeDomain.domainCode,
        competencies: doaminCompetencies.competencies
      });
    }
  ),

  domainCompetencies: Ember.computed.alias(
    'activeDomainCompetencyPerformance.domainData.competencies'
  ),

  /**
   * @property {String} sortCriteria
   */
  sortCriteria: 'lastName',

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function parseStudentsDomainCompetencyPerformance
   * Method to parse student proficiency data
   */
  parseStudentsDomainCompetencyPerformance() {
    let component = this;
    let domainLevelSummary = component.get('domainLevelSummary');
    let classMembers = component.get('classMembers');
    let domainLevelStudentSummaryData = Ember.A([]);
    let maxCompetencyLength = 0;
    if (domainLevelSummary && classMembers.length) {
      let domainCompetencies = domainLevelSummary
        .get('domainCompetencies')
        .sortBy('domainSeq');
      let studentsDomainCompetencies = domainLevelSummary.get('students');
      domainCompetencies.map(domainData => {
        let numberOfCompetencies = domainData.competencies.length;
        maxCompetencyLength =
          numberOfCompetencies > maxCompetencyLength
            ? numberOfCompetencies
            : maxCompetencyLength;
        domainData.competencyLength = numberOfCompetencies;
        let studentLevelDomainCompetencyData = {
          domainData
        };
        let domainCode = domainData.domainCode;
        let parsedStudentCompetenctData = Ember.A([]);
        classMembers.map(student => {
          let studentDomainCompetencies = studentsDomainCompetencies.findBy(
            'id',
            student.get('id')
          );
          let userCompetencyMatrix = studentDomainCompetencies
            ? studentDomainCompetencies.get('userCompetencyMatrix')
            : {};
          let currentStudentDomainCompetencies = userCompetencyMatrix.findBy(
            'domainCode',
            domainCode
          );
          if (currentStudentDomainCompetencies) {
            let parsedData = component.parseStudentCompetencyData(
              student,
              domainData,
              currentStudentDomainCompetencies.get('competencies')
            );
            parsedStudentCompetenctData.push(parsedData);
          }
        });
        studentLevelDomainCompetencyData.studentCompetencies = parsedStudentCompetenctData.sortBy(
          component.get('sortCriteria')
        );
        domainLevelStudentSummaryData.push(studentLevelDomainCompetencyData);
      });

      component.set(
        'activeDomain',
        domainCompetencies.findBy(
          'domainCode',
          component.get('activeDomain.domainCode')
        )
      );
    }
    component.set(
      'domainsCompetencyPerformance',
      domainLevelStudentSummaryData
    );
    component.set('isLoading', false);
  },

  /**
   * @function parseStudentCompetencyData
   * Method to parse student, domain and user competencies data
   */
  parseStudentCompetencyData(student, domainData, studentDomainCompetencies) {
    let studentDomainCompetencyData = Ember.Object.create({
      firstName: student.firstName,
      lastName: student.lastName,
      userId: student.id,
      avatarUrl: student.avatarUrl,
      fullName: `${student.lastName}, ${student.firstName}`,
      isShowLearnerData: student.isShowLearnerData,
      competencies: Ember.A([])
    });
    if (studentDomainCompetencies) {
      const competencies = domainData.competencies.map(competency => {
        return Ember.Object.create({
          domainCode: domainData.domainCode,
          domainName: domainData.domainName,
          topicName: competency.topicName,
          topicSeq: competency.topicSeq,
          topicCode: competency.topicSeq,
          competencyCode: competency.competencyCode,
          competencySeq: competency.competencySeq,
          competencyName: competency.competencyName,
          competencyDesc: competency.competencyDesc,
          competencyStudentDesc: competency.competencyStudentDesc,
          competencyStatus: studentDomainCompetencies
            .findBy('competencyCode', competency.competencyCode)
            .get('competencyStatus'),
          status: studentDomainCompetencies
            .findBy('competencyCode', competency.competencyCode)
            .get('competencyStatus')
        });
      });
      studentDomainCompetencyData.set('competencies', competencies);
    }
    return studentDomainCompetencyData;
  },

  /**
   * @function fetchLearningMapsContent
   * Method to fetch learning maps content
   */
  fetchLearningMapsContent(competencyCode) {
    let component = this;
    let searchService = component.get('searchService');
    let filters = {
      startAt: 0,
      length: 5,
      isCrosswalk: false
    };
    component.set('isLoading', true);
    return Ember.RSVP.hash({
      learningMapData: searchService.fetchLearningMapsContent(
        competencyCode,
        filters
      )
    }).then(({ learningMapData }) => {
      if (!component.isDestroyed) {
        component.set('learningMapData', learningMapData);
        component.set('isLoading', false);
      }
    });
  },

  suggestContent(collection, collectionType, competencyCode) {
    const component = this;
    const students = component.get('studentsSelectedForSuggest');
    students.map(student => {
      let contextParams = {
        user_id: student.get('userId'),
        class_id: component.get('classId'),
        suggested_content_id: collection.get('id'),
        suggestion_origin: 'teacher',
        suggestion_originator_id: component.get('session.userId'),
        suggestion_criteria: 'performance',
        suggested_content_type: collectionType,
        suggested_to: 'student',
        suggestion_area: 'proficiency',
        tx_code: competencyCode,
        tx_code_type: 'competency'
      };
      return component.get('suggestService').suggestContent(contextParams);
    });
    Ember.RSVP.all(students).then(function() {
      component.set('studentsSelectedForSuggest', Ember.A([]));
      component
        .get('activeDomainCompetencyPerformance.studentCompetencies')
        .filterBy('selectedForSuggestion', true)
        .map(data => {
          data.set('selectedForSuggestion', false);
        });
      component.set('showSuggestConfirmation', false);
      component.set('showPullOut', false);
    });
  }
});
