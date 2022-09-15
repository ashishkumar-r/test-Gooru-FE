import Ember from 'ember';
import { ROLES, SCREEN_SIZES } from 'gooru-web/config/config';
import { isCompatibleVW } from 'gooru-web/utils/utils';
import {
  flattenGutToFwCompetency,
  flattenGutToFwDomain,
  getCategoryCodeFromSubjectId,
  getGutCodeFromSubjectId
} from 'gooru-web/utils/taxonomy';
import visibilitySettings from 'gooru-web/mixins/visibility-settings';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Mixin.create(visibilitySettings, TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  session: Ember.inject.service('session'),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyProvider: Ember.inject.service('api-sdk/taxonomy'),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('taxonomy'),

  /**
   * competency service dependency injection
   * @type {Object}
   */
  competencyService: Ember.inject.service('api-sdk/competency'),

  /**
   * @property {Object}
   * Property to store active subject which is selected
   */
  activeSubject: null,

  /**
   * @property {String}
   * Property to store course subject bucket or K12.MA will be default
   */
  subjectBucket: Ember.computed('course', function() {
    let component = this;
    return (
      component.get('course.subject') ||
      this.get('class.preference.subject') ||
      null
    );
  }),

  /**
   * Parse  category from subject id
   */
  categoryCode: Ember.computed('course', function() {
    let subject = this.get('subjectBucket');
    if (subject) {
      return getCategoryCodeFromSubjectId(subject);
    }
  }),
  /**
   * @property {Array} taxonomyGrades
   */
  taxonomyGrades: Ember.A([]),

  /**
   * @property {Number} classGrade
   */
  classGrade: Ember.computed('class.gradeCurrent', function() {
    return this.get('class.gradeCurrent');
  }),

  /**
   * @property {String} subjectCode
   */
  subjectCode: Ember.computed('activeSubject', function() {
    let component = this;
    let subject = component.get('activeSubject');
    return subject ? subject.id : '';
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

  /**
   * @property {Boolean} showGutCompetency
   */
  showGutCompetency: false,

  /**
   * @property {Object} userStandardPreference
   */
  userStandardPreference: null,

  /**
   * @property {Boolean} isShowMatrixChart
   */
  isShowMatrixChart: true,

  /**
   * @property {Boolean}
   * Property to store given screen value is compatible
   */
  isMobile: isCompatibleVW(SCREEN_SIZES.LARGE),

  /**
   * @property {Object}
   * Property to store selected competency
   */
  selectedCompetency: null,

  /**
   * Property to store selected category
   * @type {Object}
   */
  selectedCategory: null,

  /**
   * Property to store domain competency list
   * @type {Object}
   */
  domainCompetencyList: null,

  /**
   * It will have singature content competencty list for current active subject
   * @type {Object}
   */
  signatureCompetencyList: null,

  /**
   * @property {Boolean}
   * Property to store is student or not
   */
  isStudent: Ember.computed.equal('session.role', ROLES.STUDENT),

  /**
   * @property {String}
   * Property to store is class framework
   */
  framework: null,

  selecctedDomainTopics: Ember.A([]),

  /**
   * @property {String} isTeacherMatrix
   * Property help to colour all the competency into blue
   */
  isTeacherMatrix: false,

  actions: {
    onSelectCategory(category) {
      let component = this;
      component.set('selectedCategory', category);
      component.set('showDomainInfo', false);
      component.set('showCompetencyInfo', false);
      component.set('selectedCompetency', null);
      component.set('selectedDomain', null);
      component.fetchSubjectsByCategory(category);
    },
    /**
     * Action triggered when select a month from chart
     */
    onSelectMonth(date) {
      let timeLine = {
        month: date.getMonth() + 1,
        year: date.getFullYear()
      };
      this.set('timeLine', timeLine);
      this.loadDataBySubject();
    },

    onSubjectChange(subject) {
      let component = this;
      component.set('activeSubject', subject);
      component.set('showDomainInfo', false);
      component.set('showCompetencyInfo', false);
      component.set('selectedCompetency', null);
      component.set('selectedDomain', null);
      component.fetchTaxonomyGrades();
      component.loadDataBySubject();
      component.fetchSignatureCompetencyList();
    },

    /**
     * Action triggered when select a competency
     */
    onSelectCompetency(competency, domainCompetencyList) {
      let component = this;
      if (!component.get('isTeacherMatrix')) {
        component.setSignatureContent(competency);
      }
      const selectedDomain = component.get('selectedDomain');
      const domainName =
        selectedDomain && selectedDomain.domainName
          ? selectedDomain.domainName
          : null;
      competency.set('domainName', domainName);
      Ember.run.later(function() {
        component.set('selectedCompetency', competency);
      });
      component.set('domainCompetencyList', domainCompetencyList);
      component.set('showCompetencyInfo', true);
    },

    onDomainSelect(domain) {
      let component = this;
      if (this.get('selectedDomain')) {
        this.set('selectedDomain.isActive', false);
      }
      domain.set('isActive', !domain.get('isActive'));
      domain.set('isExpanded', !domain.get('isExpanded'));
      if (
        domain.get('domainCode') !== component.get('selectedDomain.domainCode')
      ) {
        component.set('selectedDomain', domain);
      }

      component.set('selecctedDomainTopics', domain.get('topics'));
      component.set('selectedCompetency', null);
      component.set('showDomainInfo', domain.get('isExpanded'));
      component.set('isShowTopicInfo', false);
      component.set('showCompetencyInfo', false);
    },

    onCloseDomainInfoPullup(domain) {
      domain.set('isExpanded', false);
      this.set('selectedDomain', domain);
    },

    onSelectTopic(topic) {
      if (this.get('selectedTopic')) {
        this.set('selectedTopic.isActive', false);
      }
      topic.set('domainName', this.get('selectedDomain.domainName'));
      topic.set('isActive', true);
      this.set('selectedTopic', topic);
      this.set('showDomainInfo', false);
      this.set('showCompetencyInfo', false);
      this.set('isShowTopicInfo', true);
    },

    onCloseTopicInfoPullup() {
      this.set('selectedTopic', null);
      if (this.get('selectedDomain')) {
        this.set('showDomainInfo', true);
      }
    },

    onClosePullUp() {
      let component = this;
      component.set('selectedCompetency', null);
    },

    onChangeToBack() {
      this.set('classController.class.isStudentLearner', true);
      let tab = this.get('tab');
      if (tab) {
        this.transitionToRoute(
          'teacher.class.students-proficiency',
          this.get('classController.class.id'),
          {
            queryParams: {
              tab: tab
            }
          }
        );
      } else {
        window.history.back();
      }
    }
  },

  setSignatureContent(competency) {
    let component = this;
    const signatureCompetencyList = component.get('signatureCompetencyList');
    const domainCode = competency.get('domainCode');
    const competencyStatus = competency.get('status');
    let showSignatureAssessment =
      signatureCompetencyList[domainCode] ===
        competency.get('competencyCode') ||
      competencyStatus === 2 ||
      competencyStatus === 4;
    competency.set('showSignatureAssessment', showSignatureAssessment);
  },
  /**
   * This method will load the initial set  of data
   */
  loadData() {
    let component = this;
    let categories = component.get('taxonomyCategories');
    let categoryCode = component.get('categoryCode');
    component.set('selectedDomain', null);
    let defaultCategory = categoryCode
      ? categories.findBy('code', categoryCode)
      : categories.get('firstObject');
    if (defaultCategory) {
      component.set('selectedCategory', defaultCategory);
      component.fetchSubjectsByCategory(defaultCategory);
    }
  },

  fetchSignatureCompetencyList() {
    let component = this;
    let subject = component.get('subjectCode');
    let userId = component.get('studentProfile.id');
    return Ember.RSVP.hash({
      competencyList: component
        .get('competencyService')
        .getUserSignatureCompetencies(userId, subject)
    }).then(({ competencyList }) => {
      component.set('signatureCompetencyList', competencyList);
    });
  },

  /**
   * @function fetchSubjectsByCategory
   * @param subjectCategory
   * Method to fetch list of subjects using given category level
   */
  fetchSubjectsByCategory(category) {
    let component = this;
    let userId = component.get('studentProfile.id');
    Ember.RSVP.hash({
      subjects: component
        .get('taxonomyService')
        .getTaxonomySubjects(category.get('id')),
      tenantData: component.getTenantSetting()
    }).then(({ subjects, tenantData }) => {
      if (
        tenantData &&
        tenantData.enable_learners_data_visibilty_pref === 'on'
      ) {
        Ember.RSVP.hash({
          taxonomySubject: component
            .get('taxonomyService')
            .getTaxonomySubjectsByUserId(userId)
        }).then(({ taxonomySubject }) => {
          let filterData = subjects.filter(subject => {
            return taxonomySubject.subjects.find(
              item => item.subject_code === subject.code
            );
          });
          if (filterData && filterData.length) {
            component.set('taxonomySubjects', filterData);
          } else {
            component.set('taxonomySubjects', subjects);
          }
          component.loadDataSubject(subjects);
        }, this);
      } else {
        component.set('taxonomySubjects', subjects);
        component.loadDataSubject(subjects);
      }
    }, this);
  },

  loadDataSubject(subjects) {
    let component = this;
    if (subjects.length) {
      let subject = component.getActiveSubject(subjects);
      component.set('activeSubject', subject);
      component.set('isShowMatrixChart', true);
      component.fetchTaxonomyGrades();
      component.loadDataBySubject();
      component.fetchSignatureCompetencyList();
    } else {
      component.set('isShowMatrixChart', false);
      component.set('activeSubject', null);
    }
  },

  /**
   * @function getActiveSubject
   * Method to get active subject by using subject bucket
   */
  getActiveSubject(subjects) {
    let component = this;
    let activeSubject = subjects.objectAt(0);
    let subjectBucket = component.get('subjectBucket');
    for (let subjectIndex = 0; subjectIndex < subjects.length; subjectIndex++) {
      if (subjectBucket) {
        const subject = subjects[subjectIndex];
        if (subject.id === getGutCodeFromSubjectId(subjectBucket)) {
          activeSubject = subject;
          break;
        }
      }
    }
    return activeSubject;
  },

  /**
   * @function loadDataBySubject
   * Method to fetch domain and co-ordinate data using subject id
   */
  loadDataBySubject() {
    let component = this;
    let subjectId = component.get('activeSubject.id');
    let userId = component.get('studentProfile.id');
    let timeLine = component.get('timeLine');

    const subjectCode = component.get('activeSubject.code');
    const classFrameworkCode = component.get('class.preference.framework');
    const classSubjectCode = component.get('class.preference.subject');
    if (classSubjectCode !== subjectCode || !classFrameworkCode) {
      const userStandardPreference = component.get('userStandardPreference');
      if (userStandardPreference) {
        const frameworkCode = userStandardPreference[subjectCode];
        component.set('framework', frameworkCode);
      }
    } else {
      component.set('framework', classFrameworkCode);
    }
    let frameworkId = component.get('framework');
    let classId = component.get('class.id');

    if (subjectId) {
      let tenantSetting = component.get('tenantSettingsObj');
      let isDefaultShowFW = false;
      if (
        tenantSetting &&
        tenantSetting.default_show_fw_competency_proficiency_view &&
        tenantSetting.default_show_fw_competency_proficiency_view.length
      ) {
        let classPreference = subjectId.concat('.', frameworkId);
        isDefaultShowFW =
          tenantSetting.default_show_fw_competency_proficiency_view.indexOf(
            classPreference
          ) !== -1;
      }
      const dataParam = {
        subject: subjectId
      };
      if (isDefaultShowFW) {
        dataParam.framework = frameworkId;
      }
      return Ember.RSVP.hash({
        domainTopicCompetency: component
          .get('competencyService')
          .fetchStudentDomainTopicCompetency(
            userId,
            subjectId,
            timeLine,
            classId,
            isDefaultShowFW ? frameworkId : null
          ),

        domainTopicMetadata: component
          .get('competencyService')
          .fetchDomainTopicMetadata(dataParam),

        crossWalkFWC:
          frameworkId && !isDefaultShowFW
            ? component
              .get('taxonomyService')
              .fetchCrossWalkFWC(frameworkId, subjectId)
            : null
      }).then(
        ({ domainTopicCompetency, domainTopicMetadata, crossWalkFWC }) => {
          if (
            !(component.get('isDestroyed') || component.get('isDestroying'))
          ) {
            if (crossWalkFWC) {
              component.set(
                'fwCompetencies',
                flattenGutToFwCompetency(crossWalkFWC)
              );
              component.set('crossWalkFWC', crossWalkFWC);
              component.set('fwDomains', flattenGutToFwDomain(crossWalkFWC));
            }
            component.set('showGutCompetency', !frameworkId);
            component.set('hideGutCompetencyButton', !frameworkId);
            component.parseDomainTopicCompetencyData(
              domainTopicCompetency,
              domainTopicMetadata,
              isDefaultShowFW
            );
          } else {
            Ember.Logger.warn('comp is destroyed...');
          }
        },
        this
      );
    }
  },

  /**
   * @function fetchTaxonomyGrades
   * Method to fetch taxonomy grades
   */
  fetchTaxonomyGrades() {
    let component = this;
    let taxonomyService = component.get('taxonomyProvider');
    let filters = {
      subject: component.get('subjectCode')
    };
    let fwCode = component.get('class.preference.framework');
    if (fwCode) {
      filters.fw_code = fwCode;
    }
    if (component.get('subjectCode')) {
      return Ember.RSVP.hash({
        taxonomyGrades: taxonomyService.fetchGradesBySubject(filters)
      }).then(({ taxonomyGrades }) => {
        if (!(component.get('isDestroyed') || component.get('isDestroying'))) {
          component.set(
            'taxonomyGrades',
            taxonomyGrades.sortBy('sequence').reverse()
          );
        }
      });
    }
  },

  parseDomainTopicCompetencyData(
    domainTopicMatrix,
    domainTopicMetadata,
    isDefaultShowFW
  ) {
    const chartData = [];
    let highestTopicSize = 0;
    const skylinePoints = [];
    let totalTopics = 0;
    this.maxDomainSize = Math.max.apply(
      Math,
      domainTopicMatrix.map(domain => domain.totalCompetencies || 0)
    );
    domainTopicMetadata.domainTopics.map(domainMetadata => {
      let crossWalkFWC = this.get('crossWalkFWC') || [];
      const crossWalkFWDomain = crossWalkFWC.find(
        fwDomain => fwDomain.domainCode === domainMetadata.domainCode
      );
      if (crossWalkFWDomain) {
        domainMetadata.fwDomainName = crossWalkFWDomain.fwDomainName;
      }
      const topicSkylinePoints = [];
      const domainMatrix = domainTopicMatrix.find(
        matrix => matrix.domainCode === domainMetadata.domainCode
      );
      const parsedDomainMatrixData = this.parseCrossWalkFWC(domainMatrix);
      let parsedDomainData = {
        ...domainMetadata,
        ...parsedDomainMatrixData
      };
      highestTopicSize =
        highestTopicSize < domainMetadata.topics.length
          ? domainMetadata.topics.length
          : highestTopicSize;
      let domainCompetenciesCount = 0;
      if (domainMatrix && domainMatrix.topics) {
        const parsedDomainTopicData = [];
        totalTopics += domainMatrix.topics.length;
        parsedDomainMatrixData.topics.map(topicMatrix => {
          const crossWalkFWDomainTopic = crossWalkFWC.find(
            fwDomain => fwDomain.domainCode === domainMetadata.domainCode
          );
          if (crossWalkFWDomainTopic) {
            const crossWalkFWDomains = crossWalkFWDomainTopic.topics.find(
              fwDomain => fwDomain.topicCode === topicMatrix.topicCode
            );
            if (crossWalkFWDomains) {
              topicMatrix.fwTopicName = crossWalkFWDomains.fwTopicName;
            }
          }
          const topicMetadata = domainMetadata.topics.find(
            topic => topic.topicCode === topicMatrix.topicCode
          );
          if (topicMatrix.competencies) {
            const competencies = topicMatrix.competencies.map(competency => {
              if (this.get('isTeacherMatrix')) {
                competency.status = 4;
              }
              (competency.domainCode = domainMetadata.domainCode),
              (competency.domainSeq = domainMetadata.domainSeq),
              (competency.topicCode = topicMatrix.topicCode),
              (competency.topicSeq = topicMatrix.topicSeq),
              (competency.competencyStatus = competency.status);
              competency.isMastered = competency.status > 1;
              competency.isInferred =
                competency.status === 2 || competency.status === 3;
              competency.competencyName = competency.framework
                ? competency.framework.frameworkCompetencyName
                  ? competency.framework.frameworkCompetencyName
                  : competency.competencyName
                : competency.competencyName;
              competency.framework = competency.framework
                ? competency.framework
                : null;
              competency.isMappedWithFramework = competency.isMappedWithFramework
                ? competency.isMappedWithFramework
                : !!isDefaultShowFW;
              competency.isSkyLineCompetency = false;
              competency.isGradeBoundary = false;
              return Ember.Object.create(competency);
            });
            topicMatrix.competencies = competencies.sortBy('competencySeq');
            topicMatrix.competencies[0].isSkyLineCompetency = true;
          }
          domainCompetenciesCount += topicMatrix.competencies.length;
          topicMatrix = {
            ...topicMatrix,
            ...topicMetadata,
            ...this.groupCompetenciesByStatus(topicMatrix.competencies),
            ...{
              domainCode: domainMetadata.domainCode,
              domainSeq: domainMetadata.domainSeq
            }
          };
          topicSkylinePoints.push(
            Ember.Object.create({
              topicSeq: topicMatrix.topicSeq,
              skylineCompetencySeq: topicMatrix.masteredCompetencies
            })
          );
          parsedDomainTopicData.push(Ember.Object.create(topicMatrix));
        });
        parsedDomainData.topics = parsedDomainTopicData.sortBy('topicSeq');
      }
      parsedDomainData.totalCompetencies = domainCompetenciesCount;
      parsedDomainData = {
        ...parsedDomainData,
        ...this.groupCompetenciesByTopic(parsedDomainData.topics)
      };

      skylinePoints.push(
        Ember.Object.create({
          domainSeq: parsedDomainData.domainSeq,
          skylineCompetencySeq: parsedDomainData.masteredCompetencies,
          topicSkylinePoints: topicSkylinePoints.sortBy('topicSeq')
        })
      );
      chartData.push(Ember.Object.create(parsedDomainData));
    });

    this.set('skylinePoints', skylinePoints.sortBy('domainSeq'));
    if (this.get('isPublic') && this.get('isInitialSkyline')) {
      this.initialSkylineMasteries(chartData.sortBy('domainSeq'));
    } else {
      this.set('proficiencyChartData', chartData.sortBy('domainSeq'));
    }
    // Help to tigger action once proficiency chart data loaded
    if (this.get('isTeacherMatrix')) {
      this.send('onLoadedProficiency');
    }
    this.set('totalTopics', totalTopics);
  },

  /**
   * @function parseCrossWalkFWC
   * Method to check cross walk competency with user competency matrix
   */
  parseCrossWalkFWC(domainData) {
    let component = this;
    let crossWalkFWC = component.get('crossWalkFWC') || [];
    if (crossWalkFWC && crossWalkFWC.length) {
      if (domainData) {
        let fwDomain = crossWalkFWC.findBy('domainCode', domainData.domainCode);
        if (fwDomain) {
          domainData.topics.map(topic => {
            let fwTopics = fwDomain.topics.findBy('topicCode', topic.topicCode);
            if (fwTopics) {
              let competencies = topic.competencies;
              const fwCompetencies = fwTopics.competencies || [];
              if (fwCompetencies && fwCompetencies.length) {
                return competencies.map(competency => {
                  let fwCompetency = fwCompetencies.find(fwCompetency => {
                    return (
                      fwCompetency.competencyCode === competency.competencyCode
                    );
                  });
                  const isMappedWithFramework = !!fwCompetency;
                  competency.isMappedWithFramework = isMappedWithFramework;
                  if (fwCompetency) {
                    competency.framework = fwCompetency;
                  }
                  return competency;
                });
              }
            }
          });
        }
      }
    }
    return domainData;
  },

  // TODO: it should be done in serializers
  groupCompetenciesByTopic(topics) {
    let masteredCompetencies = 0;
    let inprogressCompetencies = 0;
    let notstartedCompetencies = 0;
    let inferredCompetencies = 0;
    let completedCompetencies = 0;
    topics.map(topic => {
      completedCompetencies += topic.completedCompetencies;
      masteredCompetencies += topic.masteredCompetencies;
      inprogressCompetencies += topic.inprogressCompetencies;
      inferredCompetencies += topic.inferredCompetencies;
      notstartedCompetencies += topic.notstartedCompetencies;
    });
    return {
      completedCompetencies,
      masteredCompetencies,
      inprogressCompetencies,
      notstartedCompetencies,
      inferredCompetencies,
      totalCompetencies:
        completedCompetencies +
        inprogressCompetencies +
        notstartedCompetencies +
        inferredCompetencies
    };
  },

  groupCompetenciesByStatus(competencies) {
    const competenciesCount = {
      completedCompetencies: 0,
      inprogressCompetencies: 0,
      inferredCompetencies: 0,
      notstartedCompetencies: 0,
      masteredCompetencies: 0
    };
    competencies.map(competency => {
      if (competency.status === 0) {
        competenciesCount.notstartedCompetencies++;
      } else if (competency.status === 1) {
        competenciesCount.inprogressCompetencies++;
      } else if (competency.status === 2 || competency.status === 3) {
        competenciesCount.inferredCompetencies++;
        competenciesCount.masteredCompetencies++;
      } else {
        competenciesCount.completedCompetencies++;
        competenciesCount.masteredCompetencies++;
      }
    });
    return competenciesCount;
  },

  initialSkylineMasteries(proficiencyChartData) {
    const component = this;
    let gradeId = component.get('activeGrade.id');
    let isPublic = component.get('isPublic');
    const masteredCompetencies = proficiencyChartData.find(domain => {
      return domain.masteredCompetencies > 0;
    });
    if (!masteredCompetencies && isPublic) {
      component.set('isDefaultSkyline', true);
      let tenantSetting = component.get('tenantSetting');
      let taxonomyGrades = component.get('taxonomyGrades').sortBy('sequence');
      let independentCourses = component.get('independentCourses');
      let currentCourse = independentCourses.findBy(
        'id',
        component.get('courseId')
      );
      let frameworkId = currentCourse.get('settings.framework');
      let subjectCode = currentCourse.get('subject');
      const defaultGradeDiff = tenantSetting.default_skyline_grade_diff_for_diagnostic_flow
        ? tenantSetting.default_skyline_grade_diff_for_diagnostic_flow
        : null;
      let gradeDiff =
        tenantSetting.default_skyline_grade_diff &&
        tenantSetting.default_skyline_grade_diff[
          `${frameworkId}.${subjectCode}`
        ]
          ? tenantSetting.default_skyline_grade_diff[
            `${frameworkId}.${subjectCode}`
          ]
          : defaultGradeDiff;
      gradeDiff = gradeDiff || 2;

      let gradeLowerBoundSeq;
      if (this.get('isNextEnable')) {
        const hasMathGradeLevels = taxonomyGrades.find(item => item.levels);
        let mathLevelGrades = hasMathGradeLevels
          ? component.get('mathLevelGrades')
          : taxonomyGrades;
        let gradeCurrent = component.get('studentMathGrade');
        let courseLowerBound = mathLevelGrades.findBy(
          'id',
          gradeCurrent.level_id || gradeCurrent.id || gradeCurrent.levelId
            ? gradeCurrent.level_id || gradeCurrent.id || gradeCurrent.levelId
            : gradeCurrent.id
        );
        gradeLowerBoundSeq = courseLowerBound.sequence;
      } else {
        let gradeCurrent = currentCourse.get('settings.gradeCurrent');
        let courseLowerBound = taxonomyGrades.findBy('id', gradeCurrent);
        gradeLowerBoundSeq = courseLowerBound.sequence - gradeDiff;
      }

      if (gradeLowerBoundSeq >= 1) {
        const hasMathGradeLevels = taxonomyGrades.find(item => item.levels);
        let mathLevelGrades =
          hasMathGradeLevels && this.get('isNextEnable')
            ? component.get('mathLevelGrades')
            : taxonomyGrades;
        let activeGrade = mathLevelGrades.findBy(
          'sequence',
          gradeLowerBoundSeq
        );

        let previousGrade = !parseInt(gradeDiff, 0)
          ? mathLevelGrades.findBy('sequence', gradeLowerBoundSeq - 1)
          : activeGrade;
        gradeId = previousGrade
          ? previousGrade.get('levelId') || previousGrade.get('id')
          : null;
        component.set('defaultGrade', activeGrade);
        if (gradeId) {
          component.fetchDomainGradeBoundary(gradeId, proficiencyChartData);
        } else {
          component.set('proficiencyChartData', proficiencyChartData);
        }
      } else {
        component.set('proficiencyChartData', proficiencyChartData);
      }
    } else {
      component.set('proficiencyChartData', proficiencyChartData);
    }
  },

  /**
   * @function fetchDomainGradeBoundary
   * Method to fetch domain grade boundary
   */
  fetchDomainGradeBoundary(gradeId, proficiencyChartData) {
    let component = this;
    let taxonomyService = component.get('taxonomyService');
    return Ember.RSVP.hash({
      gradeBoundaries: gradeId
        ? Ember.RSVP.resolve(
          taxonomyService.fetchDomainGradeBoundaryBySubjectId(gradeId)
        )
        : Ember.RSVP.resolve(null)
    }).then(({ gradeBoundaries }) => {
      const isNoSkylineData =
        gradeBoundaries && component.get('isDefaultSkyline');
      if (isNoSkylineData) {
        let skylinePoints = Ember.A();
        let chartData = proficiencyChartData.map(domainChartData => {
          let domainHiLineCompSeq = 0;
          let isHiLineTopicCovered = false;
          const domainGradeBoundariesList = gradeBoundaries.filter(domain => {
            return domain.domainCode === domainChartData.domainCode;
          });
          domainChartData.topics.map(topic => {
            let domainGradeBoundaries = gradeBoundaries.find(grade => {
              return grade.domainCode === domainChartData.domainCode;
            });
            const topicBoundaries = domainGradeBoundariesList.find(
              item => item.topicCode && item.topicCode === topic.topicCode
            );
            if (topicBoundaries) {
              domainGradeBoundaries = topicBoundaries;
            }
            let skylineCompetencySeq =
              !isHiLineTopicCovered &&
              domainGradeBoundaries &&
              !domainGradeBoundaries.topicAverageComp &&
              topic.competencies
                ? topic.competencies.length
                : 0;
            if (
              (domainGradeBoundaries &&
                topic.topicCode === domainGradeBoundaries.topicCode) ||
              (domainGradeBoundaries &&
                topic.topicCode === domainGradeBoundaries.highlineTopic)
            ) {
              isHiLineTopicCovered = true;
              skylineCompetencySeq =
                topic.competencies.findIndex(
                  competency =>
                    competency.competencyCode ===
                    (domainGradeBoundaries.topicHighlineComp
                      ? domainGradeBoundaries.topicHighlineComp
                      : domainGradeBoundaries.highlineComp)
                ) + 1;
            }
            domainHiLineCompSeq = domainHiLineCompSeq + skylineCompetencySeq;
          });
          skylinePoints.push(
            Ember.Object.create({
              domainSeq: domainChartData.domainSeq,
              skylineCompetencySeq: domainHiLineCompSeq
            })
          );
          domainChartData.set('masteredCompetencies', domainHiLineCompSeq);
          return domainChartData;
        });
        component.set('skylinePoints', skylinePoints);
        component.set('proficiencyChartData', chartData);
      }
    });
  }
});
