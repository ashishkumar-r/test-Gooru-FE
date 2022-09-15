import Ember from 'ember';
import DS from 'ember-data';
import {
  DEFAULT_IMAGES,
  COMPETENCY_STATUS_VALUE,
  DIAGNOSTIC_STATUS
} from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import {
  getQuestionUtil,
  QUESTION_TYPES,
  getQuestionTypeByApiType
} from 'gooru-web/config/question';
import AnalyticsSerializer from 'gooru-web/serializers/analytics/analytics';

export default DS.JSONAPISerializer.extend(ConfigurationMixin, {
  session: Ember.inject.service('session'),

  analyticsSerializer: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'analyticsSerializer',
      AnalyticsSerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * @function normalizeStudentsSummaryReport
   * Method to normalize students summary report data
   */
  normalizeStudentsSummaryReport(payload) {
    const serializer = this;
    let studentsSummaryData = payload.students;
    let serializedStudentsSumaryReportData = Ember.A([]);
    studentsSummaryData.map(studentSummaryData => {
      let normalizedStudentData = serializer.serializeStudentData(
        studentSummaryData.student
      );
      let normalizedSummaryData = serializer.serializeSummaryData(
        studentSummaryData.summaryData
      );
      serializedStudentsSumaryReportData.pushObject(
        Ember.Object.create({
          student: normalizedStudentData,
          summaryData: normalizedSummaryData
        })
      );
    });
    return Ember.Object.create({
      class: payload.class,
      course: payload.course,
      studentsSummaryData: serializedStudentsSumaryReportData,
      teacher: payload.teacher
    });
  },

  /**
   * @function normalizeStudentsWeeklySummaryReport
   * Method to normalize students weekly summary report
   */
  normalizeStudentsWeeklySummaryReport(payload) {
    const serializer = this;
    let studentsSummaryData = payload.students;
    let serializedStudentsSumaryReportData = Ember.A([]);
    studentsSummaryData.map(studentSummaryData => {
      let normalizedStudentData = serializer.serializeStudentData(
        studentSummaryData.student
      );
      let normalizedSummaryData = serializer.serializeSummaryData(
        studentSummaryData.summaryData.weekOf
      );
      serializedStudentsSumaryReportData.pushObject(
        Ember.Object.create({
          student: normalizedStudentData,
          summaryData: normalizedSummaryData
        })
      );
    });
    return Ember.Object.create({
      class: payload.class,
      course: payload.course,
      studentsSummaryData: serializedStudentsSumaryReportData,
      teacher: payload.teacher
    });
  },

  /**
   * @function serializeStudentData
   * Method to serialize student's profile data
   */
  serializeStudentData(studentData) {
    const serializer = this;
    const appRootPath = serializer.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl =
      studentData.profileImage || appRootPath + DEFAULT_IMAGES.USER_PROFILE;
    return Ember.Object.create({
      email: studentData.email,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      fullName: `${studentData.lastName}, ${studentData.firstName}`,
      id: studentData.id,
      thumbnailUrl
    });
  },

  /**
   * @function serializeSummaryData
   * Method to serialize student's summary data
   */
  serializeSummaryData(summaryData) {
    const serializer = this;
    let serializedSummaryData = {};
    if (summaryData) {
      serializedSummaryData = Ember.Object.create({
        masteredCompetencies: serializer.serializeCompetencies(
          summaryData.mastered,
          COMPETENCY_STATUS_VALUE.DEMONSTRATED
        ),
        completedCompetencies: serializer.serializeCompetencies(
          summaryData.completed,
          COMPETENCY_STATUS_VALUE.EARNED
        ),
        inferredCompetencies: serializer.serializeCompetencies(
          summaryData.inferred,
          COMPETENCY_STATUS_VALUE.INFERRED
        ),
        reInforcedCompetencies: serializer.serializeCompetencies(
          summaryData.reinforcedMastery,
          COMPETENCY_STATUS_VALUE.REINFERRED
        ),
        inprogressCompetencies: serializer.serializeCompetencies(
          summaryData.inprogress,
          COMPETENCY_STATUS_VALUE.IN_PROGRESS
        ),
        interactionData: Ember.Object.create({
          assessmentData: serializer.serializeInteraction(
            summaryData.interactions
              ? summaryData.interactions.assessment
              : null
          ),
          collectionData: serializer.serializeInteraction(
            summaryData.interactions
              ? summaryData.interactions.collection
              : null
          )
        }),
        suggestionData: Ember.Object.create({
          assessmentData: serializer.serializeInteraction(
            summaryData.suggestions ? summaryData.suggestions.assessment : null
          ),
          collectionData: serializer.serializeInteraction(
            summaryData.suggestions ? summaryData.suggestions.collection : null
          )
        }),
        startDate: summaryData.startDate,
        endDate: summaryData.endDate,
        diagnosticAssessmentStatus:
          DIAGNOSTIC_STATUS[summaryData.diagnosticAssessmentStatus]
      });
    }
    return serializedSummaryData;
  },

  /**
   * @function serializeInteraction
   * Method to serialize interaction contents
   */
  serializeInteraction(interactionData) {
    let serializedInteracitonData = Ember.Object.create({
      averageScore: 0,
      count: 0,
      sessionsCount: 0,
      totalMaxScore: 0,
      totalTimespent: 0,
      isNotStarted: true
    });
    if (interactionData) {
      serializedInteracitonData.set(
        'averageScore',
        interactionData.averageScore
      );
      serializedInteracitonData.set('count', interactionData.count);
      serializedInteracitonData.set(
        'sessionsCount',
        interactionData.sessionsCount
      );
      serializedInteracitonData.set(
        'totalMaxScore',
        interactionData.totalMaxScore
      );
      serializedInteracitonData.set(
        'totalTimespent',
        interactionData.totalTimespent
      );
      serializedInteracitonData.set('isNotStarted', false);
    }
    return serializedInteracitonData;
  },

  serializeCompetencies(competencies, status) {
    if (!competencies) {
      return [];
    }
    return competencies.map(competency => {
      return Ember.Object.create({
        id: competency.id,
        code: competency.code,
        contentSource: competency.content_source,
        status,
        description: competency.description || '',
        name: competency.name || ''
      });
    });
  },

  /**
   * @function normalizeStudentsTimespentReport
   * Method to normalize students time spent report data
   */
  normalizeStudentsTimespentReport(payload) {
    const serializer = this;
    let studentsTimespentData = payload.report;
    let serializedStudentsTimespentReportData = Ember.A([]);
    studentsTimespentData.map(timespentData => {
      let normalizedTimespentData = serializer.serializeTimespentData(
        timespentData.data
      );
      serializedStudentsTimespentReportData.pushObject(
        Ember.Object.create({
          reportDate: timespentData.report_date,
          data: normalizedTimespentData
        })
      );
    });
    return serializedStudentsTimespentReportData;
  },

  /**
   * @function serializeTimespentData
   * Method to serialize timespent data
   */
  serializeTimespentData(timespentData) {
    return timespentData.map(data => {
      return Ember.Object.create({
        id: data.id,
        title: data.title,
        format: data.format,
        totalTimespent: data.total_timespent,
        sessions: data.sessions,
        competencies: data.competencies,
        score: data.score,
        source: data.source,
        status: data.status
      });
    });
  },

  /**
   * @function normalizeStudentsTimespentSummaryreport
   * Method to normalize students time spent summery report data
   */
  normalizeStudentsTimespentSummaryreport(payload) {
    let studentsTimespentData = payload.members;
    let serializedStudentsTimespentReportData = Ember.A([]);
    studentsTimespentData.map(timespentData => {
      serializedStudentsTimespentReportData.pushObject(
        Ember.Object.create({
          id: timespentData.id,
          firstName: timespentData.first_name,
          lastName: timespentData.last_name,
          thumbnail: timespentData.thumbnail,
          totalCollectionTimespent: timespentData.total_collection_timespent,
          totalAssessmentTimespent: timespentData.total_assessment_timespent,
          totalOfflineActivityTimespent: timespentData.total_oa_timespent
        })
      );
    });
    return serializedStudentsTimespentReportData;
  },

  normalizeDiagnosticSummary(payload) {
    const content = payload.content || null;
    const questions = content ? content.questions : [];
    const resultsData = Ember.A([]);
    questions.forEach(question => {
      let questionType = question.questionType;
      if (Object.values(QUESTION_TYPES).indexOf(question.questionType) <= -1) {
        questionType = getQuestionTypeByApiType(question.questionType);
      }

      let answerObjects = this.get(
        'analyticsSerializer'
      ).normalizeAnswerObjects(question.answerObject, questionType);

      let questionUtil = getQuestionUtil(questionType).create();

      question.answerObject = question.answerObject;
      question.userAnswer = questionUtil.toUserAnswer(answerObjects);
      resultsData.pushObject(Ember.Object.create(question));
    });
    return resultsData;
  },

  normalizeAnswerObjects(answers, questionType) {
    const resultData = Ember.A([]);
    answers.forEach(answer => {
      if (questionType !== 'MA' && answer.text) {
        answer.answerId = window.btoa(encodeURIComponent(answer.text));
      }
      resultData.pushObject(Ember.Object.create(answer));
    });
    return resultData;
  },

  normalizeMinProficiency(payload) {
    const usageData = payload.usageData || [];
    return Ember.A(
      usageData.map(item => {
        item.percentScore = Math.round(item.percentScore);
        return Ember.Object.create(item);
      })
    );
  },

  normalizeActivityEvidence(payload) {
    const evidenceList = payload || [];
    const resultsSet = {
      oaEvidence: Ember.A([]),
      evidenceHeader: Ember.A([])
    };
    evidenceList.forEach(item => {
      const evidenceItems = this.normalizeEvidenceList(item.evidence);
      const evidenceObj = evidenceItems.get(0);
      resultsSet.evidenceHeader = Object.keys(evidenceObj);
      const userPayload = item.user;
      const basePath = this.get('session.cdnUrls.user');
      const appRootPath = this.get('appRootPath'); //configuration appRootPath
      const thumbnailUrl = payload.thumbnail
        ? basePath + payload.thumbnail
        : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
      const user = {
        fullName: `${userPayload.last_name},${userPayload.first_name}`,
        firstName: userPayload.first_name,
        id: userPayload.id,
        lastName: userPayload.last_name,
        thumbnail: thumbnailUrl,
        username: userPayload.username
      };
      const evidence = {
        classId: item.class_id,
        createdAt: item.created_at,
        evidence: evidenceItems,
        id: item.id,
        oaId: item.oa_id,
        taskId: item.task_id,
        user: Ember.Object.create(user)
      };
      resultsSet.oaEvidence.push(Ember.Object.create(evidence));
    });
    return resultsSet;
  },

  normalizeEvidenceList(payload) {
    const evidenceData = payload || [];
    return evidenceData.map(item => Ember.Object.create(item));
  }
});
