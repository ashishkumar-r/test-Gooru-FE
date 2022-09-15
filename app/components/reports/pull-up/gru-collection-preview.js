import Ember from 'ember';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import {
  PLAYER_EVENT_SOURCE,
  ROLES,
  CONTENT_TYPES,
  ASSESSMENT_SHOW_VALUES
} from 'gooru-web/config/config';
import { getEndpointUrl } from 'gooru-web/utils/endpoint-config';
import ModalMixin from 'gooru-web/mixins/modal';
import PullUpMixin from 'gooru-web/mixins/reports/pull-up/pull-up-mixin';
import PortfolioMixin from 'gooru-web/mixins/reports/portfolio/portfolio-mixin';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import {
  downloadAllSubmision,
  setDownloadPathForUrl
} from 'gooru-web/utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import InstructionalCoacheMixin from 'gooru-web/mixins/instructional-coache-mixin';

export default Ember.Component.extend(
  ModalMixin,
  PullUpMixin,
  PortfolioMixin,
  tenantSettingsMixin,
  InstructionalCoacheMixin,
  {
    // -------------------------------------------------------------------------
    // Attributes
    classNames: ['preview', 'gru-collection-preview'],

    // -------------------------------------------------------------------------
    // Dependencies
    assessmentService: Ember.inject.service('api-sdk/assessment'),

    questionService: Ember.inject.service('api-sdk/question'),

    collectionService: Ember.inject.service('api-sdk/collection'),

    analyticsService: Ember.inject.service('api-sdk/analytics'),

    performanceService: Ember.inject.service('api-sdk/performance'),

    session: Ember.inject.service('session'),
    /**
     * @property {TenantService} Serive to do retrieve competency score details
     */
    tenantService: Ember.inject.service('api-sdk/tenant'),

    /**
     * @property {Service} parseEvent service
     */
    parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

    // -------------------------------------------------------------------------
    // Events
    didInsertElement() {
      const component = this;
      component.openPullUp();
      component.loadPreviewContent();
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
      onClickDownload() {
        let component = this;
        let uploadUrls = [];
        component.get('submissionData').forEach(item => {
          const fileName = setDownloadPathForUrl(item.fileName);
          const fileItem = {
            fileUrl: fileName,
            orginalFileName: item.originalFileName,
            sequenceCode: item.sequenceCode
          };
          uploadUrls.push(fileItem);
          component.set('evidenceUploadUrls', uploadUrls);
        });
        if (component.get('evidenceUploadUrls')) {
          const studName = component.get('previewContent').owner.username
            ? component.get('previewContent').owner.username
            : `${component.get('previewContent').owner.firstName}_${
              component.get('previewContent').owner.lastName
            }`;
          const filename = `${studName}_${
            component.get('previewContent').title
          }`;
          downloadAllSubmision(
            this.get('evidenceUploadUrls'),
            filename,
            studName
          );
        }
      },
      //Action triggered when click toggle answer
      onToggleAnswer() {
        const component = this;
        component
          .get('parseEventService')
          .postParseEvent(
            PARSE_EVENTS.CLICK_CA_SHOW_PREVIEW_SCOPE_SEQUENCE_CARD_CORRECT_ANSWER
          );

        component.toggleProperty('isShowCorrectAnswer');
      },

      //Action triggered when play  content
      onPlayContent() {
        const component = this;

        component
          .get('parseEventService')
          .postParseEvent(
            PARSE_EVENTS.CLICK_CA_SHOW_PREVIEW_SCOPE_SEQUENCE_CARD_PLAY
          );
        let contentId = component.get('previewContentId');
        let playerContext = component.get('playerContext');
        let contentType = component.get('previewContentType');
        let playerURL = getEndpointUrl();
        if (contentType && contentType.includes('external')) {
          let classId = component.get('parentView.previewContent.classId');
          let caContentId = component.get('parentView.previewContent.id');
          let isCourseMap = window.location.href.includes('course-map');
          let isLibrary = window.location.href.includes('library-search');
          let sourceType = isCourseMap
            ? PLAYER_EVENT_SOURCE.COURSE_MAP
            : isLibrary
              ? 'ILActivity'
              : PLAYER_EVENT_SOURCE.DAILY_CLASS;
          playerURL += `/player-external?caContentId=${caContentId}&classId=${classId}&collectionId=${contentId}&isIframeMode=true&role=teacher&source=${sourceType}&type=${contentType}`;
        } else if (playerContext) {
          let classId = playerContext.get('classId');
          let courseId = playerContext.get('courseId');
          let unitId = playerContext.get('unitId');
          let lessonId = playerContext.get('lessonId');
          playerURL += `/player/course/${courseId}/unit/${unitId}/lesson/${lessonId}/collection/${contentId}?role=teacher&type=${contentType}&source=${PLAYER_EVENT_SOURCE.RGO}&isIframeMode=true&classId=${classId}`;
        } else {
          playerURL += `/player/${contentId}?isIframeMode=true&source=${PLAYER_EVENT_SOURCE.RGO}&type=${contentType}`;
        }
        component.set('playerContent', component.get('previewContent'));
        let content = component.get('playerContent');
        content.set('format', contentType);
        component.set('playerUrl', playerURL);
        component.set('isOpenPlayer', true);
      },

      //Action triggered when click print preview
      onPrintPreview() {
        window.print();
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_CA_SHOW_PREVIEW_SCOPE_SEQUENCE_CARD_DOWNLOAD
        );
      },

      //Action triggered when click remix
      onRemixContent() {
        const component = this;
        component.remixContent();
      },

      onToggleAttemptsList() {
        this.$('.activity-attempts-container .all-attempts').slideToggle();
      },

      onToggleCurrentAttemptsList() {
        this.$('.activity-attempts-container .current-attempts').slideToggle();
      },

      onToggleOtherAttemptsList() {
        this.$('.activity-attempts-container .other-attempts').slideToggle();
      },

      closePullUp() {
        const component = this;
        component.set('isOpenPlayer', false);
      },

      onSelectAttempt(attempt) {
        const component = this;
        component.set('activeAttempt', attempt);
        component.loadActivityPerformance(attempt).then(function() {
          component.parseActivityPerformance();
          component.set(
            'repostReadContent',
            component.get('activityPerformance.resourceResults')
          );
          component.set('isFadeContent', true);
          component.loadFadeContent(component.get('previewContent'));
          component.set('isLoading', false);
        });
      }
    },

    // -------------------------------------------------------------------------
    // Properties
    /**
     * @property {Boolean} showPullUp
     */
    showPullUp: false,

    /**
     * @property {Boolean} isSuggestionReport
     */
    isSuggestionReport: false,

    /**
     * @property {UUID} previewContentId
     */
    previewContentId: null,

    /**
     * @property {String} previewContentType
     */
    previewContentType: null,

    /**
     * @property {Boolean} playContent
     */
    playContent: true,

    isClassProgressReport: false,

    /**
     * @property {Boolean} isShowCorrectAnswer
     */
    isShowCorrectAnswer: Ember.computed(
      'isAnonymous',
      'isTeacher',
      'isStudent',
      function() {
        const component = this;
        let classData = component.get('class');
        if (classData) {
          let setting = classData.get('setting');
          let showAnswer = setting ? setting['show.correct.answer'] : false;
          return (
            (showAnswer && component.get('isStudent')) ||
            component.get('isTeacher')
          );
        } else {
          return !(component.get('isStudent') || component.get('isAnonymous'));
        }
      }
    ),

    showPrintPreview: true,
    /**
     * @property {Boolean} isEnableToggleAnswer
     */
    isEnableToggleAnswer: Ember.computed(
      'previewContent.questionCount',
      'isTeacher',
      function() {
        const component = this;
        let isTeacher = component.get('isTeacher');
        let questionCount = component.get('previewContent.questionCount');
        return questionCount && isTeacher;
      }
    ),

    /**
     * @property {TaxonomyTag[]} List of taxonomy tags
     */
    taxonomyTags: Ember.computed('previewContent.standards.[]', function() {
      var standards = this.get('previewContent.standards');
      if (standards) {
        standards = standards.filter(function(standard) {
          // Filter out learning targets (they're too long for the card)
          return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
        });
      }
      return TaxonomyTag.getTaxonomyTags(standards);
    }),

    /**
     * @property {Object} playerContext
     */
    playerContext: null,

    /**
     * @property {Boolean} isTeacher
     */
    isTeacher: Ember.computed.equal('session.role', ROLES.TEACHER),

    /**
     * @property {Boolean} isStudent
     */
    isStudent: Ember.computed.equal('session.role', ROLES.STUDENT),

    /**
     * @property {Boolean} isAnonymous
     */
    isAnonymous: Ember.computed.alias('session.isAnonymous'),

    /**
     * @property {Boolean} isRemixableContent
     */
    isRemixableContent: false,

    isNotShowListAttempt: false,
    /**
     * @property {Boolean} isExternalContent
     */
    isExternalContent: Ember.computed('previewContentType', function() {
      const component = this;
      let previewContentType = component.get('previewContentType');
      return previewContentType.includes('external');
    }),
    isInstructionalCoache: Ember.computed(function() {
      return this.instructionalCoache();
    }),

    userId: Ember.computed(function() {
      return this.get('session.userId');
    }),

    contentId: Ember.computed.alias('previewContentId'),

    isReportView: false,

    isAssessment: Ember.computed('previewContentType', function() {
      const component = this;
      return component
        .get('previewContentType')
        .includes(CONTENT_TYPES.ASSESSMENT);
    }),

    isCollection: Ember.computed('previewContentType', function() {
      const component = this;
      return component
        .get('previewContentType')
        .includes(CONTENT_TYPES.COLLECTION);
    }),

    isShowReportCorrectAnswer: Ember.computed(
      'previewContentType',
      'previewContent',
      function() {
        const component = this;
        const previewContent = component.get('previewContent');
        return (
          (previewContent.get('showFeedback') &&
            previewContent.get('showFeedback') !==
              ASSESSMENT_SHOW_VALUES.NEVER) ||
          component.get('isTeacher')
        );
      }
    ),

    activityPerformance: null,

    /**
     * @property {Boolean} allowAssessmentTemplateToDownload
     */
    allowAssessmentTemplateToDownload: Ember.computed(function() {
      let tenantSetting = this.get('tenantService').getStoredTenantSetting();
      let parsedTenantSettings = JSON.parse(tenantSetting);
      return (
        parsedTenantSettings &&
        parsedTenantSettings.show_assessment_template_download &&
        parsedTenantSettings.show_assessment_template_download === 'on'
      );
    }),
    isShowdownloadSubmission: Ember.computed(
      'activityPerformance.resourceResults',
      function() {
        const component = this;
        let uploadData = [];
        if (component.get('activityPerformance.resourceResults')) {
          this.get('activityPerformance.resourceResults').forEach(
            (evidenceData, index) => {
              if (evidenceData.evidence) {
                evidenceData.evidence.map(item => {
                  item.sequenceCode = index + 1;
                  uploadData.push(item);
                  component.set('submissionData', uploadData);
                });
              }
            }
          );
        }
        if (component.get('submissionData')) {
          return !!(
            component.get('submissionData') &&
            component.get('submissionData').length
          );
        }
      }
    ),
    titleName: Ember.computed('domainName', 'previewContent', function() {
      if (this.get('domainName')) {
        if (this.get('previewContent')) {
          const compCode = this.get('previewContent.title').split(' ')[1];
          return `${this.get('domainName.title')} ${compCode} `;
        }
      } else {
        return this.get('previewContent.title');
      }
    }),

    isCompetencyReport: false,

    isDiagnosticReport: false,

    reportActivityIds: Ember.A([]),

    diagnosticTimespent: 0,

    classFramework: Ember.computed('primaryClass', function() {
      return this.get('primaryClass.preference')
        ? this.get('primaryClass.preference.framework')
        : null;
    }),

    //--------------------------------------------------------------------------
    // Methods

    loadSuggestionContent() {
      const component = this;
      component.set('isLoading', true);
      let contentPromise = null;
      let activeAttempt = component.get('activeAttempt');
      const previewContentType = component.get('previewContentType');
      if (previewContentType === 'assessment') {
        contentPromise = component.fetchAssessmentForSuggestion();
      } else if (previewContentType === 'collection') {
        contentPromise = component.fetchCollectionForSuggestion();
      }
      contentPromise.then(() => {
        const activityPerformance = component.get('activityPerformance');
        if (activityPerformance) {
          activeAttempt.set('score', activityPerformance.get('score'));
          activeAttempt.set('timespent', activityPerformance.get('timeSpent'));
          component.parseActivityPerformance();
        } else {
          component.set('isLoading', false);
        }
      });
    },

    loadPortfolioContent() {
      const component = this;
      //Method implemented in mixin
      component.set('isLoading', true);
      component.loadActivityAttempts().then(function(activityAttempts) {
        if (activityAttempts.length) {
          let activeAttempt = component.get('activeAttempt')
            ? component.get('activeAttempt')
            : activityAttempts.objectAt(0);
          if (component.get('isCompetencyReport')) {
            activeAttempt = activityAttempts.reduce((a, b) =>
              a.score < b.score ? b : a
            );
            component.set('activeAttempt', activeAttempt);
          }
          component.loadActivityPerformance(activeAttempt).then(function() {
            component.parseActivityPerformance();
            if (component.get('activityPerformance.resourceResults.length')) {
              component.set(
                'repostReadContent',
                component.get('activityPerformance.resourceResults')
              );
              const evidenceData = component
                .get('activityPerformance.resourceResults')
                .map(result => {
                  return result.isGraded === false;
                });
              component.set('isGraded', evidenceData.contains(true));
            }

            component.set('isFadeContent', true);
            component.loadFadeContent(component.get('previewContent'));
            component.set('isLoading', false);
          });
        }
        component.set('isLoading', false);
      });
    },

    loadPreviewContent() {
      const component = this;
      component.set('isLoading', true);
      const isDiagnosticReport = component.get('isDiagnosticReport');
      let previewContentType = component.get('previewContentType');
      let previewContentPromise = null;
      if (previewContentType === 'assessment') {
        previewContentPromise = isDiagnosticReport
          ? component.fetchDiagnosticAssessment()
          : component.fetchAssessment();
      } else if (previewContentType === 'collection') {
        previewContentPromise = component.fetchCollection();
      } else if (previewContentType === 'assessment-external') {
        previewContentPromise = component.fetchExternalAssessment();
      } else if (previewContentType === 'collection-external') {
        previewContentPromise = component.fetchExternalCollection();
      }
      if (component.get('isReportView')) {
        previewContentPromise.then(function() {
          if (component.get('isSuggestionReport')) {
            component.loadSuggestionContent();
          } else {
            component.loadPortfolioContent();
          }
        });
      } else {
        if (!component.isDestroyed) {
          component.set('isLoading', false);
        }
      }
    },

    /**
     * @function fetchAssessment
     * Method to fetch assessment
     */
    fetchAssessment() {
      const component = this;
      const assessmentId = component.get('previewContentId');
      const assessmentService = component.get('assessmentService');
      const classFramework = component.get('classFramework');
      const isDefaultShowFW = component.get('isDefaultShowFW');
      return Ember.RSVP.hash({
        assessment: assessmentService.readAssessment(
          assessmentId,
          classFramework,
          isDefaultShowFW
        )
      }).then(({ assessment }) => {
        if (!component.isDestroyed) {
          component.loadFadeContent(assessment);
        }
        return assessment;
      });
    },

    /**
     * @function fetchAssessment
     * Method to fetch assessment
     */
    fetchDiagnosticAssessment() {
      const component = this;
      const assessmentIds = component.get('reportActivityIds');
      const assessmentService = component.get('assessmentService');
      const assessmentPromise = {};
      const classFramework = component.get('classFramework');
      const isDefaultShowFW = component.get('isDefaultShowFW');
      assessmentIds.forEach(id => {
        assessmentPromise[id] = assessmentService.readAssessment(
          id,
          classFramework,
          isDefaultShowFW
        );
      });
      return Ember.RSVP.hash(assessmentPromise).then(hash => {
        let assessment = null;
        if (!component.isDestroyed) {
          assessmentIds.forEach(id => {
            if (!assessment) {
              assessment = hash[id];
            } else {
              assessment.children = assessment.children.concat(
                hash[id].children
              );
            }
          });
          component.loadFadeContent(assessment);
        }
        return assessment;
      });
    },

    fetchAssessmentForSuggestion() {
      const component = this;
      const suggestedContext = component.get('suggestedActivityContext');
      const collectionId = component.get('previewContentId');
      const collectionType = component.get('previewContentType');
      const sessionId = suggestedContext.get('performance.sessionId');
      const classId = suggestedContext.get('classId');
      const userId = component.get('userId');
      let assessmentPromise;
      const suggestionArea = suggestedContext.get('suggestionArea');
      if (suggestionArea === 'class-activity') {
        assessmentPromise = component
          .get('analyticsService')
          .getDCAPerformanceBySessionId(
            userId,
            classId,
            collectionId,
            collectionType,
            sessionId
          );
      } else {
        assessmentPromise = component
          .get('performanceService')
          .findAssessmentResultByCollectionAndStudent({
            userId,
            collectionId,
            collectionType,
            sessionId
          });
      }
      return assessmentPromise.then(assessment => {
        if (!component.isDestroyed) {
          component.set('activityPerformance', assessment);
        }
        return assessment;
      });
    },

    fetchCollectionForSuggestion() {
      const component = this;
      const suggestedContext = component.get('suggestedActivityContext');
      const collectionId = component.get('previewContentId');
      const collectionType = component.get('previewContentType');
      const sessionId = suggestedContext.get('performance.sessionId');
      const pathId = suggestedContext.get('performance.pathId');
      const classId = suggestedContext.get('classId');
      const userId = component.get('userId');
      let collectionPromise;
      const suggestionArea = suggestedContext.get('suggestionArea');
      if (suggestionArea === 'class-activity') {
        collectionPromise = component
          .get('analyticsService')
          .findResourcesByCollectionforDCA(
            sessionId,
            collectionId,
            classId,
            userId,
            collectionType,
            null,
            pathId
          );
      } else {
        collectionPromise = component
          .get('performanceService')
          .findAssessmentResultByCollectionAndStudent({
            classId,
            userId,
            collectionId,
            collectionType,
            pathId
          });
      }
      return collectionPromise.then(collection => {
        if (!component.isDestroyed) {
          component.set('activityPerformance', collection);
        }
        return collection;
      });
    },

    /**
     * @function fetchCollection
     * Method to fetch collection
     */
    fetchCollection() {
      const component = this;
      const collectionId = component.get('previewContentId');
      const collectionService = component.get('collectionService');
      const classFramework = component.get('classFramework');
      const isDefaultShowFW = component.get('isDefaultShowFW');
      return Ember.RSVP.hash({
        collection: collectionService.readCollection(
          collectionId,
          classFramework,
          isDefaultShowFW
        )
      }).then(({ collection }) => {
        if (!component.isDestroyed) {
          component.loadFadeContent(collection);
        }
        return collection;
      });
    },

    /**
     * @function fetchExternalAssessment
     * Method to fetch an external assessment
     */
    fetchExternalAssessment() {
      const component = this;
      const externalAssessmentId = component.get('previewContentId');
      const assessmentService = component.get('assessmentService');
      const classFramework = component.get('classFramework');
      const isDefaultShowFW = component.get('isDefaultShowFW');
      return Ember.RSVP.hash({
        externalAssessment: assessmentService.readExternalAssessment(
          externalAssessmentId,
          classFramework,
          isDefaultShowFW
        )
      }).then(({ externalAssessment }) => {
        if (!component.isDestroyed) {
          component.loadFadeContent(externalAssessment);
        }
        return externalAssessment;
      });
    },

    /**
     * @function fetchExternalCollection
     * Method to fetch an external collection
     */
    fetchExternalCollection() {
      const component = this;
      const externalCollectionId = component.get('previewContentId');
      const collectionService = component.get('collectionService');
      const classFramework = component.get('classFramework');
      const isDefaultShowFW = component.get('isDefaultShowFW');
      return Ember.RSVP.hash({
        externalCollection: collectionService.readExternalCollection(
          externalCollectionId,
          classFramework,
          isDefaultShowFW
        )
      }).then(({ externalCollection }) => {
        if (!component.isDestroyed) {
          component.loadFadeContent(externalCollection);
        }
        return externalCollection;
      });
    },

    /**
     * @function remixContent
     * Method to remix a collection/assessment
     */
    remixContent() {
      const component = this;
      if (component.get('isAnonymous')) {
        component.send('showModal', 'content.modals.gru-login-prompt');
      } else {
        let previewContent = component.get('previewContent');
        let previewContentType = component.get('previewContentType');
        let remixModel = Ember.Object.create({
          content: previewContent
        });
        component.send(
          'showModal',
          `content.modals.gru-${previewContentType}-remix`,
          remixModel
        );
      }
    },

    parseActivityPerformance() {
      const component = this;
      let activityResources = component.get('previewContent.children');
      let activityResourcesPerformance = component.get(
        'activityPerformance.resourceResults'
      );
      activityResourcesPerformance.map(resourcePerformance => {
        if (!component.isDestroyed) {
          let resource = activityResources.findBy(
            'id',
            resourcePerformance.get('resourceId')
          );
          const setPerformance = (resourceItem, resourcePerformanceItem) => {
            resourceItem.set(
              'userAnswer',
              resourcePerformanceItem.get('userAnswer')
            );
            resourceItem.set(
              'answerObject',
              resourcePerformanceItem.get('answerObject')
            );
            resourceItem.set(
              'reaction',
              resourcePerformanceItem.get('reaction')
            );
            resourceItem.set(
              'timespent',
              resourcePerformanceItem.get('timespent')
            );
            resourceItem.set('score', resourcePerformanceItem.get('score'));
            resourceItem.set(
              'answerStatus',
              resourcePerformanceItem.get('answerStatus')
            );
          };
          setPerformance(resource, resourcePerformance);
          if (resourcePerformance.subQuestions && resource.subQuestions) {
            resourcePerformance.subQuestions.forEach(subPerformance => {
              let subResource = resource.subQuestions.findBy(
                'id',
                subPerformance.get('resourceId')
              );
              if (subResource) {
                setPerformance(subResource, subPerformance);
              }
            });
          }
        }
      });
      component.set('isLoading', false);
    },

    /**
     * @function loadFadeContent
     * Method to load fade content
     */
    loadFadeContent(content) {
      let isFadeContent = this.get('isFadeContent');
      let repostReadContent = this.get('repostReadContent');
      let children = content.get('children');
      if (isFadeContent || this.get('isDiagnosticReport')) {
        children.map(resource => {
          resource.set('isFade', false);
          let readContent = repostReadContent.findBy('id', resource.get('id'));
          resource.set('isFade', !readContent);
          if (readContent && this.get('isDiagnosticReport')) {
            resource.set('answerObject', readContent.answerObject);
            resource.set('userAnswer', readContent.userAnswer);
            resource.set('timespent', readContent.timespent);
          }
          if (this.get('isDiagnosticReport')) {
            resource.set('isFade', false);
          }
          if (resource.subQuestions) {
            resource.subQuestions.forEach(subItem => {
              let subReadContent =
                readContent.subQuestions &&
                readContent.subQuestions.findBy('id', subItem.get('id'));
              if (subReadContent) {
                subItem.set('answerObject', subReadContent.answerObject);
                subItem.set('userAnswer', subReadContent.userAnswer);
                subItem.set('timespent', subReadContent.timespent);
                subItem.set('answered', true);
              }
              if (this.get('isDiagnosticReport')) {
                subItem.set('isFade', false);
              }
              subItem.set('resource', subItem);
            });
          }
        });

        this.set('previewContent', content);
      } else {
        this.set('previewContent', content);
      }
    }
  }
);
