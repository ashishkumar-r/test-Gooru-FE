import Ember from 'ember';

import UserResourcesResult from 'gooru-web/models/result/user-resources';
import ResourceResult from 'gooru-web/models/result/resource';
import QuestionResult from 'gooru-web/models/result/question';
import AnswerObject from 'gooru-web/utils/question/answer-object';
import {
  getQuestionUtil,
  QUESTION_TYPES,
  getQuestionTypeByApiType
} from 'gooru-web/config/question';
import { toLocal } from 'gooru-web/utils/utils';
import {
  DEFAULT_IMAGES,
  ANSWER_SCORE_TYPE_ENUM
} from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Object.extend(ConfigurationMixin, {
  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),

  normalizeResponse: function(payload) {
    var realTimeModel = [];
    this.normalizeUserResults(realTimeModel, payload.content);
    return realTimeModel;
  },

  normalizeUserResults: function(model, payload) {
    const serializer = this;
    payload.forEach(function(userResult) {
      this.push(serializer.normalizeUserResult(userResult));
    }, model);
  },

  normalizeUserResult: function(payload) {
    const serializer = this;
    let usageData = payload.usageData;
    if (usageData === undefined) {
      usageData = payload.questions;
      if (usageData === undefined) {
        usageData = payload.resources;
      }
    }
    let data = usageData.objectAt(0);
    let sessionId = 'NA';
    if (data) {
      sessionId = data.sessionId;
    }
    return UserResourcesResult.create({
      user: payload.userUid,
      isAttemptFinished: !!payload.isCompleteAttempt, // This value is used only by the RealTime dashboard
      resourceResults: serializer.normalizeResourceResults(usageData),
      assessment: payload.assessment || null,
      collection: payload.collection || null,
      sessionId: sessionId
    });
  },

  /**
   * Serializes normalize Evidence
   ** @param {*[]} payload
   */
  normalizeEvidence: function(payload) {
    if (payload) {
      let evidenceList = Ember.A([]);
      payload.map(evidence => {
        var cdnURL = this.get('session.cdnUrls.content');
        var originalFileName = {
          fileName: cdnURL + evidence.fileName,
          originalFileName: evidence.originalFileName
        };
        evidenceList.pushObject(originalFileName);
      });
      return evidenceList;
    } else {
      return null;
    }
  },

  normalizeResourceResults: function(payload) {
    const serializer = this;
    var resourceResults = [];
    payload.forEach(function(resourceResult) {
      this.push(serializer.normalizeResourceResult(resourceResult));
    }, resourceResults);
    return resourceResults;
  },

  normalizeResourceResult: function(payload) {
    const serializer = this;
    let qtype = payload.questionType;
    if (Object.values(QUESTION_TYPES).indexOf(qtype) <= -1) {
      let questionType = getQuestionTypeByApiType(qtype);
      if (questionType) {
        qtype = questionType;
      }
    }
    if (qtype === 'unknown') {
      qtype = payload.resourceType;
    }
    let answerObjects = this.normalizeAnswerObjects(
      payload.answerObject,
      qtype
    );

    let eventTime = payload.eventTime ? toLocal(payload.eventTime) : null;
    let startedAt = payload.startTime
      ? toLocal(payload.startTime)
      : toLocal(new Date().getTime());
    let submittedAt = payload.endTime ? toLocal(payload.endTime) : startedAt;

    if (payload.resourceType === 'question') {
      let util = getQuestionUtil(qtype).create();
      let resId = payload.gooruOId;
      if (resId === undefined) {
        resId = payload.questionId;
      }
      if (resId === undefined) {
        resId = payload.resourceId;
      }

      let questionResult = QuestionResult.create({
        //Commons fields for real time and student collection performance
        resourceId: resId,
        reaction: payload.reaction,
        timeSpent: payload.timeSpent,
        answerObject: payload.answerObject,
        userAnswer: util.toUserAnswer(answerObjects, qtype),

        //fields only for real time
        correct: serializer.partialScoreCalulate(payload, qtype),
        tooltip: serializer.partialScoreTooltip(payload, qtype),
        percentScore: payload.percentScore || 0,
        //fields only for student collection performance
        score: payload.percentScore || payload.score,
        rawScore: payload.rawScore,
        maxScore: payload.maxScore,
        resourceType: payload.resourceType,
        questionType: qtype,
        attempts: payload.attempts,
        sessionId: payload.sessionId,
        startedAt: startedAt,
        submittedAt: submittedAt,
        eventTime: eventTime,
        isGraded: payload.isGraded,
        overallComment: payload.overallComment || null,
        studentScore: payload.studentScore || payload.score,
        categoryScore: payload.categoryScore || null,
        feedbackComment: payload.feedbackComment
          ? payload.feedbackComment
          : null
      });
      if (payload.subQuestions) {
        questionResult.set(
          'subQuestions',
          this.normalizeResourceResults(payload.subQuestions)
        );
      }
      questionResult.evidence = this.normalizeEvidence(payload.evidence);
      questionResult.submittedAnswer = !!questionResult.userAnswer;
      return questionResult;
    } else {
      var resourceIdVal = payload.gooruOId;
      if (resourceIdVal === undefined) {
        resourceIdVal = payload.resourceId;
      }
      return ResourceResult.create({
        //Commons fields for real time and student collection performance
        resourceId: resourceIdVal,
        reaction: payload.reaction,
        timeSpent: payload.timeSpent,

        //fields only for student collection performance
        score: payload.score,
        resourceType: payload.resourceType,
        format: payload.format,
        attempts: payload.attempts,
        sessionId: payload.sessionId,
        startedAt: startedAt,
        submittedAt: submittedAt,
        eventTime: eventTime
      });
    }
  },

  partialScoreCalulate(scoreObject, qtype) {
    if (this.partailCheckQType(qtype)) {
      if (scoreObject.percentScore) {
        if (scoreObject.percentScore === 100) {
          return ANSWER_SCORE_TYPE_ENUM.correct;
        } else if (scoreObject.percentScore === 0) {
          return ANSWER_SCORE_TYPE_ENUM.incorrect;
        } else {
          return ANSWER_SCORE_TYPE_ENUM.partiallyCorrect;
        }
      } else {
        return ANSWER_SCORE_TYPE_ENUM.incorrect;
      }
    } else {
      return scoreObject.percentScore > 0
        ? ANSWER_SCORE_TYPE_ENUM.correct
        : ANSWER_SCORE_TYPE_ENUM.incorrect;
    }
  },

  partialScoreTooltip(scoreObject, qtype) {
    if (this.partailCheckQType(qtype)) {
      if (scoreObject.percentScore) {
        if (scoreObject.percentScore === 100) {
          return 'common.correct';
        } else if (scoreObject.percentScore === 0) {
          return 'common.incorrect';
        } else {
          return 'common.partial-correct';
        }
      } else {
        return 'common.incorrect';
      }
    } else {
      return scoreObject.percentScore > 0
        ? 'common.correct'
        : 'common.incorrect';
    }
  },

  partailCheckQType(qtype) {
    const partailCheckQType = [
      QUESTION_TYPES.serpIdentifyVowel,
      QUESTION_TYPES.fib,
      QUESTION_TYPES.multipleAnswer,
      QUESTION_TYPES.encodingAssessment,
      QUESTION_TYPES.baseWords,
      QUESTION_TYPES.vowelTeams,
      QUESTION_TYPES.countingSyllable,
      QUESTION_TYPES.dividingSyllables,
      QUESTION_TYPES.sorting,
      QUESTION_TYPES.classic,
      QUESTION_TYPES.hotSpotText,
      QUESTION_TYPES.hotSpotImage,
      QUESTION_TYPES.hotTextReorder
    ];
    return partailCheckQType.includes(qtype);
  },
  /**
   * Answer object information
   * @see gooru-web/utils/question/*
   *
   * @param {string|[]} answerObjects
   * @returns {AnswerObject[]}
   */
  normalizeAnswerObjects: function(answerObjects, questionType) {
    let isSerp = questionType.indexOf('SERP') !== -1;
    answerObjects =
      !answerObjects || answerObjects === 'N/A' || answerObjects === 'NA'
        ? []
        : answerObjects;
    if (typeof answerObjects === 'string') {
      answerObjects = JSON.parse(answerObjects);
    }

    if (!Ember.$.isArray(answerObjects)) {
      answerObjects = [];
    }
    return answerObjects.map(function(answerObject) {
      if (questionType !== 'MA' && !isSerp && answerObject.text) {
        answerObject.answerId = window.btoa(
          encodeURIComponent(answerObject.text)
        );
      }
      return AnswerObject.create(answerObject);
    });
  },

  normalizeQuestions: function(payload) {
    var result = [];
    if (Ember.isArray(payload)) {
      result = payload.map(function(question) {
        return question.questionId;
      });
    }
    return result;
  },

  /**
   * @function normalizeAtcPerformanceSummary
   * Normalize method for classic course atc view chart
   */
  normalizeAtcPerformanceSummary(payload) {
    let normalizedClassPerformanceSummary = Ember.A([]);
    if (payload && payload.usageData) {
      let performanceSummary = payload.usageData;
      performanceSummary.map(performance => {
        let userPerformanceData = {
          progress: performance.percentCompletion,
          score: performance.percentScore,
          userId: performance.userId
        };
        normalizedClassPerformanceSummary.push(userPerformanceData);
      });
    }
    return normalizedClassPerformanceSummary;
  },

  /**
   * @function normalizeAtcPerformanceSummaryPremiumClass
   * Normalize method for premium course atc view chart
   */
  normalizeAtcPerformanceSummaryPremiumClass(payload) {
    let normalizedClassPerformanceSummary = Ember.A([]);
    if (payload && payload.competencyStats) {
      let performanceSummary = payload.competencyStats;
      // performanceSummary.map(performance => {
      //   let userPerformanceData = {
      //     progress: performance.percentCompletion || 0,
      //     score: performance.percentScore || 0,
      //     totalCompetency: performance.totalCompetencies || 0,
      //     completedCompetency: performance.completedCompetencies || 0,
      //     inprogressCompetencies: performance.inprogressCompetencies || 0,
      //     userId: performance.userId
      //   };
      //   normalizedClassPerformanceSummary.push(userPerformanceData);
      // });

      normalizedClassPerformanceSummary = performanceSummary;
      // });
    }
    return normalizedClassPerformanceSummary;
  },

  /**
   * @function normalizeDCAPerformanceSummary
   * Normalize method for performance summary of DCA
   */
  normalizeDCAPerformanceSummary(payload) {
    let normalizedDCAPerformanceSummary = Ember.Object.create({
      performance: payload.usageData[0]
    });
    return normalizedDCAPerformanceSummary;
  },

  /**
   * @function normalizeDCASummary
   * Normalize method for summary report of DCA for yearly
   */
  normalizeDCAYearlySummary(payload) {
    let normalizedDCAYearlySummary = Ember.A([]);
    if (payload) {
      let dcaSummary = payload.usageData;
      dcaSummary.map(data => {
        let summary = Ember.Object.create({
          scoreInPercentage: data.scoreInPercentage,
          timeSpent: data.timeSpent,
          month: data.month.toString().padStart(2, '0'),
          year: data.year
        });
        normalizedDCAYearlySummary.push(summary);
      });
    }
    return normalizedDCAYearlySummary;
  },

  /**
   * @function normalizeGradeCompetencyCount
   * Normalize method for grade competency counts
   */
  normalizeGradeCompetencyCount(payload) {
    const results = Ember.A();
    let gradesCount = payload.grades ? payload.grades : [];
    gradesCount = gradesCount.sortBy('sequence');
    gradesCount.forEach(grade => {
      let gradeCompCount = Ember.Object.create({
        description: grade.description,
        name: grade.grade,
        id: grade.id,
        sequence: grade.sequence,
        thumbnail: grade.thumbnail,
        totalCompetencies: grade.totalCompetencies
      });
      results.pushObject(gradeCompCount);
    });
    return results;
  },

  normalizeLikertResponse(payload) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.user');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    let responseArray = Ember.A();
    if (payload.content.length > 0) {
      let getAnswerOptions = payload.content[0].answerOption[0];
      let getUsageData = payload.content[0].usageData;
      let getQuestionItems = getAnswerOptions.items;
      getQuestionItems.map(item => {
        let questionObj = Ember.Object.create({
          questionTitle: item
        });
        responseArray.pushObject(questionObj);
      });
      responseArray.map(result => {
        let title = result.questionTitle;
        let getScalePoints = Ember.A();
        getAnswerOptions.scale_point_labels.map(scaleLabel => {
          let pointerObj = Ember.Object.create({
            levelName: scaleLabel.level_name,
            levelPoint: scaleLabel.level_point,
            userInfo: Ember.A()
          });
          getScalePoints.pushObject(pointerObj);
        });
        let scalePoints = getScalePoints;
        getUsageData.map(data => {
          let answerObj = data.answerObject[0];
          let answerText = JSON.parse(answerObj.text);
          const thumbnailUrl = data.thumbnail
            ? basePath + data.thumbnail
            : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
          let userDeatils = Ember.Object.create({
            id: data.userUid,
            firstName: data.firstName,
            lastName: data.lastName,
            thumbnailImage: thumbnailUrl
          });
          let likertScale = answerText.liket_scale_selected_items.findBy(
            'item_name',
            title
          );
          let userScalePoint = scalePoints.findBy(
            'levelName',
            likertScale.scale_name
          );
          if (
            userScalePoint &&
            userScalePoint !== '' &&
            userScalePoint !== undefined
          ) {
            let userInfo = userScalePoint.userInfo;
            userInfo.pushObject(userDeatils);
          }
        });
        result.questionScalePoints = scalePoints;
      });
    }
    return responseArray;
  }
});
