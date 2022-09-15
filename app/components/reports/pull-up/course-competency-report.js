import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['course-competency-report'],

  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @requires competencyService
   */
  competencyService: Ember.inject.service('api-sdk/competency'),

  /**
   * @requires classService
   */
  classService: Ember.inject.service('api-sdk/class'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    let component = this;
    component.set('isLoading', true);
    component.loadReportData();
  },

  didRender() {
    var component = this;
    component
      .$('[data-toggle="tooltip"]')
      .tooltip({ trigger: 'hover', placement: 'bottom' });
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    // Action triggered when the user click on the arrow
    onClickArrow(direction, domainSeq) {
      let component = this;
      let domainStudentListContainer = component.$(
        `.student-competencies.domain-${domainSeq}`
      );
      let curPos = domainStudentListContainer.scrollLeft();
      let nextPos = direction === 'previous' ? curPos - 120 : curPos + 120;
      component.toggleClickableArrow(direction, curPos, domainSeq);
      domainStudentListContainer.animate(
        {
          scrollLeft: nextPos
        },
        600
      );
    },

    /**
     * Action triggered when select a domain from pull up
     */
    onSelectDomain(domainSet) {
      let component = this;
      component.sendAction('onSelectDomain', domainSet);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {isThrowError}
   * Property to look whether there is an error while fetching domain level summary data
   */
  isThrowError: false,

  /**
   * @property {classId}
   * Property to store class ID
   */
  classId: Ember.computed('classData', function() {
    let component = this;
    let classData = component.get('classData');
    return classData.id;
  }),

  /**
   * @property {courseId}
   * Property to store course ID
   */
  courseId: Ember.computed('classData', function() {
    let component = this;
    let classData = component.get('classData');
    return classData.courseId;
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchClassMembers
   * Method to fetch class memebers
   */
  fetchClassMembers(classId) {
    let component = this;
    let classService = component.get('classService');
    let classMembersPromise = Ember.RSVP.resolve(
      classService.readClassMembers(classId)
    );
    return Ember.RSVP.hash({
      classMembers: classMembersPromise
    }).then(({ classMembers }) => {
      return classMembers.members;
    });
  },

  /**
   * @function fetchDomainLevelSummary
   * Method to fetch domain level summary data
   */
  fetchDomainLevelSummary() {
    let component = this;
    let competencyService = component.get('competencyService');
    let filters = {
      classId: component.get('classId')
    };
    let domainLevelSummaryPromise = Ember.RSVP.resolve(
      competencyService.getDomainLevelSummary(filters)
    );
    return Ember.RSVP.hash({
      domainLevelSummary: domainLevelSummaryPromise
    })
      .then(({ domainLevelSummary }) => {
        component.set('isThrowError', false);
        return domainLevelSummary;
      })
      .catch(function() {
        component.set('isThrowError', true);
      });
  },

  /**
   * @function loadReportData
   * Method to load report data
   */
  loadReportData() {
    let component = this;
    let classStudentsPromsie = component.fetchClassMembers(
      component.get('classId')
    );
    let domainLevelSummaryPromise = component.fetchDomainLevelSummary();
    return Ember.RSVP.hash({
      classStudents: classStudentsPromsie,
      domainLevelSummary: domainLevelSummaryPromise
    }).then(function(hash) {
      let classStudents = hash.classStudents;
      let domainLevelSummary = hash.domainLevelSummary;
      component.constructCompetencyReportData(
        domainLevelSummary,
        classStudents
      );
    });
  },

  /**
   * @function constructCompetencyReportData
   * Method to construct competency report data
   */
  constructCompetencyReportData(domainLevelSummary, classStudents) {
    let component = this;
    let domainLevelStudentSummaryData = Ember.A([]);
    let maxCompetencyLength = 0;
    if (domainLevelSummary && classStudents.length) {
      let domainCompetencies = domainLevelSummary.domainCompetencies;
      let studentsDomainCompetencies = domainLevelSummary.students;
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
        classStudents.map(student => {
          let studentDomainCompetencies = studentsDomainCompetencies.findBy(
            'id',
            student.id
          );
          let userCompetencyMatrix = studentDomainCompetencies
            ? studentDomainCompetencies.userCompetencyMatrix
            : {};
          let currentStudentDomainCompetencies = userCompetencyMatrix.findBy(
            'domainCode',
            domainCode
          );
          let parsedData = component.parseStudentCompetencyData(
            student,
            domainData,
            currentStudentDomainCompetencies.competencies
          );
          parsedStudentCompetenctData.push(parsedData);
        });
        studentLevelDomainCompetencyData.studentCompetencies = parsedStudentCompetenctData;
        domainLevelStudentSummaryData.push(studentLevelDomainCompetencyData);
      });
    }
    component.set('domainDataSet', domainLevelStudentSummaryData);
    component.set('maxCompetencyLength', maxCompetencyLength);
    component.set('isLoading', false);
  },

  /**
   * @function parseStudentCompetencyData
   * Method to parse student, domain and user competencies data
   */
  parseStudentCompetencyData(student, domainData, studentDomainCompetencies) {
    let studentDomainCompetencyData = {
      firstName: student.firstName,
      lastName: student.lastName,
      userId: student.id,
      thumbnail: student.avatarUrl,
      fullName: `${student.lastName}, ${student.firstName}`,
      competencies: Ember.A([])
    };
    if (studentDomainCompetencies) {
      let competencies = Ember.A([]);
      domainData.competencies.map(competency => {
        let competencyData = {
          competencyCode: competency.competencyCode,
          competencySeq: competency.competencySeq,
          competencyName: competency.competencyName,
          competencyDesc: competency.competencyDesc,
          competencyStudentDesc: competency.competencyStudentDesc,
          status: studentDomainCompetencies[`${competency.competencyCode}`]
        };
        competencies.push(competencyData);
      });
      studentDomainCompetencyData.competencies = competencies;
    }
    return studentDomainCompetencyData;
  },

  /**
   * @function toggleClickableArrow
   * Method to enable/disable previous/next arrows
   */
  toggleClickableArrow(direction, curPos, seq) {
    let component = this;
    let domainStudentListContainer = component.$('.student-competencies');
    let visibleSectionWidth = domainStudentListContainer.width();
    let isNextDisabled =
      direction === 'next' && curPos + 240 >= visibleSectionWidth;
    let isPreviousDisabled = direction === 'previous' && curPos <= 120;
    if (isNextDisabled) {
      component.$(`.domain.domain-${seq} .next`).addClass('disabled');
      component.$(`.domain.domain-${seq} .previous`).removeClass('disabled');
    } else if (isPreviousDisabled) {
      component.$(`.domain.domain-${seq} .previous`).addClass('disabled');
      component.$('.next').removeClass('disabled');
    } else {
      component.$(`.domain.domain-${seq} .next`).removeClass('disabled');
      component.$(`.domain.domain-${seq} .previous`).removeClass('disabled');
    }
  }
});
