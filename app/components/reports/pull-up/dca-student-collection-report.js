import Ember from 'ember';
import Context from 'gooru-web/models/result/context';
import ReportMixin from 'gooru-web/mixins/reports/player-report-mixin';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import {
  downloadAllSubmision,
  setDownloadPathForUrl,
  toLocal
} from 'gooru-web/utils/utils';

export default Ember.Component.extend(ReportMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: [
    'reports',
    'backdrop-pull-ups',
    'pull-up-dca-student-collection-report'
  ],

  // -------------------------------------------------------------------------
  // Properties

  useSession: false,

  /**
   * @property {boolean}showAttempts
   */
  showAttempts: false,

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  /**
   * @property {[]}
   */
  attempts: Ember.computed('assessmentResult.totalAttempts', function() {
    return this.getAttemptList();
  }),

  isShowDownloadSubmission: Ember.computed('assessmentResult', function() {
    if (this.get('assessmentResult.resourceResults')) {
      const evidenceData = this.get('assessmentResult.resourceResults').map(
        result => {
          return !!(result && result.evidence && result.evidence.length);
        }
      );
      return evidenceData.contains(true);
    }
  }),

  isGraded: Ember.computed('assessmentResult', function() {
    if (this.get('assessmentResult.resourceResults')) {
      const evidenceData = this.get('assessmentResult.resourceResults').map(
        result => {
          return result.isGraded === false;
        }
      );
      return evidenceData.contains(true);
    }
  }),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    closeAll: function() {
      this.sendAction('onClosePullUp');
    },

    /**
     * Open the Open ended question summary report
     * @function actions:viewOEReport
     * @param questionId {String}
     */
    viewOEReport: function(questionId) {
      let component = this;
      const context = component.getContext(component.get('reportData'));
      const sessionId = component.get('assessmentResult.sessionId');
      const freeResponseContextParams = {
        collectionId: context.get('collectionId'),
        collectionType: context.get('collectionType'),
        studentId: context.get('userId'),
        classId: context.get('classId'),
        sessionId: sessionId,
        questionId,
        role: context.get('isTeacher') ? 'teacher' : 'student'
      };
      component.set('showOpenEndedPullup', true);
      component.set('freeResponseContextParams', freeResponseContextParams);
    },
    onClickDownload() {
      let uploadUrls = [];
      this.get('assessmentResult').resourceResults.forEach((result, index) => {
        result.evidence.map(item => {
          const fileName = setDownloadPathForUrl(item.fileName);
          const fileItem = {
            fileUrl: fileName,
            orginalFileName: item.originalFileName,
            sequenceCode: index + 1
          };
          uploadUrls.push(fileItem);
          this.set('evidenceUploadUrls', uploadUrls);
        });
      });
      if (this.get('evidenceUploadUrls')) {
        const studName = this.get('profile').username;
        const filename = `${studName}_${
          this.get('reportData').collection.title
        }`;
        downloadAllSubmision(
          this.get('evidenceUploadUrls'),
          filename,
          studName
        );
      }
    }
  },

  // -------------------------------------------------------------------------
  // Events

  /**
   * Functionto triggered once when the component element is first rendered.
   */
  didInsertElement() {
    const component = this;
    let context = component.getContext(component.get('reportData'));
    let classId = context.get('classId');
    component.openPullUp();
    component.showStudentReport();
    return Ember.RSVP.hash({
      classData: classId ? component.getClassData(classId) : null
    }).then(({ classData }) => {
      component.set('class', classData);
    });
  },

  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  closePullUp(isCloseAll) {
    let reportData = this.getContext(this.get('reportData'));
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.set('showPullUp', false);
        if (isCloseAll) {
          component.sendAction('onClosePullUp', isCloseAll);
        }
      }
    );
    const context = {
      classId: reportData.get('classId'),
      courseId: this.get('class.courseId'),
      contentSource: this.router
        .get('url')
        .substring(this.router.get('url').lastIndexOf('/') + 1),
      startTime: reportData.studentPerformance.startTime,
      endTime: moment().format('hh:mm'),
      additionalContext: reportData.studentPerformance
    };
    let parseEvent;
    if (this.get('reportData').type === 'collection') {
      parseEvent = PARSE_EVENTS.COLLECTION_REPORT;
    }
    if (this.get('reportData').type === 'assessment') {
      parseEvent = PARSE_EVENTS.ASSESSMENT_REPORT;
    }
    this.get('parseEventService').postParseEvent(parseEvent, context);
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Function to show the student report
   */
  showStudentReport() {
    let component = this;
    let reportData = component.get('reportData');
    component.set('isAssessment', reportData.type === 'assessment');
    component.set('isCollection', reportData.type === 'collection');
    component.set('isLoading', true);
    component.getDcaStudentCollectionReport(reportData);
  },

  /**
   * @function  get collection summary report by student
   */
  getDcaStudentCollectionReport(params) {
    let component = this;
    component.set('isReportLoading', true);
    const context = component.getContext(params);
    const reportData = component.get('reportData');
    const startDate = reportData.startDate;
    const endDate = reportData.endDate;
    const userId = context.get('userId');
    const collectionId = context.get('collectionId');
    const collectionType = context.get('collectionType');
    const classId = context.get('classId');
    const activityDate = context.get('activityDate');
    const sessionId = context.get('studentPerformance.sessionId');
    const type = params.type || 'collection';
    const isCollection = type === 'collection';
    const isSuggestedCollection = component.get('isSuggestedCollection');
    const classFramework = component.get('classFramework');
    const isDefaultShowFW = component.get('isDefaultShowFW');
    let pathId;
    if (isSuggestedCollection) {
      pathId = params.collection.performance.pathId;
    }
    const collectionPromise = isCollection
      ? component
        .get('collectionService')
        .readCollection(params.collectionId, classFramework, isDefaultShowFW)
      : component
        .get('assessmentService')
        .readAssessment(params.collectionId, classFramework, isDefaultShowFW);
    return Ember.RSVP.hashSettled({
      collection: collectionPromise,
      profile:
        context.userId !== 'anonymous'
          ? component.get('profileService').readUserProfile(context.userId)
          : {}
    }).then(function(hash) {
      component.set(
        'profile',
        hash.profile.state === 'fulfilled' ? hash.profile.value : null
      );
      const classData = component.get('class');
      component.set(
        'isShowExemplarText',
        component.isShowExemplarText(classData)
      );
      component.set(
        'collection',
        hash.collection.state === 'fulfilled' ? hash.collection.value : null
      );
      const analyticsService = component.get('analyticsService');
      const performanceSummaryPromise = component.get('useSession')
        ? analyticsService.getDCAPerformanceBySessionId(
          userId,
          classId,
          collectionId,
          collectionType,
          sessionId
        )
        : analyticsService.findResourcesByCollectionforDCA(
          sessionId,
          collectionId,
          classId,
          userId,
          collectionType,
          !isSuggestedCollection ? activityDate : null,
          isSuggestedCollection ? pathId : null,
          !isSuggestedCollection ? startDate : null,
          !isSuggestedCollection ? endDate : null
        );
      performanceSummaryPromise.then(function(assessmentResult) {
        component.setAssessmentResult(assessmentResult);
      });
    });
  },

  setAssessmentResult: function(assessmentResult, session) {
    const component = this;
    const collection = component.get('collection');
    const totalAttempts = component.get('completedSessions.length');
    assessmentResult.merge(collection);
    if (totalAttempts) {
      assessmentResult.set('totalAttempts', totalAttempts);
    }
    let submittedAt =
      session && session.eventTime
        ? toLocal(session.eventTime)
        : component.get('reportData.activityDate') || null;
    assessmentResult.set('submittedAt', submittedAt);
    component.set('assessmentResult', assessmentResult);
    component.findCompletionMinScore();
    component.set('isReportLoading', false);
    component.set('isLoading', false);
  },

  /**
   * Get the attempts list
   * @param params
   * @returns {Context}
   */
  getAttemptList: function() {
    var attempts = [];
    var totalAttempts = this.get('assessmentResult.totalAttempts');

    for (; totalAttempts > 0; totalAttempts--) {
      attempts.push({
        label: totalAttempts,
        value: totalAttempts
      });
    }
    return attempts;
  },

  /**
   * Get the player context
   * @param params
   * @returns {Context}
   */
  getContext: function(params) {
    let userId = params.userId;
    const collectionId = params.collectionId;
    return Context.create({
      collectionType: params.type,
      userId: userId,
      collectionId: collectionId,
      classId: params.classId,
      activityDate: params.activityDate,
      studentPerformance: params.studentPerformance
    });
  },

  /**
   * @function buildQuestionScoreUpdatePayLoad
   * Method to build question score updated layout from current version
   */
  buildQuestionScoreUpdatePayLoad: function(questionScoreUpdateData) {
    let component = this;
    let context = component.getContext(component.get('reportData'));
    let updateData = Ember.Object.create({
      student_id: context.get('userId'),
      session_id: context.get('sessionId'),
      collection_id: context.get('collectionId'),
      class_id: context.get('classId'),
      collection_type: context.get('collectionType'),
      resources: questionScoreUpdateData,
      content_source: 'dca'
    });
    return updateData;
  }
});
