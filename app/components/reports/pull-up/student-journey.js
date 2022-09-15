import Ember from 'ember';
import {
  PLAYER_EVENT_SOURCE,
  COMPETENCY_MASTERY_SOURCE,
  MASTERY_COMPETENCY_SOURCE
} from 'gooru-web/config/config';
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['student-journey'],

  // -------------------------------------------------------------------------
  // Dependencies

  session: Ember.inject.service('session'),

  i18n: Ember.inject.service(),

  /**
   * @requires {AssessmentService} Service to retrieve an assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @requires {CollectionService} Service to retrieve a collection
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @requires service:api-sdk/class-activity
   */
  oaService: Ember.inject.service('api-sdk/offline-activity/offline-activity'),

  /**
   * @requires {profileService} Service to retrieve a profile
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @property {collection}
   */
  collection: null,

  /**
   * @property {isShowPullUp}
   */
  isShowPullUp: false,

  /**
   * @property {studentCollectionReport}
   */
  studentCollectionReport: null,

  userProfiles: Ember.A(),

  isDataLake: false,

  sourseMsg: null,
  /**
   * @property {DAILY_CLASS}
   */
  DAILY_CLASS: PLAYER_EVENT_SOURCE.DAILY_CLASS,

  /**
   * @property {String | NULL} isShowCompetencySourceMsg
   * Property to get appropriate mastery source message based on value
   */
  isShowCompetencySourceMsg: Ember.computed('competency', function() {
    const component = this;
    const source = component.get('competency.source');
    let sourceLabel = null;
    if (source) {
      let sourceDiagnostic = source.includes('diagnostic', 0);
      let sourceSkyline = source.includes('initialSkylineGenerated', 0);
      let lpcsMigration = source.includes('lpcs-migration', 0);
      let nwea = source.includes('nwea', 0);
      let datalake = source.includes('Datalake', 0);
      component.set('isDataLake', datalake);
      let sourseLength = [];
      if (datalake) {
        sourseLength = source.split(':');
      }
      let dataLaketoolDiagnostic = source.includes('diagnostic', 3);
      let dataLakeDiagnostic = source.includes('diagnostic', 2);
      let sourceKey = null;
      if (
        (sourceDiagnostic && source.indexOf('ActivityStream') !== 0) ||
        sourceSkyline
      ) {
        sourceKey = 'diagnostic';
      } else if (lpcsMigration) {
        sourceKey = 'lpcsMigration';
      } else if (nwea) {
        sourceKey = 'nwea';
      } else if (datalake && sourseLength.length === 3 && !dataLakeDiagnostic) {
        sourceKey = 'dataLakeTools';
        component.set('sourseMsg', sourseLength[2]);
      } else if (
        (datalake && dataLaketoolDiagnostic && sourseLength.length === 4) ||
        (datalake && sourseLength.length === 3 && dataLakeDiagnostic)
      ) {
        sourceKey = 'dataLakeToolDiagnostic';
        if (sourseLength.length === 4) {
          component.set('sourseMsg', sourseLength[2]);
        }
      } else if (datalake && sourseLength.length === 2) {
        sourceKey = 'dataLake';
      } else {
        sourceKey = source.split(':')[0];
      }
      sourceLabel = MASTERY_COMPETENCY_SOURCE[sourceKey];
    }
    return sourceLabel;
  }),

  /**
   * @property {String | NULL} masterySourceLabel
   * Property to get appropriate mastery source label based on value
   */
  masterySourceLabel: Ember.computed('competency', function() {
    const component = this;
    component.fetchProfile();
    const masterySource = component.get('competency.source');
    const sourceConfigs = COMPETENCY_MASTERY_SOURCE;
    const i18n = component.get('i18n');
    let sourceLabel = null;
    if (masterySource) {
      let sourceConfigObj = sourceConfigs.find(sourceConfig =>
        masterySource.includes(sourceConfig.source)
      );
      if (sourceConfigObj) {
        sourceLabel = i18n.t(`${sourceConfigObj.locale}`);
      }
    }
    return sourceLabel;
  }),

  /**
   * @property {Boolean} isNotStartedCompetency
   * Property to check whether it's a not started competency
   */
  isNotStartedCompetency: Ember.computed.equal('competency.status', 0),

  /**
   * @property {Boolean} isInferredCompetency
   * Property to check whether it's a inferred competency
   */
  isInferredCompetency: Ember.computed('competency', function() {
    return (
      this.get('competency.status') > 1 && this.get('competency.status') < 4
    );
  }),

  diagnosticContent: null,

  diagnosticList: null,

  domainDiagnosticList: null,

  /**
   * @function getStundentCollectionReport
   * Method to get student collection report
   */
  getStundentCollectionReport(activity) {
    let component = this;
    let collectionPromise;
    let contentType = activity.get('collectionType');
    if (contentType === 'collection') {
      collectionPromise = component
        .get('collectionService')
        .readCollection(activity.get('id'));
    } else if (contentType === 'assessment') {
      collectionPromise = component
        .get('assessmentService')
        .readAssessment(activity.get('id'));
    } else if (contentType === 'assessment-external') {
      collectionPromise = component
        .get('assessmentService')
        .readExternalAssessment(activity.get('id'));
    } else if (contentType === 'offline-activity') {
      collectionPromise = component
        .get('oaService')
        .readActivity(activity.get('id'));
    } else {
      collectionPromise = component
        .get('collectionService')
        .readExternalCollection(activity.get('id'));
    }
    return Ember.RSVP.hash({
      collection: collectionPromise
    }).then(({ collection }) => {
      component.set('collection', collection);
      collection.set(
        'performance',
        Ember.Object.create({
          score: activity.score
        })
      );
      component.openStudentCollectionReport(activity, collection, contentType);
    });
  },

  fetchProfile() {
    const controller = this;
    let competency = controller.get('competency');
    if (competency && competency.source) {
      const sourceIndex = competency.source.split(':');

      if (
        competency.source.indexOf('ActivityStream') === 0 &&
        competency.source.split(':').splice(-1)[0] === 'diagnostic'
      ) {
        controller.set('diagnostic', true);
      } else if (
        competency.source.indexOf('ActivityStream') === 0 &&
        competency.source.split(':').splice(-1)[0] !== 'diagnostic' &&
        sourceIndex[2]
      ) {
        controller.set('masteryTools', true);
        let masteryValue = competency.source.split(':').splice(-1)[0];
        controller.set('masteryValue', masteryValue);
      } else if (
        competency.source.indexOf('ActivityStream') === 0 &&
        competency.source.split(':').splice(-1)[0] !== 'diagnostic' &&
        sourceIndex[2] === undefined
      ) {
        controller.set('mastery', true);
      }
    }
    const userId = controller.get('isStudent')
      ? controller.get('session.userId')
      : controller.get('userId');
    controller
      .get('profileService')
      .consolidateProfile(userId)
      .then(consolidateDetails => {
        let userDetails = Ember.A();
        if (consolidateDetails && consolidateDetails.length) {
          let currentUserDatas = consolidateDetails.filter(
            profile => profile.status === 'complete'
          );
          if (currentUserDatas && currentUserDatas.length) {
            controller.set('userProfiles', currentUserDatas);
          } else {
            userDetails.push(
              Ember.Object.create({
                id: controller.get('userId')
              })
            );

            controller.set('userProfiles', userDetails);
          }
        } else {
          userDetails.push(
            Ember.Object.create({
              id: controller.get('userId')
            })
          );
          controller.set('userProfiles', userDetails);
        }
      });
  },

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when the user close the pull up.
     **/
    onClosePullUp() {
      let component = this;
      component.set('isShowPullUp', false);
    },

    /**
     * Action triggered when the user open student Report.
     **/
    onOpenCollectionReport(activity) {
      let component = this;
      component.getStundentCollectionReport(activity);
    },

    onDomainDiagnostic(diagnosticContent) {
      this.set('diagnosticContent', diagnosticContent.get(0));
    },

    onPortfolioContents(portfolioContents) {
      portfolioContents.forEach(function(competency) {
        if (competency && competency.contentSource) {
          const sourceIndex = competency.contentSource.split(':');
          if (
            (competency.contentSource.indexOf('ActivityStream') === 0 &&
              competency.contentSource.split(':').splice(-1)[0] ===
                'diagnostic') ||
            competency.contentSource.includes('diagnostic')
          ) {
            competency.set('diagnostic', true);
          }

          if (
            competency.contentSource.indexOf('ActivityStream') === 0 &&
            competency.contentSource.split(':').splice(-1)[0] !==
              'diagnostic' &&
            sourceIndex[2]
          ) {
            competency.set('masteryTools', true);
            let masteryValue = competency.contentSource
              .split(':')
              .splice(-1)[0];
            competency.set('masteryValue', masteryValue);
          }

          if (
            competency.contentSource.indexOf('ActivityStream') === 0 &&
            competency.contentSource.split(':').splice(-1)[0] !==
              'diagnostic' &&
            sourceIndex[2] === undefined
          ) {
            competency.set('mastery', true);
          }
        }
      });
      this.set('portfolioContentsList', portfolioContents);
    },

    onDiagnosticList(diagnostic) {
      this.set('diagnosticList', diagnostic);
    },

    onDomainDiagnosticList(diagnostic) {
      this.set('domainDiagnosticList', diagnostic);
    },

    //Action triggered when click collection/assessment title
    onPreviewContent(collection) {
      const component = this;
      let previewPlayerContext = Ember.Object.create({
        classId: collection.get('classId'),
        courseId: collection.get('courseId'),
        unitId: collection.get('unitId'),
        lessonId: collection.get('lessonId')
      });
      component.set('previewPlayerContext', previewPlayerContext);
      component.set('previewContent', collection);
      component.set('previewContentType', collection.get('collectionType'));
      if (component.get('previewContentType') === 'offline-activity') {
        component.set('isShowContentPreview', false);
        component.set('isShowOfflineActivityPreview', true);
      } else {
        component.set('isShowContentPreview', true);
        component.set('isShowOfflineActivityPreview', false);
      }
    },
    openPortfolioContainer(index) {
      if (event.type === 'keypress') {
        if (
          $(`.portfolio-contents-container #profile-${index}`).hasClass('in')
        ) {
          $(`.portfolio-contents-container #profile-${index}`).removeClass(
            'in'
          );
        } else {
          $(`.portfolio-contents-container #profile-${index}`).addClass('in');
          $(`.portfolio-contents-container #profile-${index}`).css(
            'height',
            'auto'
          );
        }
      }
    }
  },

  /**
   * @function openStudentCollectionReport
   * Method to open student collection report
   */
  openStudentCollectionReport(activity, collection, collectionType) {
    let component = this;
    if (activity.get('contentSource') === PLAYER_EVENT_SOURCE.DAILY_CLASS) {
      component.set('isCmReport', false);
      component.showDCAReport(activity, collection, collectionType);
    } else {
      component.set('isCmReport', true);
      component.showCourseMapReport(activity, collection, collectionType);
    }
  },

  showCourseMapReport(activity, collection, collectionType) {
    let component = this;
    let params = {
      userId: component.get('isStudent')
        ? component.get('session.userId')
        : component.get('userId'),
      classId: activity.get('classId'),
      courseId: activity.get('courseId'),
      unitId: activity.get('unitId'),
      lessonId: activity.get('lessonId'),
      collectionId: activity.get('id'),
      sessionId:
        collectionType === 'assessment' ? activity.get('sessionId') : null,
      type: collectionType,
      isStudent: component.get('isStudent'),
      collection,
      performance: collection.performance
    };
    if (collectionType === 'assessment-external') {
      component.set('showExternalAssessmentReport', true);
      component.set('isShowStudentOfflineActivityReport', false);
      component.set('showCollectionReport', false);
    } else if (collectionType === 'offline-activity') {
      component.set('isShowStudentOfflineActivityReport', true);
      component.set('showExternalAssessmentReport', false);
      component.set('showCollectionReport', false);
    } else {
      component.set('showExternalAssessmentReport', false);
      component.set('isShowStudentOfflineActivityReport', false);
      component.set('showCollectionReport', true);
    }
    component.set('studentReportContextData', params);
  },

  showDCAReport(activity, collection, collectionType) {
    let component = this;
    let params = component.getStudentDCAReportData(
      activity,
      collection,
      collectionType
    );
    if (collectionType === 'assessment-external') {
      component.set('isShowStudentExternalAssessmentReport', true);
      component.set('showStudentDcaReport', false);
      component.set('isShowStudentExternalCollectionReport', false);
    } else if (collectionType === 'collection-external') {
      component.set('showStudentDcaReport', false);
      component.set('isShowStudentExternalAssessmentReport', false);
      component.set('isShowStudentExternalCollectionReport', true);
    } else {
      component.set('showStudentDcaReport', true);
      component.set('isShowStudentExternalAssessmentReport', false);
      component.set('isShowStudentExternalCollectionReport', false);
    }
    component.set('studentReportContextData', params);
  },

  getStudentDCAReportData(activity, collection, collectionType) {
    let component = this;
    return Ember.Object.create({
      activityDate: activity.get('lastAccessedDate'),
      collectionId: activity.get('id'),
      classId: activity.get('classId'),
      isStudent: component.get('isStudent'),
      type: collectionType,
      userId: component.get('isStudent')
        ? component.get('session.userId')
        : component.get('userId'),
      collection: component.getDCACollectionData(collection, collectionType),
      studentPerformance: component.getDCACollectionPerformance(activity)
    });
  },

  getDCACollectionData(collection, collectionType) {
    return Ember.Object.create({
      collectionType: collectionType,
      format: collectionType,
      id: collection.get('id'),
      title: collection.get('title'),
      thumbnailUrl: collection.get('thumbnailUrl'),
      questionCount: collection.get('questionCount'),
      resourceCount: collection.get('resourceCount'),
      oeQuestionCount: collection.get('oeQuestionCount')
    });
  },

  getDCACollectionPerformance(activity) {
    return Ember.Object.create({
      attempts: activity.get('attempts'),
      collectionId: activity.get('id'),
      hasStarted: true,
      id: activity.get('id'),
      sessionId: activity.get('sessionId'),
      timeSpent: activity.get('timeSpent'),
      status: activity.get('status'),
      views: activity.get('views')
    });
  }
});
