import Ember from 'ember';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(TenantSettingsMixin, {
  // ----------------------------------------------------
  // Attributes

  classNames: ['learner-status'],

  // ---------------------------------------------------------
  // Dependencies

  competencyService: Ember.inject.service('api-sdk/competency'),

  session: Ember.inject.service(),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

  // -------------------------------------------------------
  // Properties

  currentClass: null,

  /**
   * Class Id extract from class object
   * @type {String}
   */
  classId: Ember.computed.alias('currentClass.id'),

  /**
   * @property {String} subjectCode
   * Property for class preference subject code
   */
  subjectCode: Ember.computed('currentClass', function() {
    let preference = this.get('currentClass.preference');
    return preference != null ? preference.get('subject') : null;
  }),

  /**
   * @property {String} frameworkId
   * Property for class preference subject code
   */
  frameworkId: Ember.computed('currentClass', function() {
    let preference = this.get('currentClass.preference');
    return preference != null ? preference.get('framework') : null;
  }),

  /**
   * @property {JSON}
   * Property to store currently selected month and year
   */
  timeLine: Ember.computed(function() {
    let curDate = new Date();
    return {
      month: curDate.getMonth() + 1,
      year: curDate.getFullYear()
    };
  }),

  domainData: Ember.A(),

  maxNumberOfCompetencies: Ember.computed('domainData', function() {
    return 540;
  }),

  userId: Ember.computed.alias('session.userId'),

  memberGradeBounds: Ember.computed.alias('currentClass.memberGradeBounds'),

  isLoading: false,

  /**
   * @property {Array} gradeBoundaryPoints has highline domains
   */
  gradeBoundaryPoints: Ember.A([]),

  defaultFw: Ember.computed(function() {
    const component = this;
    let tenantSetting = component.get('tenantSettingsObj');
    const subjectCode = component.get('subjectCode');
    let isPublic = component.get('currentClass.isPublic');
    let subjectFw =
      tenantSetting && tenantSetting.tx_fw_prefs
        ? tenantSetting.tx_fw_prefs[subjectCode]
        : null;
    return subjectFw && isPublic ? subjectFw.default_fw_id : null;
  }),

  userProfileData: null,

  // ------------------------------------------------------------------------------
  // Hooks
  didInsertElement() {
    this.set('isLoading', true);
    this.loadData();
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    onGoProficiency() {
      const component = this;
      let userId = component.get('userId');
      let currentClass = component.get('currentClass');
      component
        .get('router')
        .transitionTo('student.class.student-learner-proficiency', {
          queryParams: {
            userId: userId,
            classId: currentClass.id,
            courseId: currentClass.courseId,
            role: 'student',
            isDashboard: true
          }
        });
    }
  },

  // -------------------------------------------------------------
  // Methods

  loadData() {
    let component = this;
    let userId = component.get('userId');
    const subjectCode = component.get('subjectCode');
    let frameworkId = component.get('frameworkId');
    let timeLine = component.get('timeLine');
    let classId = component.get('classId');
    let gradeData = component.get('currentClass.gradeCurrent');
    let isPublic = component.get('currentClass.isPublic');
    let tenantSetting = component.get('tenantSettingsObj');
    let isDefaultShowFW = false;
    const defaultFw = component.get('defaultFw');
    const userProfileData = component.get('userProfileData');
    const filters = {
      subject: subjectCode
    };
    const isEnableNavigatorPrograms = component.get(
      'isEnableNavigatorPrograms'
    );
    if (
      tenantSetting &&
      tenantSetting.default_show_fw_competency_proficiency_view &&
      tenantSetting.default_show_fw_competency_proficiency_view.length
    ) {
      let classPreference = subjectCode.concat('.', frameworkId);
      isDefaultShowFW =
        tenantSetting.default_show_fw_competency_proficiency_view.indexOf(
          classPreference
        ) !== -1;
    }
    if (defaultFw) {
      filters.fw_code = defaultFw;
    }
    Ember.RSVP.hash({
      taxonomyGrades: component
        .get('taxonomyService')
        .fetchGradesBySubject(filters)
    }).then(({ taxonomyGrades }) => {
      if (
        isEnableNavigatorPrograms &&
        userProfileData &&
        userProfileData.info &&
        isPublic
      ) {
        const studentDestination = taxonomyGrades.find(
          taxonomyGrade =>
            taxonomyGrade.grade.toLowerCase() ===
            userProfileData.info.grade_level.toLowerCase()
        );
        gradeData = studentDestination ? studentDestination.id : gradeData;
      }
      Ember.RSVP.hash({
        domainData: component
          .get('competencyService')
          .fetchStudentDomainTopicCompetency(
            userId,
            subjectCode,
            timeLine,
            classId,
            isDefaultShowFW ? frameworkId : null
          ),
        domainBoundary: component.fetchDomainGradeBoundary(gradeData)
      }).then(({ domainData, domainBoundary }) => {
        component.parseClassCompetencyReport(domainData);
        component.populateGradeBoundaryLine(domainBoundary);
        component.set('isLoading', false);
      });
    });
  },

  parseClassCompetencyReport(domainData) {
    const component = this;
    let highestDomainSize = 0;
    const overallCompetenciesReport = Ember.Object.create({
      'not-started': 0,
      'in-progress': 0,
      inferred: 0,
      completed: 0,
      mastered: 0,
      total: 0
    });
    let domainMatrixtData = Ember.A([]);
    domainData.map(stuDomainMatrix => {
      stuDomainMatrix = Ember.Object.create(stuDomainMatrix);
      stuDomainMatrix.setProperties({
        'not-started': 0,
        'in-progress': 0,
        inferred: 0,
        completed: 0,
        mastered: 0,
        total: 0
      });
      let competenciesCount = stuDomainMatrix.topics
        .map(topic => topic.competencies.length)
        .reduce((a, b) => a + b, 0);
      highestDomainSize =
        highestDomainSize < competenciesCount
          ? competenciesCount
          : highestDomainSize;
      stuDomainMatrix.topics.map(stuTopicMatrix => {
        stuTopicMatrix = Ember.Object.create(stuTopicMatrix);
        stuTopicMatrix.setProperties({
          'not-started': 0,
          'in-progress': 0,
          inferred: 0,
          completed: 0,
          mastered: 0,
          total: 0
        });
        stuTopicMatrix.competencies.map(studCompData => {
          studCompData = Ember.Object.create(studCompData);
          const statusValue = studCompData.get('status');
          if (statusValue === 0) {
            stuDomainMatrix.incrementProperty('not-started');
            stuTopicMatrix.incrementProperty('not-started');
            overallCompetenciesReport.incrementProperty('not-started');
          } else if (statusValue === 1) {
            stuDomainMatrix.incrementProperty('in-progress');
            stuTopicMatrix.incrementProperty('in-progress');
            overallCompetenciesReport.incrementProperty('in-progress');
          } else if (statusValue >= 2 && statusValue <= 3) {
            stuDomainMatrix.incrementProperty('inferred');
            stuDomainMatrix.incrementProperty('mastered');
            stuTopicMatrix.incrementProperty('inferred');
            stuTopicMatrix.incrementProperty('mastered');
            overallCompetenciesReport.incrementProperty('mastered');
            overallCompetenciesReport.incrementProperty('inferred');
          } else {
            stuDomainMatrix.incrementProperty('mastered');
            stuTopicMatrix.incrementProperty('mastered');
            stuDomainMatrix.incrementProperty('completed');
            stuTopicMatrix.incrementProperty('completed');
            overallCompetenciesReport.incrementProperty('mastered');
            overallCompetenciesReport.incrementProperty('completed');
          }
          return studCompData;
        });
        stuTopicMatrix.set(
          'total',
          stuTopicMatrix.get('not-started') +
            stuTopicMatrix.get('in-progress') +
            stuTopicMatrix.get('mastered')
        );
        return stuTopicMatrix;
      });
      stuDomainMatrix.set(
        'total',
        stuDomainMatrix.get('not-started') +
          stuDomainMatrix.get('in-progress') +
          stuDomainMatrix.get('mastered')
      );
      overallCompetenciesReport.set(
        'total',
        overallCompetenciesReport.get('not-started') +
          overallCompetenciesReport.get('in-progress') +
          overallCompetenciesReport.get('mastered')
      );
      domainMatrixtData.pushObject(stuDomainMatrix);
      return stuDomainMatrix;
    });
    domainMatrixtData = domainMatrixtData.sortBy('domainSeq');
    component.set('domainData', domainMatrixtData);
    component.set('totalCompetencies', overallCompetenciesReport.get('total'));
    component.set('maxNumberOfCompetencies', highestDomainSize);
    component.set('isLoading', false);
  },

  /**
   * @function fetchDomainGradeBoundary
   * Method to fetch domain grade boundary
   */
  fetchDomainGradeBoundary(gradeId) {
    let component = this;
    let taxonomyService = component.get('taxonomyService');
    return Ember.RSVP.hash({
      domainBoundary: gradeId
        ? Ember.RSVP.resolve(
          taxonomyService.fetchDomainGradeBoundaryBySubjectId(gradeId)
        )
        : Ember.RSVP.resolve(null)
    }).then(({ domainBoundary }) => {
      return domainBoundary;
    });
  },

  /**
   * @function populateGradeBoundaryLine
   * Method to draw domain boundary line
   */
  populateGradeBoundaryLine(gradeBoundaries) {
    let component = this;
    const proficiencyChartData = component.get('domainData');
    const gradeBoundaryPoints = [];
    if (gradeBoundaries) {
      proficiencyChartData &&
        proficiencyChartData.map(domainData => {
          const domainGradeBoundariesList = gradeBoundaries.filterBy(
            'domainCode',
            domainData.get('domainCode')
          );
          let domainHiLineCompSeq = 0;
          const domainTopicPoints = {
            domainSeq: domainData.domainSeq,
            topics: [],
            isExpanded: !!domainData.get('isExpanded'),
            isHiLineAvailable: !!domainGradeBoundariesList.length,
            hiLineCompSeq: domainHiLineCompSeq
          };

          let isHiLineTopicCovered = false;
          let domainGradeBoundaries = gradeBoundaries.findBy(
            'domainCode',
            domainData.get('domainCode')
          );
          domainData.topics.map(topic => {
            let topicBoundaries = domainGradeBoundariesList.find(
              item => item.topicCode && item.topicCode === topic.topicCode
            );
            if (topicBoundaries) {
              domainGradeBoundaries = topicBoundaries;
            }
            let hiLineCompSeq =
              !isHiLineTopicCovered &&
              domainGradeBoundaries &&
              !domainGradeBoundaries.topicHighlineComp &&
              topic.competencies
                ? topic.competencies.length
                : 0;
            const topicBoundary = {
              topicSeq: topic.topicSeq,
              hiLineCompSeq
            };
            if (
              domainGradeBoundaries &&
              (topic.topicCode === domainGradeBoundaries.topicCode ||
                topic.topicCode === domainGradeBoundaries.highlineTopic)
            ) {
              isHiLineTopicCovered = true;
              if (topic.competencies) {
                hiLineCompSeq =
                  topic.competencies.findIndex(
                    competency =>
                      competency.competencyCode ===
                      (domainGradeBoundaries.topicHighlineComp
                        ? domainGradeBoundaries.topicHighlineComp
                        : domainGradeBoundaries.highlineComp)
                  ) + 1;
              }
            }
            topicBoundary.hiLineCompSeq = hiLineCompSeq;
            domainTopicPoints.topics.push(Ember.Object.create(topicBoundary));
            domainHiLineCompSeq += hiLineCompSeq;
          });

          domainTopicPoints.hiLineCompSeq = domainHiLineCompSeq;
          gradeBoundaryPoints.push(Ember.Object.create(domainTopicPoints));
        });
    }
    component.set('gradeBoundaryPoints', gradeBoundaryPoints);
    component.set('isLoading', false);
  }
});
