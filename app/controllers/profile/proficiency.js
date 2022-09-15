import Ember from 'ember';
import { SCREEN_SIZES, DEFAULT_K12_SUBJECT } from 'gooru-web/config/config';
import {
  flattenGutToFwCompetency,
  flattenGutToFwDomain
} from 'gooru-web/utils/taxonomy';
import { isCompatibleVW } from 'gooru-web/utils/utils';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Controller.extend(tenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('taxonomy'),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyProvider: Ember.inject.service('api-sdk/taxonomy'),

  /**
   * competency service dependency injection
   * @type {Object}
   */
  competencyService: Ember.inject.service('api-sdk/competency'),

  parentController: Ember.inject.controller('profile'),

  /**
   * it maintains profile data
   * @type {Object}
   */
  profile: Ember.computed.alias('parentController.profile'),

  /**
   * it maintains profile data
   * @type {Object}
   */
  userPreference: Ember.computed.alias('parentController.userPreference'),

  /**
   * show pull out .
   * @type {boolean}
   */
  showPullOut: false,

  showSignatureAssessment: false,

  /**
   * Show loading spinner
   */
  competencyStatus: [
    'Not Started',
    'In progress',
    'Inferred',
    'Asserted',
    'Earned',
    'Demonstrated'
  ],

  /**
   * @property {boolean} roles is student or not for proficiency tabs view
   */
  isStudent: Ember.computed('profile', function() {
    let component = this;
    return component.get('profile').get('role') === 'student';
  }),

  // -------------------------------------------------------------------------
  // Events

  initialize() {
    let controller = this;
    this.set('showProficiencyChart', true);
    controller.fetchCategories().then(() => {
      let selectedCategory = controller.get('selectedCategory');
      controller.fetchSubjectsByCategory(selectedCategory);
    });
  },

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Select category based on user selection.
     * @param  {Object} item
     */
    onSelectCategory(category) {
      let controller = this;
      controller.set('selectedCategory', category);
      controller.set('showDomainInfo', false);
      controller.set('showCompetencyInfo', false);
      controller.set('selectedCompetency', null);
      controller.set('selectedDomain', null);
      controller.fetchSubjectsByCategory(category);
    },

    //Action triggered when the user click a subject from the right panel
    onSelectItem(item) {
      let controller = this;
      controller.set('selectedSubject', item);
      controller.set('showDomainInfo', false);
      controller.set('showCompetencyInfo', false);
      controller.set('selectedCompetency', null);
      controller.set('selectedDomain', null);
      controller.loadDataBySubject(item.get('id'));
    },

    onClosePullOut() {
      this.set('selectedCompetency', null);
      this.set('showPullOut', false);
    },

    /**
     * Action triggered when select a month/year from the filter
     */
    onSelectMonth(date) {
      let timeLine = {
        month: date.getMonth() + 1,
        year: date.getFullYear()
      };
      this.set('timeLine', timeLine);
      this.loadDataBySubject(this.get('selectedSubject.id'));
    },

    /**
     * Action triggered when select a competency
     */
    onSelectCompetency(competency, domainCompetencyList) {
      let controller = this;
      controller.setSignatureContent(competency);
      controller.set('selectedCompetency', competency);
      controller.set('domainCompetencyList', domainCompetencyList);
      controller.set('showCompetencyInfo', true);
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
      let controller = this;
      controller.set('selectedCompetency', null);
    },

    closePullUp() {
      const controller = this;
      controller.set('isOpenPlayer', false);
    },

    playContent(queryParams, contentId, content) {
      const controller = this;
      controller.set(
        'playerUrl',
        controller.target.get('router').generate('player', contentId, {
          queryParams
        })
      );
      controller.set('isOpenPlayer', true);
      controller.set('playerContent', content);
    },

    isShowLoaderSet(value) {
      this.set('isShowLoader', value);
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  setSignatureContent(competency) {
    let controller = this;
    const signatureCompetencyList = controller.get('signatureCompetencyList');
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
   * @function fetchCategories
   * Method  fetch list of taxonomy categories
   */
  fetchCategories() {
    let controller = this;
    return new Ember.RSVP.Promise(reslove => {
      controller
        .get('taxonomyService')
        .getCategories()
        .then(categories => {
          let category = categories.objectAt(0);
          controller.set('selectedCategory', category);
          controller.set('categories', categories);
          reslove();
        });
    });
  },

  /**
   * @function fetchSubjectsByCategory
   * @param subjectCategory
   * Method to fetch list of subjects using given category level
   */
  fetchSubjectsByCategory(subjectCategory) {
    let controller = this;
    let selectedCategoryId = subjectCategory.get('id');
    controller
      .get('taxonomyService')
      .getTaxonomySubjects(selectedCategoryId)
      .then(subjects => {
        let defaultSubject = subjects.findBy('id', DEFAULT_K12_SUBJECT);
        let selectedSubject = defaultSubject
          ? defaultSubject
          : subjects.objectAt(0);
        controller.set('taxonomySubjects', subjects);
        controller.set('selectedSubject', selectedSubject);
        if (selectedSubject) {
          controller.loadDataBySubject(selectedSubject.get('id'));
        }
      });
  },

  loadDataBySubject(subjectId) {
    if (subjectId) {
      let controller = this;
      let userId = controller.get('userId');
      let timeLine = controller.get('timeLine');
      const subjectCode = controller.get('selectedSubject.code');
      let taxonomyService = controller.get('taxonomyProvider');
      let filters = {
        subject: subjectCode
      };

      const userPreference = controller.get(
        'userPreference.standard_preference'
      );
      const frameworkCode = userPreference
        ? userPreference[subjectCode]
        : 'GUT';
      controller.set('framework', frameworkCode);
      if (!frameworkCode) {
        controller.set('showGutCompetency', true);
      }
      controller.set('isLoading', true);
      let tenantSetting = controller.get('tenantSettingsObj');
      let isDefaultShowFW = false;
      if (
        tenantSetting &&
        tenantSetting.default_show_fw_competency_proficiency_view &&
        tenantSetting.default_show_fw_competency_proficiency_view.length
      ) {
        let classPreference = subjectId.concat('.', frameworkCode);
        isDefaultShowFW =
          tenantSetting.default_show_fw_competency_proficiency_view.indexOf(
            classPreference
          ) !== -1;
      }
      const dataParam = {
        subject: subjectId
      };
      if (isDefaultShowFW) {
        dataParam.framework = frameworkCode;
      }

      if (
        tenantSetting &&
        tenantSetting.tx_fw_prefs &&
        controller.get('isEnableNavigatorPrograms')
      ) {
        let isFound = tenantSetting.tx_fw_prefs[subjectCode];
        let tenantFW = isFound ? isFound.default_fw_id : null;
        filters.fw_code = tenantFW ? tenantFW : frameworkCode;
      } else {
        filters.fw_code = frameworkCode;
      }
      return Ember.RSVP.hash({
        domainTopicCompetency: controller
          .get('competencyService')
          .fetchStudentDomainTopicCompetency(
            userId,
            subjectId,
            timeLine,
            null,
            isDefaultShowFW ? frameworkCode : null
          ),

        taxonomyGrades: taxonomyService.fetchGradesBySubject(filters),

        domainTopicMetadata: controller
          .get('competencyService')
          .fetchDomainTopicMetadata(dataParam),
        signatureList: controller
          .get('competencyService')
          .getUserSignatureCompetencies(userId, subjectCode),
        crossWalkFWC: frameworkCode
          ? controller
            .get('taxonomyService')
            .fetchCrossWalkFWC(frameworkCode, subjectId)
          : null
      }).then(
        ({
          domainTopicCompetency,
          domainTopicMetadata,
          signatureList,
          crossWalkFWC,
          taxonomyGrades
        }) => {
          if (
            !(controller.get('isDestroyed') || controller.get('isDestroying'))
          ) {
            controller.set('isLoading', false);
            controller.set('signatureCompetencyList', signatureList);
            controller.set(
              'taxonomyGrades',
              taxonomyGrades.sortBy('sequence').reverse()
            );

            if (crossWalkFWC) {
              controller.set(
                'fwCompetencies',
                flattenGutToFwCompetency(crossWalkFWC)
              );
              controller.set('crossWalkFWC', crossWalkFWC);
              controller.set('fwDomains', flattenGutToFwDomain(crossWalkFWC));
            }

            controller.parseDomainTopicCompetencyData(
              domainTopicCompetency,
              domainTopicMetadata
            );
          } else {
            Ember.Logger.warn('comp is destroyed...');
          }
        },
        this
      );
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  showProficiencyChart: true,

  /**
   * @property {Boolean}
   * Property to store show gut competency
   */
  showGutCompetency: false,
  /**
   * @property {JSON}
   * Property to store active category
   */
  selectedCategory: null,

  /**
   * @property {Array}
   * Property to store list of taxonomy subjects
   */
  taxonomySubjects: null,

  /**
   * @property {Object}
   * Property to store user selected subject info
   */
  selectedSubject: null,

  /**
   * @property {String}
   * Property to store userId of the student
   */
  userId: null,

  /**
   * @type {String}
   * Property to store user selected matrix view
   */
  selectedMatrixView: 'domain',

  /**
   * Property to show/hide expanded chart
   */
  isExpandChartEnabled: false,

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
   * @property {String} subjectCode
   */
  subjectCode: Ember.computed('selectedSubject', function() {
    let controller = this;
    let subject = controller.get('selectedSubject');
    return subject ? subject.id : '';
  }),

  /**
   * @property {Boolean}
   * Property to store given screen value is compatible
   */
  isMobile: isCompatibleVW(SCREEN_SIZES.LARGE),

  parseDomainTopicCompetencyData(domainTopicMatrix, domainTopicMetadata) {
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
                : false;
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

    this.set('proficiencyChartData', chartData.sortBy('domainSeq'));
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
  }
});
