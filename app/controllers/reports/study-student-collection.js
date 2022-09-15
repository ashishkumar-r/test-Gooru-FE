import Ember from 'ember';
import StudentCollection from 'gooru-web/controllers/reports/student-collection';
import {
  ASSESSMENT_SUB_TYPES,
  ROLES,
  CONTENT_TYPES,
  PLAYER_EVENT_MESSAGE,
  FEEDBACK_USER_CATEGORY,
  FEEDBACK_RATING_TYPE,
  PATH_TYPE,
  DEPENDENT_LESSON_SUGGESTION_EVENTS
} from 'gooru-web/config/config';
import { getDomainCode } from 'gooru-web/utils/taxonomy';
import StudyPlayer from 'gooru-web/mixins/study-player';
import ActivityFeedbackMixin from 'gooru-web/mixins/activity-feedback-mixin';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import { getObjectCopy } from 'gooru-web/utils/utils';

/**
 *
 * Controls the access to the analytics data for a
 * student related to a collection of resources
 *
 */

export default StudentCollection.extend(
  StudyPlayer,
  ActivityFeedbackMixin,
  TenantSettingsMixin,
  {
    // -------------------------------------------------------------------------
    // Dependencies
    /**
     * @property {CourseMapService}
     */
    courseMapService: Ember.inject.service('api-sdk/course-map'),

    /**
     * @property {NavigateMapService}
     */
    navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

    /**
     * @type {AttemptService} attemptService
     * @property {Ember.Service} Service to send attempt related events
     */
    quizzesAttemptService: Ember.inject.service('quizzes/attempt'),

    session: Ember.inject.service('session'),

    /**
     * @requires studyPlayerController
     */
    studyPlayerController: Ember.inject.controller('study-player'),

    /**
     * @type {ClassService} Service to retrieve class information
     */
    classService: Ember.inject.service('api-sdk/class'),

    /**
     * @dependency {i18nService} Service to retrieve translations information
     */
    i18n: Ember.inject.service(),

    // -------------------------------------------------------------------------
    // Actions

    actions: {
      /**
       * Action triggered for the next button
       */
      next: function(controller = this) {
        let suggestedContent = controller.get('suggestedContent');
        if (suggestedContent && this.get('isShowMasteryGreeting')) {
          controller.set('isShowActivityFeedback', false);
          controller.set('isShowSuggestion', true);
          controller.set('isShowMasteryGreeting', false);
        } else {
          if (this.get('isShowMasteryGreeting')) {
            this.getNextContent().then(() => {
              controller.checknPlayNext();
            });
          } else {
            controller.checknPlayNext();
            controller.set('isShowMasteryGreeting', false);
          }
        }
        controller.toggleScreenMode();
        // });
        // controller.checknPlayNext();
        // controller.toggleScreenMode();
        // controller.set('isShowMasteryGreeting', false);
      },

      /**
       * Action triggered for the next button
       */
      onFeedbackCapture() {
        const controller = this;
        const isShowMasteryGreeting = controller.get('isShowMasteryGreeting');
        const userFeedback = controller.get('userCategoryFeedback');
        if (isShowMasteryGreeting) {
          controller.send('onCloseMastery');
        } else {
          if (userFeedback && userFeedback.length) {
            let learningFeedback = controller.getFeedbackObject();
            controller
              .get('activityFeedbackService')
              .submitUserFeedback(learningFeedback)
              .then(() => {
                controller.send('next');
              });
          } else {
            controller.send('next');
          }
        }
      },

      // /**
      //  * Action triggered for the next button
      //  */
      // onShowMasteryOrNext() {
      //   const component = this;
      //   if (component.get('isLoadProficiencyProgress')) {
      //     component.set('isShowActivityFeedback', false);
      //     component.set('isShowMasteryGreeting', true);
      //   } else {
      //     component.send('next');
      //   }
      // },

      playSignatureAssessmentSuggestions: function() {
        this.playSuggestedContent(
          this.get('mapLocation.signatureAssessmentSuggestions')
        );
      },

      playSignatureCollectionSuggestions: function() {
        this.playSuggestedContent(
          this.get('mapLocation.signatureCollectionSuggestions')
        );
      },

      onRedirectToProfiencyProgress() {
        const controller = this;
        controller.showStudentProficiencyProgress();
        controller.set('isShowMasteryGreeting', false);
      },

      /**
       * Action triggered for the exit button
       */
      onExit(rouet, id) {
        const controller = this;
        let isIframeMode = controller.get('isIframeMode');
        if (isIframeMode) {
          window.parent.postMessage(PLAYER_EVENT_MESSAGE.GRU_PUllUP_CLOSE, '*');
        } else {
          controller.transitionToRoute(rouet, id);
        }
      },
      showTimer() {
        this.toggleProperty('isShowStudyTimer');
      },

      showFeedbackContainer() {
        this.toggleProperty('isShowFeedbackContainer');
      },

      onCloseSuggestion() {
        this.getNextContent().then(() => {
          this.set('isShowSuggestion', false);
        });
      },

      onContinueLessonSuggestion() {
        this.checknPlayNext();
      },

      onCloseMastery() {
        let controller = this;
        controller.getNextContent().then(() => {
          let suggestedContent = controller.get('suggestedContent');
          if (suggestedContent && this.get('isShowMasteryGreeting')) {
            controller.set('isShowActivityFeedback', false);
            controller.set('isShowSuggestion', true);
            controller.set('isShowMasteryGreeting', false);
          } else {
            controller.set('isShowMasteryGreeting', false);
          }
          controller.toggleScreenMode();
        });
      }
    },

    // -------------------------------------------------------------------------
    // Properties

    /**
     * @property {Course} course
     */
    course: null,

    /**
     * @property {Unit} unit
     */
    unit: null,

    /**
     * @property {Lesson} lesson
     */
    lesson: null,

    /**
     * @property {Collection} collection
     */
    collection: null,

    /**
     *signatureAssessmentType suggestion
     * @property {String} signatureAssessmentType
     */
    signatureAssessmentType: ASSESSMENT_SUB_TYPES.SIGNATURE_ASSESSMENT,

    /**
     *signatureCollectionType suggestion
     * @property {String} signatureCollectionType
     */
    signatureCollectionType: ASSESSMENT_SUB_TYPES.SIGNATURE_COLLECTION,

    /**
     * Indicate if show pre test suggestion
     * @property {Boolean} showSuggestion
     */
    showSuggestion: true,

    /**
     * Current map location
     * @property {MapSuggestions}
     */
    mapLocation: null,

    /**
     * Current class  assessment minScore
     * @property {integer}
     */
    minScore: null,

    isPlayedDependentLesson: false,

    /**
     * @property {boolean}
     */
    hasSignatureCollectionSuggestions: Ember.computed.alias(
      'mapLocation.hasSignatureCollectionSuggestions'
    ),

    /**
     * @property {boolean}
     */
    hasSignatureAssessmentSuggestions: Ember.computed.alias(
      'mapLocation.hasSignatureAssessmentSuggestions'
    ),

    /**
     * @property {boolean}
     */
    isDone: Ember.computed('mapLocation.context.status', function() {
      return (
        (this.get('mapLocation.context.status') || '').toLowerCase() === 'done'
      );
    }),

    isDependentLessonSuggestion: Ember.computed(
      'mapLocation.context.status',
      function() {
        return (
          (this.get('mapLocation.context.status') || '').toLowerCase() ===
            'dep-lesson-suggestion-served' &&
          !this.get('isPlayedDependentLesson')
        );
      }
    ),

    nextContentType: Ember.computed('mapLocation.context', function() {
      let context = this.get('mapLocation.context') || {};
      return context.itemType || '';
    }),

    /**
     * @property {pathType}
     */
    pathType: null,

    /**
     * @property {Boolean}
     * Is suggested content
     */
    isSuggestedContent: Ember.computed('mapLocation.context', function() {
      let component = this;
      let pathType = component.get('mapLocation.context.pathType');
      return pathType === 'teacher' || pathType === 'system';
    }),

    /**
     * @property {boolean}
     */
    hasAnySuggestion: Ember.computed(
      'hasSignatureAssessmentSuggestions',
      'hasSignatureCollectionSuggestions',
      'showSuggestion',
      function() {
        return (
          (this.get('hasSignatureCollectionSuggestions') ||
            this.get('hasSignatureAssessmentSuggestions')) &&
          this.get('showSuggestion')
        );
      }
    ),

    /**
     * confettiTruth  for all statisfactions
     * @property {boolean} source
     */
    enableConfetti: false,

    /**
     * Report Source Type
     * @property {String}
     */
    source: null,

    /**
     * @property {Json}
     * Computed property to store suggestedContent
     */
    suggestedContent: Ember.computed('mapLocation.suggestions', function() {
      let controller = this;
      let suggestions = controller.get('mapLocation.suggestions');
      return suggestions ? suggestions[0] : null;
    }),

    nextContentDetails: Ember.computed('nextContent', function() {
      let nextContent = this.get('nextContent') || {};
      if (nextContent && Object.keys(nextContent).length) {
        const basePath = this.get('session.cdnUrls.content');
        let thumbnail = nextContent.thumbnail
          ? basePath + nextContent.thumbnail
          : null;
        nextContent.thumbnail = thumbnail;
      }
      return nextContent && Object.keys(nextContent).length
        ? nextContent
        : null;
    }),

    /**
     * @property {Boolean} isFullScreen
     */
    isFullScreen: Ember.computed(function() {
      let controller = this;
      let studyPlayerController = controller.get('studyPlayerController');
      let isFullScreen = studyPlayerController.get('isFullScreen');
      return isFullScreen;
    }),

    /**
     * @property {Boolean} isPremiumCourse
     */
    isPremiumCourse: Ember.computed('course', function() {
      const controller = this;
      return controller.get('course.version') === 'premium';
    }),

    /**
     * @property {Boolean} isLoadProficiencyProgress
     */
    isLoadProficiencyProgress: Ember.computed(
      'attemptData.averageScore',
      'collectionObj',
      'isPremiumCourse',
      'mapLocation.context',
      'isAssessmentHasFRQ',
      'masteryMinScore',
      function() {
        const controller = this;
        const averageScore = controller.get('attemptData.averageScore');
        const isPremiumCourse = controller.get('isPremiumCourse');
        const context = controller.get('mapLocation.context');
        const isAssessmentHasFRQ = controller.get('isAssessmentHasFRQ');
        const collectionObj = controller.get('collectionObj');
        const isTeaherSuggestion = context.get('pathType') === 'teacher';
        const isSignatureAssessment =
          context.get('itemSubType') === 'signature-assessment';
        return (
          isPremiumCourse &&
          context &&
          context.get('itemType') === CONTENT_TYPES.ASSESSMENT &&
          collectionObj.get('gutCodes.length') &&
          !isAssessmentHasFRQ &&
          !isTeaherSuggestion &&
          !isSignatureAssessment &&
          averageScore >= controller.get('masteryMinScore')
        );
      }
    ),

    /**
     * @property {Boolean} isAssessmentHasFRQ
     * Property to evaluate whether the completed collection has FR Question
     */
    isAssessmentHasFRQ: Ember.computed('collectionObj', function() {
      const controller = this;
      const questions = controller.get('collectionObj.children');
      const frQuesitons = questions.filter(question =>
        question.get('isOpenEnded')
      );
      return !!frQuesitons.length;
    }),

    /**
     * @property {Boolean} isShowActivityFeedback
     * Property to evaluate whether the feedback tab should shown
     */
    isShowActivityFeedback: false,

    /**
     * @property {array[]} feedbackCategory
     * store feedback category list
     */
    feedbackCategory: null,

    /**
     * @property {boolean} isShowFeedback
     * Property to show/hide feedback component
     */
    isShowFeedback: false,

    /**
     * @property {Boolean}
     */
    isPublicClass: Ember.computed.alias('currentClass.isPublic'),

    isCollection: Ember.computed('collection', function() {
      return this.get('collection.isCollection');
    }),
    /**
     * @property {boolean} isShowStudyTimer
     * Property to show/hide study timer component
     */
    isShowStudyTimer: true,

    taxonomyTags: Ember.computed('nextContent', function() {
      let taxonomyItems = this.get('nextContent.taxonomy') || {};
      let standards = Ember.A();
      for (let code of Object.keys(taxonomyItems)) {
        let competency = taxonomyItems[code];
        competency.id = code;
        standards.pushObject(Ember.Object.create(competency));
      }
      return TaxonomyTag.getTaxonomyTags(standards);
    }),

    milestones: Ember.A(),

    route0Milestone: Ember.A(),

    milestoneTitle: Ember.computed('mapLocation.context', function() {
      let context = this.get('mapLocation.context');
      let milestones = this.get('milestones');
      let milestoneIndex = null;
      if (context.milestoneId) {
        milestoneIndex =
          milestones.findIndex(
            item => item.milestone_id === context.milestoneId
          ) + 1;
      }

      return context.milestoneId && context.pathType !== PATH_TYPE.UNIT0
        ? `${this.get('i18n').t('common.milestone').string} ${milestoneIndex}`
        : this.get('unit.title');
    }),

    isStartNewLesson: Ember.computed('mapLocation.context', function() {
      let context = this.get('mapLocation.context');
      return context.lessonId !== this.get('lesson.id');
    }),

    userLocation: null,

    isSuggestionReport: false,

    isLoading: false,

    // -------------------------------------------------------------------------
    // Methods
    init() {
      this.set('bgUrl', this.tenantSettingBgCheck());
    },
    initializer() {
      let controller = this;
      controller.set(
        'isShowMasteryGreeting',
        Ember.computed('isLoadProficiencyProgress', function() {
          return this.get('isLoadProficiencyProgress');
        })
      );

      controller.set(
        'isShowSuggestion',
        Ember.computed('suggestedContent', function() {
          return this.get('isLoadProficiencyProgress')
            ? false
            : !!this.get('suggestedContent');
        })
      );

      if (controller.get('isLoadProficiencyProgress')) {
        controller.set('isShowMasteryGreeting', true);
      } else {
        controller.getNextContent();
      }
    },

    /**
     * Get next content data
     */
    getNextContent() {
      const controller = this;
      controller.set('isLoading', true);
      let contextId = controller.get('contextId');
      let profileId = controller.get('session.userData.gooruUId');
      const navigateMapService = controller.get('navigateMapService');
      return controller
        .get('quizzesAttemptService')
        .getAttemptIds(contextId, profileId)
        .then(attemptIds =>
          !attemptIds || !attemptIds.length
            ? {}
            : controller
              .get('quizzesAttemptService')
              .getAttemptData(attemptIds[attemptIds.length - 1])
        )
        .then(attemptData =>
          Ember.RSVP.hash({
            attemptData,
            mapLocationNxt: navigateMapService.getStoredNext()
          })
        )
        .then(({ mapLocationNxt, attemptData }) => {
          if (controller.get('hasSuggestion')) {
            mapLocationNxt.context.set('status', 'content-served');
          }
          if (mapLocationNxt.context.pathType === 'system') {
            controller.set('isSuggestionReport', true);
          }
          controller.set(
            'isPlayedDependentLesson',
            (mapLocationNxt.context.status || '').toLowerCase() ===
              DEPENDENT_LESSON_SUGGESTION_EVENTS.served
          );
          mapLocationNxt.context.set('score', attemptData.get('averageScore'));
          if (mapLocationNxt.context.itemType === 'assessment') {
            mapLocationNxt.context.set('item', {
              id: mapLocationNxt.context.itemId,
              format: mapLocationNxt.context.itemType,
              resourceResults: attemptData.resourceResults
            });
          }
          return navigateMapService.next(mapLocationNxt.context);
        })
        .then(({ context, suggestions, hasContent, content }) => {
          controller.set('nextContent', content);
          controller.set('mapLocation.context', context);
          controller.set('mapLocation.suggestions', suggestions);
          controller.set('mapLocation.hasContent', hasContent);
          controller.set('userLocation', getObjectCopy(context));
          controller.set('isLoading', false);
        });
    },

    /**
     * Confetti Initialize once Component Initialize
     */
    confettiSetup() {
      let controller = this;
      let averageScore = controller.get('attemptData.averageScore');
      let minScore = controller.get('minScore');
      let masteryMinScore = controller.get('masteryMinScore');
      let role = controller.get('role');
      let type = controller.get('type');
      if (role === ROLES.STUDENT && type === CONTENT_TYPES.ASSESSMENT) {
        if (
          (minScore && minScore <= averageScore) ||
          averageScore >= masteryMinScore
        ) {
          Ember.run.later(function() {
            controller.set('enableConfetti', false);
          }, 5400);
          controller.set('enableConfetti', true);
        }
      }
      Ember.run.later(function() {
        controller.showFeedback();
      }, 5000);
    },

    /**
     * Show feedback tab initialize once Component Initialize
     */
    showFeedback() {
      const controller = this;
      let isCollection = controller.get('collection.isCollection');
      let categoryLists = controller.get('categoryLists');
      let type = isCollection
        ? CONTENT_TYPES.COLLECTION
        : CONTENT_TYPES.ASSESSMENT;
      let contentCategory = categoryLists.get(`${type}s`);
      if (contentCategory && contentCategory.length) {
        controller.set('isShowActivityFeedback', true);
        controller.set(
          'feedbackCategory',
          contentCategory.sortBy('feedbackTypeId')
        );
        controller.set('format', type);
      } else {
        controller.set('isShowActivityFeedback', false);
        controller.set('feedbackCategory', null);
      }
    },

    /**
     * Resets to default values
     */
    resetValues: function() {
      this.setProperties({
        courseId: null,
        userId: null,
        role: null,
        contextId: null,
        source: null,
        classId: '',
        unitId: null,
        milestoneId: null,
        lessonId: null,
        collectionId: null,
        type: null,
        mapLocation: null
      });
    },

    /**
     * @function toggleScreenMode
     * Method to toggle screen mode
     */
    toggleScreenMode() {
      let controller = this;
      let studyPlayerController = controller.get('studyPlayerController');
      studyPlayerController.toggleScreenMode();
    },

    /**
     * @function showStudentProficiencyProgress
     * Method to redirect the student into the proficiency progress page whenever they acquired 80% or more
     */
    showStudentProficiencyProgress() {
      const controller = this;
      const contextId = controller.get('contextId');
      const profileId = controller.get('session.userData.gooruUId');
      const context = this.get('mapLocation.context');

      let queryParams = {
        classId: context.get('classId'),
        courseId: context.get('courseId'),
        contextId,
        role: ROLES.STUDENT,
        source: controller.get('source'),
        assessmentId: controller.get('collection.id'),
        collectionId: controller.get('collection.id'),
        milestoneId: context.get('milestoneId'),
        unitId: context.get('unitId'),
        lessonId: context.get('lessonId'),
        pathId: context.get('pathId') || 0,
        pathType: context.get('pathType') || null,
        isIframeMode: controller.get('isIframeMode')
      };

      controller.updateStudentMasteredCompetencies();
      controller.transitionToRoute('student-learner-proficiency', profileId, {
        queryParams
      });
    },

    /**
     * @function updateStudentMasteredCompetencies
     * Method to update the mastered competency into local storage to populate learner profile at FE
     */
    updateStudentMasteredCompetencies() {
      const controller = this;
      const localStorage = controller
        .get('navigateMapService')
        .getLocalStorage();
      const storageKey = controller
        .get('navigateMapService')
        .getMasteredCompetenciesKey();
      let storedCompetencies = localStorage.getItem(storageKey);
      let studentMasteredCompetencies = storedCompetencies
        ? JSON.parse(storedCompetencies)
        : Ember.A([]);
      let masteredCompetencies = controller.get('collectionObj.gutCodes');
      masteredCompetencies.map(competencyCode => {
        if (
          !studentMasteredCompetencies.findBy('competencyCode', competencyCode)
        ) {
          let domainCode = getDomainCode(competencyCode);
          studentMasteredCompetencies.push({
            domainCode,
            competencyCode
          });
        }
      });
      studentMasteredCompetencies.filter(competency => {
        competency.isHighLight = false;
      });
      let lastMasteredCompetency = studentMasteredCompetencies.objectAt(
        studentMasteredCompetencies.length - 1
      );
      lastMasteredCompetency.isHighLight = true;
      localStorage.setItem(
        storageKey,
        JSON.stringify(studentMasteredCompetencies)
      );
    },

    /**
     * @function getFeedbackObject
     * Method to return feedback objective
     */

    getFeedbackObject() {
      const controller = this;
      let userId = controller.get('session.userId');
      let role = controller.get('session.role')
        ? controller.get('session.role')
        : ROLES.STUDENT;
      let userCategoryId = FEEDBACK_USER_CATEGORY[`${role}`];
      let userFeedback = Ember.A([]);
      let categoryLists = controller.get('userCategoryFeedback');
      let collection = controller.get('collection');
      categoryLists.map(category => {
        let feedbackObj = {
          feeback_category_id: category.categoryId
        };
        if (category.feedbackTypeId === FEEDBACK_RATING_TYPE.QUANTITATIVE) {
          feedbackObj.user_feedback_quantitative = category.rating;
        } else if (category.feedbackTypeId === FEEDBACK_RATING_TYPE.BOTH) {
          feedbackObj.user_feedback_qualitative = category.comments;
        } else if (
          category.feedbackTypeId === FEEDBACK_RATING_TYPE.QUALITATIVE
        ) {
          feedbackObj.user_feedback_qualitative = category.quality;
        }
        userFeedback.pushObject(feedbackObj);
      });
      let userFeedbackObj = {
        content_id: collection.get('id'),
        content_type: collection.get('isCollection')
          ? CONTENT_TYPES.COLLECTION
          : CONTENT_TYPES.ASSESSMENT,
        user_category_id: userCategoryId,
        user_feedbacks: userFeedback,
        user_id: userId
      };
      return userFeedbackObj;
    }
  }
);
