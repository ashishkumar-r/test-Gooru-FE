import Ember from 'ember';
import { PLAYER_EVENT_SOURCE } from 'gooru-web/config/config';
import {
  getSubjectId,
  getDomainId,
  getCourseId
} from 'gooru-web/utils/taxonomy';
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['signature-content-container'],

  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @property {service} searchService
   */
  searchService: Ember.inject.service('api-sdk/search'),
  /**
   * @property {service} taxonomyService
   */
  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),
  /**
   * @property {service} assessmentService
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),
  /**
   * @property {service} collectionService
   */
  collectionService: Ember.inject.service('api-sdk/collection'),
  /**
   * @property {service} suggestService
   */
  suggestService: Ember.inject.service('api-sdk/suggest'),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Object} competency
   */
  competency: null,

  /**
   * @property {String} standardCode
   */
  standardCode: Ember.computed.alias('competency.competencyCode'),

  onCompetencyChange: Ember.observer(
    'competency',
    'showGutCompetency',
    function() {
      let component = this;
      component.loadData();
    }
  ),

  /**
   * @property {Object} signatureContent
   */
  signatureContent: null,

  /**
   * @property {boolean} showSignatureAssessment
   */
  showSignatureAssessment: false,

  /**
   * @property {Object} content
   */
  content: null,

  /**
   * @property {Array} prerequisites
   */
  prerequisites: null,

  /**
   * @property {Array} microCompetencies
   */
  microCompetencies: null,

  /**
   * @property {boolean} isLoading
   */
  isLoading: false,

  /**
   * @property {number} domainId
   */
  domainId: Ember.computed('standardCode', function() {
    let code = this.get('standardCode');
    return getDomainId(code);
  }),

  /**
   * @property {number} subjectId
   */
  subjectId: Ember.computed('standardCode', function() {
    let code = this.get('standardCode');
    return getSubjectId(code);
  }),

  /**
   * @property {number} courseId
   */
  courseId: Ember.computed('standardCode', function() {
    let code = this.get('standardCode');
    return getCourseId(code);
  }),

  /**
   * @property {boolean} flag for determining unlimited behaviour
   */
  unlimited: Ember.computed.equal('content.attempts', -1),

  /**
   * @property {String} collectionType
   */
  collectionType: Ember.computed('showSignatureAssessment', function() {
    let component = this;
    let showSignatureAssessment = component.get('showSignatureAssessment');
    return showSignatureAssessment ? 'assessment' : 'collection';
  }),

  /**
   * @property {String} source value when playing a collection/assessment
   */
  source: PLAYER_EVENT_SOURCE.MASTER_COMPETENCY,

  /**
   * @property {Array} students
   */
  students: Ember.computed('student', function() {
    const component = this;
    const studentListForSuggestion = component.get('studentListForSuggestion');
    let students = studentListForSuggestion
      ? studentListForSuggestion
      : [component.get('student')];
    return students;
  }),

  isMappedWithGutCode: Ember.computed(
    'competency.isMappedWithFramework',
    'showGutCompetency',
    function() {
      return (
        this.get('competency.isMappedWithFramework') &&
        !this.get('showGutCompetency')
      );
    }
  ),

  actions: {
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
      const competencyCode = component.get('standardCode');
      component.set('showSuggestConfirmation', false);
      component.sendAction(
        'onConfirmSuggest',
        collection,
        collectionType,
        competencyCode
      );
    },

    //Action triggered when click collection/assessment title
    onPreviewContent(content) {
      const component = this;
      const collectionType =
        content.get('suggestedContentType') || component.get('collectionType');
      component.set('previewContent', content.get('collection'));
      component.set('previewContentType', collectionType);
      component.set('isShowContentPreview', true);
    },

    playContent(queryParams, contentId, content) {
      const component = this;
      component.sendAction('playContent', queryParams, contentId, content);
    }
  },

  init() {
    let component = this;
    component._super(...arguments);
    component.loadData();
  },

  loadData() {
    let component = this;
    component.fetchLearningMapsContent();
    component.fetchCodes();
    if (component.get('userId')) {
      component.fetchTeacherSuggestions();
    }
  },

  didRender() {
    let component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  /**
   * @function fetchCodes
   * Method to fetch all competency code for domain
   */
  fetchCodes() {
    let component = this;
    let frameworkId = component.get('classFramework')
      ? component.get('classFramework')
      : component.class.preference.framework;
    let competncyId = component.get('competency.competencyCode');
    return Ember.RSVP.hash({
      competencyCodes: component
        .get('taxonomyService')
        .fetchCompetencyCodes(frameworkId, competncyId)
    }).then(({ competencyCodes }) => {
      component.set('microCompetencies', competencyCodes);
    });
  },

  /**
   * @function fetchLearningMapsContent
   * Method to fetch learning maps content
   */
  fetchLearningMapsContent() {
    let component = this;
    let searchService = component.get('searchService');
    let taxonomyService = component.get('taxonomyService');
    let competencyCode = component.get('standardCode');
    let filters = {
      isDisplayCode: true
    };
    let languageId = component.get('class.primaryLanguage');
    component.set('competencyGutCode', competencyCode);
    component.set('isLoading', true);
    return Ember.RSVP.hash({
      learningMapData: searchService.fetchLearningMapsContentCompetency(
        competencyCode,
        filters,
        null,
        languageId
      ),
      prerequisites: taxonomyService.fetchPrerequisites(competencyCode)
    }).then(({ learningMapData, prerequisites }) => {
      if (!(component.get('isDestroyed') || component.get('isDestroying'))) {
        component.set('learningMapData', learningMapData);
        let signatureContentList = learningMapData.signatureContents;
        let signatureContent = undefined;
        component.checkPrerequisiteCompetencyStatus(
          prerequisites.competencyPrerequisites
        );
        if (signatureContentList) {
          let showSignatureAssessment =
            component.get('showSignatureAssessment') &&
            signatureContentList.assessments.length > 0;
          component.set('showSignatureAssessment', showSignatureAssessment);
          signatureContent = showSignatureAssessment
            ? signatureContentList.assessments
            : signatureContentList.collections;
          if (!component.get('userId')) {
            component.set('isLoading', false);
          }

          if (signatureContent) {
            let content = signatureContent.objectAt(0);
            if (content) {
              component.set('signatureContent', Ember.Object.create(content));
              component.fetchContentSettings(content.id);
            }
          }
        }
      }
    });
  },

  /**
   * @function checkPrerequisiteCompetencyStatus
   * Method to check prerequisite competency status
   */
  checkPrerequisiteCompetencyStatus(prerequisites) {
    let component = this;
    let domainCompetencyList = component.get('proficiencyChartData');
    let prerequisitesList = Ember.A([]);
    if (prerequisites && domainCompetencyList) {
      prerequisites.forEach(competency => {
        domainCompetencyList.forEach(domain => {
          domain.topics.forEach(topic => {
            let filteredCompetency = topic.competencies.findBy(
              'competencyCode',
              competency
            );
            if (filteredCompetency) {
              let competencyList = {
                status: filteredCompetency ? filteredCompetency.status : 0,
                title: filteredCompetency.framework
                  ? filteredCompetency.framework.frameworkCompetencyName
                  : filteredCompetency.competencyName,
                code: filteredCompetency.framework
                  ? filteredCompetency.framework.frameworkCompetencyDisplayCode
                  : filteredCompetency.competencyDisplayCode
              };
              prerequisitesList.push(competencyList);
            }
          });
        });
      });
      component.set('prerequisites', prerequisitesList);
    }
  },

  /**
   * @function fetchContentSettings
   * Method to fetch content setting
   */
  fetchContentSettings(contentId) {
    let component = this;
    let collectionType = component.get('collectionType');
    let contentPromise = null;
    if (collectionType === 'assessment') {
      contentPromise = component
        .get('assessmentService')
        .readAssessment(contentId);
    } else {
      contentPromise = component
        .get('collectionService')
        .readCollection(contentId);
    }
    return Ember.RSVP.hash({
      content: contentPromise
    })
      .then(({ content }) => {
        let signatureContent = component.get('signatureContent');
        signatureContent.set('collection', content);
      })
      .catch(() => {
        let signatureContent = component.get('signatureContent');
        signatureContent.set('collection', null);
      });
  },

  fetchTeacherSuggestions() {
    const component = this;
    const userId = component.get('userId');
    const competencyCode = component.get('competency.competencyCode');
    let params = {
      scope: 'proficiency'
    };
    component
      .get('suggestService')
      .fetchAcrossClassSuggestionsByCode(userId, competencyCode, params)
      .then(content => {
        component.set('suggestions', content.get('suggestions'));
        component.set('isLoading', false);
      });
  }
});
