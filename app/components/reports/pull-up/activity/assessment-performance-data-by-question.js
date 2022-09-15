import Ember from 'ember';
import {
  generateUUID,
  validateTimespent,
  validatePercentage,
  isCompatibleVW
} from 'gooru-web/utils/utils';
import { CONTENT_TYPES, SCREEN_SIZES } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['add-data', 'assessment-performance-data-by-question'],

  // -------------------------------------------------------------------------
  // Serevices
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  performanceService: Ember.inject.service('api-sdk/performance'),

  analyticsService: Ember.inject.service('api-sdk/analytics'),

  session: Ember.inject.service('session'),

  classActivityService: Ember.inject.service('api-sdk/class-activity'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    const component = this;
    Ember.RSVP.hash({
      assessmentPromise: component.get('isAssessment')
        ? component.loadAssessmentData()
        : component.loadExternalAssessmentData()
    }).then(() => {
      component.resetStudentScores();
      component.loadStudentsActivityPerformanceData();
    });
    if (component.get('isMobileView')) {
      component.set('isSwitchStudent', true);
      component.set('rightElementContainer', component.$('.right-container'));
    }
  },

  didRender() {
    const component = this;
    component.renderMobileView();
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when select a student
    onSelectStudent(student) {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(
          PARSE_EVENTS.CLICK_CS_ACTIVITY_REPORT_UPLOAD_DATA_STUDENT
        );
      const activeStudent = component.get('activeStudent');
      component.set('isSwitchStudent', true);
      if (
        component.get('isSessionStarted') &&
        !component.get('isOverwriteScore')
      ) {
        if (activeStudent && activeStudent.get('id') !== student.get('id')) {
          if (
            !component.doCheckQuestionScoreSubmitted() &&
            component.get('isAssessment')
          ) {
            component.set('isShowWarningMessage', true);
          } else {
            component.set('isShowSaveInformation', true);
          }
        }
      } else {
        component.set('activeStudent', student);
        component.set('isSessionStarted', false);
        if (student.get('performance')) {
          component.loadActivityQuestionsPerformanceData();
        } else {
          component.resetQuestionScores();
        }
        component.scrollToFirstQuestion();
      }
      component.set('activeStudentTemp', student);
    },

    //Action triggered when search student list
    onSearchStudent() {
      const component = this;
      let searchPattern = component.get('studentSearchPattern').toLowerCase();
      let students = component.get('students');
      let filteredStudents = students.filter(student =>
        student
          .get('fullName')
          .toLowerCase()
          .includes(searchPattern)
      );
      component.set('studentsList', filteredStudents);
    },

    //Action triggered when toggle question
    onToggleQuestion(questionSeq) {
      const component = this;
      component.set('isSessionStarted', true);
      component.toggleQuestionVisibility(questionSeq);
    },

    //Action triggered when dimiss warning popup
    onDismissWarning() {
      const component = this;
      component.set('isShowWarningMessage', false);
      component.set('isValidScore', false);
    },

    //Action triggered when clear question scores
    onAcceptWarning() {
      const component = this;
      component.resetQuestionScores();
      component.scrollToFirstQuestion();
      component.set('activeStudent', component.get('activeStudentTemp'));
      component.set('isShowWarningMessage', false);
      component.set('isSessionStarted', false);
      if (component.get('isOverwriteScore')) {
        component.loadActivityQuestionsPerformanceData();
      }
    },

    //Action triggered when submit question scores
    onAcceptSaveAndNext() {
      const component = this;
      if (component.get('isOverwriteScore')) {
        component.overwriteAssessmentQuestionScores();
      } else {
        if (component.get('isAssessment')) {
          component.submitQuestionDataSelectNextStudent();
        } else {
          component.submitExternalAssessmentDataSelectNextStudent();
        }
      }
      component.set('isSessionStarted', false);
      component.set('isShowSaveInformation', false);
    },

    //Action triggered when dismiss infor popup
    onDismissInfoPopup() {
      const component = this;
      if (component.get('isAssessment')) {
        component.resetQuestionScores();
        component.scrollToFirstQuestion();
      } else {
        component.set('activeStudent.score', null);
      }
      component.set('activeStudent', component.get('activeStudentTemp'));
      component.set('isShowSaveInformation', false);
      component.set('isSessionStarted', false);
    },

    //Action triggered when click save and next
    onClickSave() {
      const component = this;
      if (!component.doCheckQuestionScoreSubmitted()) {
        component.set('isShowWarningMessage', true);
      }
    },
    onClickNext() {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_CS_ACTIVITY_REPORT_UPLOAD_DATA_NEXT);
      let questions = component.get('questions');
      let unAnsweredQuestions = questions.filterBy('score', null);
      if (unAnsweredQuestions && unAnsweredQuestions.length) {
        component.set('isValidScore', true);
        component.set('isSessionStarted', true);
      } else {
        component.set('isValidScore', false);
        component.set('isSessionStarted', false);
        component.submitQuestionDataSelectNextStudent();
      }
    },

    //Action triggered when submit max timespent
    onSubmitMaxTimespent() {
      const component = this;
      const maxHour = component.get('maxHour');
      const maxMinute = component.get('maxMinute');
      let maxTimeInMilliSec = (maxHour * 60 * 60 + maxMinute * 60) * 1000;
      let questionTimespent =
        maxTimeInMilliSec / component.get('questions.length');
      component.set('questionTimespent', questionTimespent);
      component.set('isCaptureQuestionScore', true);
    },

    //Action triggered when clear search student list
    onClearSearchStudent() {
      const component = this;
      component.set('studentSearchPattern', '');
      component.set('studentsList', component.get('students'));
    },

    //Action triggered when click cancel button
    onClearQuestionScores() {
      const component = this;
      component.resetQuestionScores();
      component.scrollToFirstQuestion();
    },

    //Action triggered when submit external assessment student's score
    onSubmitExternalAssessmentStudentScore() {
      const component = this;
      component.submitExternalAssessmentDataSelectNextStudent();
    },

    //Actio triggered when submit external assessment max score
    onSubmitExternalAssessmentMaxScore() {
      const component = this;
      component.set('isCaptureExternalAssessmentStudentScore', true);
    },

    //Action triggered when click overwrite score
    onOverwriteScore() {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(
          PARSE_EVENTS.CLICK_CS_ACTIVITY_REPORT_UPLOAD_DATA_UPDATE_SCORE
        );
      component.overwriteAssessmentQuestionScores();
    },

    //Action triggered when click skip button
    skipAnswer() {
      const component = this;
      component.activateNextStudent();
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  rightElementContainer: null,

  isAssessment: Ember.computed.equal(
    'assessment.format',
    CONTENT_TYPES.ASSESSMENT
  ),

  /**
   * @property {Boolean} isEnableSaveNext
   */
  isEnableSaveNext: false,

  /**
   * @property {Boolean} isShowSaveInformation
   */
  isShowSaveInformation: false,

  /**
   * @property {Object} activeStudent
   */
  activeStudent: Ember.computed(function() {
    const component = this;
    return component.get('students').objectAt(0);
  }),

  /**
   * @property {Object} activeStudentTemp
   */
  activeStudentTemp: Ember.computed('activeStudent', function() {
    return this.get('activeStudent');
  }),

  /**
   * @property {Number} activeQuestionSeq
   */
  activeQuestionSeq: 0,

  /**
   * @property {Array} studentsList
   */
  studentsList: Ember.computed('students', function() {
    return this.get('students');
  }),

  /**
   * @property {Array} students
   */
  students: Ember.A([]),

  /**
   * @property {Object} assessment
   */
  assessment: null,

  isDiagnosticAssessment: false,

  /**
   * @property {Number} questionTimespent
   */
  questionTimespent: Ember.computed('activeStudent.performance', function() {
    if (this.get('activeStudent.performance.timeSpent')) {
      return (
        (this.get('activeStudent.performance')
          ? this.get('activeStudent.performance.timeSpent')
          : 0) / this.get('questions.length')
      );
    } else {
      let studentPerformance = this.get('students').find(student => {
        if (student.performance) {
          return student.performance;
        }
      });
      return (
        (studentPerformance &&
        studentPerformance.performance &&
        studentPerformance.performance.timeSpent
          ? studentPerformance.performance.timeSpent
          : 0) / this.get('questions.length')
      );
    }
  }),

  /**
   * @property {String} studentSearchPattern
   */
  studentSearchPattern: '',

  /**
   * @property {Array} questions
   */
  questions: Ember.A([]),

  /**
   * @property {Number} maxHour
   */
  maxHour: 0,

  /**
   * @property {Number} maxMinute
   */
  maxMinute: 0,

  /**
   * @property {Boolean} isValidMaxTimespent
   */
  isValidMaxTimespent: Ember.computed('maxHour', 'maxMinute', function() {
    const component = this;
    const maxHour = component.get('maxHour');
    const maxMinute = component.get('maxMinute');
    return validateTimespent(parseInt(maxHour), parseInt(maxMinute));
  }),

  /**
   * @property {Boolean} isCaptureQuestionScore
   */
  isCaptureQuestionScore: Ember.computed.alias(
    'activityData.isUpdatePerformance'
  ),

  /**
   * @property {String} timeZone
   */
  timeZone: Ember.computed(function() {
    return moment.tz.guess() || null;
  }),

  /**
   * @property {String} contentSource
   */
  contentSource: 'dailyclassactivity',

  /**
   * @property {Boolean} isShowClearStudentSearch
   */
  isShowClearStudentSearch: Ember.computed('studentSearchPattern', function() {
    const component = this;
    return component.get('studentSearchPattern.length');
  }),

  /**
   * @property {Number} unAnsweredQuestionCount
   */
  unAnsweredQuestionCount: 0,

  /**
   * @property {Number} externalAssessmentMaxScore
   */
  externalAssessmentMaxScore: null,

  /**
   * @property {Boolean} isCaptureExternalAssessmentStudentScore
   */
  isCaptureExternalAssessmentStudentScore: false,

  /**
   * @property {Boolean} isValidExternalAssessmentMaxScore
   */
  isValidExternalAssessmentMaxScore: Ember.computed(
    'externalAssessmentMaxScore',
    function() {
      const component = this;
      const externalAssessmentMaxScore = component.get(
        'externalAssessmentMaxScore'
      );
      return parseInt(externalAssessmentMaxScore) > 0
        ? validatePercentage(externalAssessmentMaxScore)
        : false;
    }
  ),

  /**
   * @property {Boolean} isValidExternalAssessmentStudentScore
   */
  isValidExternalAssessmentStudentScore: Ember.computed(
    'activeStudent.score',
    function() {
      const component = this;
      const externalAssessmentMaxScore = parseFloat(
        component.get('externalAssessmentMaxScore')
      );
      const studentScore = parseFloat(component.get('activeStudent.score'));
      component.set('isSessionStarted', true);
      return studentScore >= 0 && studentScore <= externalAssessmentMaxScore;
    }
  ),

  /**
   * @property {Boolean} isLastStudentActive
   */
  isLastStudentActive: Ember.computed('activeStudent', function() {
    const component = this;
    const activeStudent = component.get('activeStudent');
    const students = component.get('students');
    return students.indexOf(activeStudent) === students.length - 1;
  }),

  /**
   * @property {Boolean} isSessionStarted
   */
  isSessionStarted: false,

  /**
   * @property {Boolean} isOverwriteScore
   */
  isOverwriteScore: Ember.computed('activeStudent.performance', function() {
    return this.get('activeStudent.performance');
  }),

  /**
   * @property {Boolean} isMobileView
   */
  isMobileView: isCompatibleVW(SCREEN_SIZES.MEDIUM),

  /**
   * Checking activity data are want to updated or add
   * @property {Boolean} isUpdateData
   */
  isUpdateData: Ember.computed.alias('activityData.isUpdatePerformance'),

  isSwitchStudent: false,

  // -------------------------------------------------------------------------
  // Functions

  /**
   * @function renderMobileView
   * Method to render assessment score container in mobile view
   */
  renderMobileView() {
    const component = this;
    if (component.get('isMobileView') && component.get('isSwitchStudent')) {
      component.set('isSwitchStudent', false);
      component
        .$('.active-student .student-score-details')
        .append(component.get('rightElementContainer'));
    }
  },

  /**
   * @function scrollToFirstQuestion
   * Method to scroll to top of the questions list container
   */
  scrollToFirstQuestion() {
    const component = this;
    component.$('.question-list-container').scrollTop(0);
  },

  /**
   * @function activateNextStudent
   * Method to activate next student
   */
  activateNextStudent() {
    const component = this;
    let students = component.get('students');
    component.set('isSwitchStudent', true);
    let activeStudentIndex = students.indexOf(component.get('activeStudent'));
    if (!component.isDestroyed) {
      if (
        component.get('activeStudentTemp.id') !==
        component.get('activeStudent.id')
      ) {
        component.set('activeStudent', component.get('activeStudentTemp'));
      } else {
        if (activeStudentIndex !== students.length - 1) {
          component.set(
            'activeStudent',
            students.objectAt(activeStudentIndex + 1)
          );
          component.set(
            'activeStudentTemp',
            students.objectAt(activeStudentIndex + 1)
          );
        } else {
          component.sendAction('onClosePullUp');
        }
      }
    }
  },

  /**
   * @function submitQuestionDataSelectNextStudent
   * Method to submit question scores and select next student
   */
  submitQuestionDataSelectNextStudent() {
    const component = this;
    component.submitAssessmentPerformanceData().then(function() {
      component.loadStudentActivityPerformanceData(
        component.get('activeStudent')
      );
      component.resetQuestionScores();
      component.activateNextStudent();
      component.scrollToFirstQuestion();
      if (component.get('isOverwriteScore')) {
        component.loadActivityQuestionsPerformanceData();
      }
    });
  },

  /**
   * @function submitExternalAssessmentDataSelectNextStudent
   * Method to submit external assessment score and select next student
   */
  submitExternalAssessmentDataSelectNextStudent() {
    const component = this;
    component.submitExternalAssessmentPerformanceData().then(function() {
      component.loadStudentActivityPerformanceData(
        component.get('activeStudent')
      );
      component.activateNextStudent();
    });
  },

  /**
   * @function overwriteAssessmentQuestionScores
   * Method to trigger score overwrite method and update student perf score
   */
  overwriteAssessmentQuestionScores() {
    const component = this;
    component
      .updateQuestionScore(component.getOverwriteQuestionScoresPayload())
      .then(function() {
        component.loadStudentActivityPerformanceData(
          component.get('activeStudent')
        );
      });
  },

  /**
   * @function loadAssessmentData
   */
  loadAssessmentData() {
    let component = this;
    let assessment = component.get('assessment');
    return component
      .fetchAssessmentData(assessment.get('id'))
      .then(function(assessmentData) {
        component.set(
          'isDiagnosticAssessment',
          assessmentData.get('enableDiagnostic')
        );
        if (!component.isDestroyed) {
          let questions = assessmentData
            ? assessmentData.get('children')
            : Ember.A([]);
          component.set('questions', questions);
          component.resetQuestionScores();
          return assessmentData;
        }
      });
  },

  /**
   * @function loadExternalAssessmentData
   * Method to load external assessment data
   */
  loadExternalAssessmentData() {
    let component = this;
    let assessment = component.get('assessment');
    return component
      .fetchExternalAssessmentData(assessment.get('id'))
      .then(function(assessmentData) {
        if (!component.isDestroyed) {
          component.set('assessment', assessmentData);
        }
        return assessmentData;
      });
  },

  /**
   * @function loadStudentsActivityPerformanceData
   * Method to load all students activity performance data
   */
  loadStudentsActivityPerformanceData() {
    const component = this;
    const classActivityService = component.get('classActivityService');
    const activityData = component.get('activityData');
    const activityDate = activityData.get('activation_date')
      ? activityData.get('activation_date')
      : moment().format('YYYY-MM-DD');
    const endDate = activityData.get('end_date');
    const classId = component.get('classId');
    return Ember.RSVP.hash({
      studentsActivityPerformanceData: classActivityService.fetchStudentsActivityPerformance(
        classId,
        activityData,
        activityDate,
        endDate
      )
    }).then(({ studentsActivityPerformanceData }) => {
      component.parseStudentsActivityPerforamanceData(
        studentsActivityPerformanceData
      );
    });
  },

  /**
   * @function loadActivityQuestionsPerformanceData
   * Method to load activity questions performance data
   */
  loadActivityQuestionsPerformanceData() {
    const component = this;
    component.set('isLoading', true);
    const activeStudent = component.get('activeStudent');
    component
      .fetchAssessmentPerformanceBySession(
        activeStudent.get('performance.sessionId')
      )
      .then(function(activityQuestionsPerformance) {
        if (activityQuestionsPerformance) {
          component.populateActivityQuestionsPerformance(
            activityQuestionsPerformance
          );
        }
      });
  },

  /**
   * @function loadStudentActivityPerformanceData
   * Method to load given student activity performance data
   */
  loadStudentActivityPerformanceData(student) {
    const component = this;
    const classActivityService = component.get('classActivityService');
    const activityData = Ember.A([component.get('activityData')]);
    const userId = student.get('id');
    const classId = component.get('classId');
    const activityDate = component.get('activityData.activation_date')
      ? component.get('activityData.activation_date')
      : moment().format('YYYY-MM-DD');
    const endDate = component.get('activityData.end_date');
    return Ember.RSVP.hash({
      studentActivityPerformance: classActivityService.findStudentActivitiesPerformanceSummary(
        userId,
        classId,
        activityData,
        activityDate,
        endDate
      )
    }).then(({ studentActivityPerformance }) => {
      if (!component.isDestroyed && component.get('isOverwriteScore')) {
        if (student.get('performance')) {
          student.set(
            'performance.score',
            studentActivityPerformance
              .objectAt(0)
              .get('collection.performance.score')
          );
        } else {
          student.set(
            'performance',
            studentActivityPerformance.objectAt(0).get('collection.performance')
          );
        }
      } else {
        student.set(
          'performance',
          studentActivityPerformance.objectAt(0).get('collection.performance')
        );
      }
    });
  },

  /**
   * @function fetchAssessmentData
   */
  fetchAssessmentData(assessmentId) {
    const component = this;
    const assessmentService = component.get('assessmentService');
    return assessmentService.readAssessment(assessmentId);
  },

  /**
   * @function fetchExternalAssessmentData
   */
  fetchExternalAssessmentData(assessmentId) {
    const component = this;
    const assessmentService = component.get('assessmentService');
    return assessmentService.readExternalAssessment(assessmentId);
  },

  /**
   * @function fetchAssessmentPerformanceBySession
   * Method to load assessment performance data by given session ID
   */
  fetchAssessmentPerformanceBySession() {
    const component = this;
    const analyticsService = component.get('analyticsService');
    const userId = component.get('activeStudent.id');
    const sessionId = component.get('activeStudent.performance.sessionId');
    const classId = component.get('classId');
    const assessmentId = component.get('assessment.id');
    return analyticsService.getDCAPerformanceBySessionId(
      userId,
      classId,
      assessmentId,
      'assessment',
      sessionId
    );
  },

  /**
   * @function updateQuestionScore
   * Method to update question score
   */
  updateQuestionScore(questionsData) {
    const component = this;
    const analyticsService = component.get('analyticsService');
    return analyticsService.updateQuestionScore(questionsData);
  },

  /**
   * @function submitAssessmentPerformanceData
   */
  submitAssessmentPerformanceData() {
    const component = this;
    const performanceService = component.get('performanceService');
    return Ember.RSVP.hash({
      studentPerformanceUpdated: Ember.RSVP.resolve(
        performanceService.updateCollectionOfflinePerformance(
          component.getAssessmentDataParams()
        )
      )
    }).then(() => {
      if (!component.isDestroyed) {
        component.resetQuestionScores();
        component.set('activeStudent', component.get('activeStudentTemp'));
        component.set('activeStudent.isSubmitted', true);
      }
    });
  },

  /**
   * @function submitExternalAssessmentPerformanceData
   */
  submitExternalAssessmentPerformanceData() {
    const component = this;
    const performanceService = component.get('performanceService');
    return Ember.RSVP.hash({
      studentPerformanceUpdated: Ember.RSVP.resolve(
        performanceService.updateCollectionOfflinePerformance(
          component.getExternalAssessmentDataParams()
        )
      )
    }).then(() => {
      if (!component.isDestroyed) {
        component.set('activeStudent', component.get('activeStudentTemp'));
        component.set('activeStudent.isSubmitted', true);
      }
    });
  },

  /**
   * @function resetQuestionScores
   */
  resetQuestionScores() {
    const component = this;
    let questions = component.get('questions');
    questions.map(question => {
      question.set('score', null);
      question.set('feedbackComment', null);
      question.set('isScored', false);
    });
  },

  /**
   * @function toggleQuestionVisibility
   */
  toggleQuestionVisibility(activePos = 0) {
    const component = this;
    let questions = component.get('questions');
    if (questions.length !== activePos) {
      let activeQuestion = questions.objectAt(activePos);
      questions.map(question => question.set('active', false));
      activeQuestion.set('active', !activeQuestion.get('active'));
      component.set('activeQuestionSeq', activePos);
    } else {
      component.set('isEnableSaveNext', true);
    }
  },

  /**
   * @function doCheckQuestionScoreSubmitted
   */
  doCheckQuestionScoreSubmitted() {
    const component = this;
    let questions = component.get('questions');
    let unAnsweredQuestions = questions.filterBy('score', null);
    let numberOfQuestionsNotSubmitted = unAnsweredQuestions.length;
    component.set('unAnsweredQuestionCount', numberOfQuestionsNotSubmitted);
    return !numberOfQuestionsNotSubmitted;
  },

  /**
   * @function getAssessmentDataParams
   */
  getAssessmentDataParams() {
    let component = this;
    let questions = component.get('questions');
    let assessmentResources = Ember.A([]);
    let activeStudent = component.get('activeStudent');
    let activityData = component.get('activityData');
    let activityId = activityData.get('id');
    let conductedOn = activityData.activation_date
      ? activityData.activation_date
      : moment().format('YYYY-MM-DD');
    let classId = component.get('classId');
    let assessment = component.get('assessment');
    let courseId = component.get('course') ? component.get('course').id : null;
    const isDiagnosticAssessment = component.get('isDiagnosticAssessment');
    questions.map(question => {
      let resourceData = {
        resource_id: question.get('id'),
        resource_type: 'question',
        question_type: question.get('type'),
        score: Number(question.get('score')) || 0,
        max_score: question.get('maxScore'),
        time_spent: component.get('questionTimespent'),
        feedback_comment: question.get('feedbackComment')
      };
      const standards = question.get('standards') || [];
      const standard = standards[0] ? standards[0] : null;
      if (isDiagnosticAssessment && standard) {
        resourceData.standard = standard.id;
      }
      assessmentResources.push(resourceData);
    });
    let studentPerformanceData = {
      tenant_id: component.get('session.tenantId') || null,
      student_id: activeStudent.get('id'),
      session_id: generateUUID(),
      class_id: classId,
      collection_id: assessment.get('id'),
      collection_type: 'assessment',
      content_source: component.get('contentSource'),
      time_zone: component.get('timeZone'),
      conducted_on: conductedOn,
      path_id: 0,
      path_type: null,
      resources: assessmentResources,
      course_id: courseId,
      additionalContext: btoa(
        JSON.stringify({
          dcaContentId: activityId
        })
      )
    };
    if (isDiagnosticAssessment) {
      studentPerformanceData.isDiagnostic = true;
    }
    return studentPerformanceData;
  },

  /**
   * @function getExternalAssessmentDataParams
   * Method to construct external assessment data params
   */
  getExternalAssessmentDataParams() {
    let component = this;
    let student = component.get('activeStudent');
    let conductedOn = component.get('activityData.activation_date')
      ? component.get('activityData.activation_date')
      : moment().format('YYYY-MM-DD');
    let maxScore = component.get('externalAssessmentMaxScore');
    let classId = component.get('classId');
    let activityId = component.get('activityData.id');
    let studentPerformanceData = {
      student_id: student.get('id'),
      tenant_id: component.get('session.tenantId') || null,
      collection_type: 'assessment-external',
      session_id: generateUUID(),
      time_zone: component.get('timeZone'),
      class_id: classId,
      collection_id: component.get('assessment.id'),
      partner_id: component.get('session.partnerId') || null,
      content_source: component.get('contentSource'),
      score: parseInt(student.get('score')) || 0,
      max_score: parseInt(maxScore) || 0,
      time_spent: 0,
      conducted_on: conductedOn,
      additionalContext: btoa(
        JSON.stringify({
          dcaContentId: activityId
        })
      )
    };
    return studentPerformanceData;
  },

  /**
   * @function resetStudentScores
   * Method to reset student scores
   */
  resetStudentScores() {
    const component = this;
    const students = component.get('students');
    students.map(student => {
      student.set('score', null);
      student.set('feedbackComment', null);
    });
  },

  /**
   * @function parseStudentsActivityPerforamanceData
   * Method to parse student activity performance data
   */
  parseStudentsActivityPerforamanceData(studentsActivityPerformanceData) {
    const component = this;
    let students = component.get('students');
    students.map(student => {
      let studentActivityPerformanceData = studentsActivityPerformanceData.findBy(
        'userId',
        student.get('id')
      );
      student.set(
        'performance',
        studentActivityPerformanceData
          ? studentActivityPerformanceData.get('collectionPerformanceSummary')
          : null
      );
    });
    if (component.get('isOverwriteScore')) {
      component.loadActivityQuestionsPerformanceData();
    }
  },

  /**
   * @function populateActivityQuestionsPerformance
   * Method to populate activity questions performance data
   */
  populateActivityQuestionsPerformance(questionsPerformanceData) {
    const component = this;
    let questionsPerformance = questionsPerformanceData.get('resourceResults');
    let questions = component.get('questions');
    if (!component.isDestroyed) {
      questions.map(question => {
        let questionPerformance = questionsPerformance.findBy(
          'resourceId',
          question.get('id')
        );
        if (questionPerformance) {
          question.set('score', questionPerformance.get('rawScore'));
          question.set(
            'feedbackComment',
            questionPerformance.get('feedbackComment')
          );
          question.set('isScored', true);
        }
      });
      component.set('isLoading', false);
    }
  },

  /**
   * @function getOverwriteQuestionScoresPayload
   * Method to construct overwrite questions score payload
   */
  getOverwriteQuestionScoresPayload() {
    const component = this;
    const questions = component.get('questions');
    const activeStudent = component.get('activeStudent');
    const assessment = component.get('assessment');
    const activityId = component.get('activityData.id');
    let resourcesContext = Ember.A([]);
    questions.map(question => {
      let resourceContext = {
        resource_id: question.get('id'),
        score: Number(question.get('score')) || 0,
        max_score: question.get('maxScore'),
        feedback_comment: question.get('feedbackComment')
      };
      resourcesContext.push(resourceContext);
    });
    const qustionsScorePayload = {
      student_id: activeStudent.get('id'),
      session_id: activeStudent.get('performance.sessionId'),
      collection_id: assessment.get('id'),
      class_id: component.get('classId'),
      collection_type: 'assessment',
      content_source: component.get('contentSource'),
      additional_context: btoa(
        JSON.stringify({
          dcaContentId: activityId
        })
      ),
      resources: resourcesContext
    };
    return qustionsScorePayload;
  }
});
