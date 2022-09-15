import Ember from 'ember';
import {
  getTimeInMillisec,
  formatTime as formatTimeInMilliSec
} from 'gooru-web/utils/utils';
import {
  ROLES,
  PLAYER_EVENT_SOURCE,
  CONTENT_TYPES
} from 'gooru-web/config/config';
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['offline-activity-player', 'gru-offline-activity-submission'],

  classNameBindings: ['isPreview:player-preview', 'isOaCompleted:oa-completed'],

  // -------------------------------------------------------------------------
  // Dependencies
  oaAnalyticsService: Ember.inject.service(
    'api-sdk/offline-activity/oa-analytics'
  ),

  oaService: Ember.inject.service('api-sdk/offline-activity/offline-activity'),

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    component.loadTaskSubmissionData();
    component.afterRender();
    if (!component.get('isTeacher')) {
      component.doCheckOaCompleted();
    }
  },

  actions: {
    //Action triggered when toggle timespent entry container
    onToggleTimespent() {
      const component = this;
      component.toggleProperty('isTimespentExpanded');
      component.$('.timespent-container').slideToggle();
    },

    //Action triggered when save entered timespent
    onSaveTimespent() {
      const component = this;
      component.set('isTimespentExpanded', false);
      component.submitTaskDetails(component.createTaskTimeSubmissionPayload());
      component.$('.timespent-container').slideUp();
    },

    //Action triggered when click on complete submission
    onCompleteSubmission() {
      const component = this;
      component.markOACompleted().then(function() {
        component.set('isOaCompleted', true);
        component.set('isShowCompletionConfirmation', false);
      });
    },

    //Action triggered when click on cancel button in the confirmation popup
    onCancelCompletion() {
      this.set('isShowCompletionConfirmation', false);
    },

    //Action triggered when click on confirm/yes button in the confirmation popup
    onShowCompletionConfirmation() {
      const component = this;
      component.set('isShowCompletionConfirmation', true);
    },

    //Action triggered when click on self grade
    onTriggerSelfGrade(component = this) {
      const classId = component.get('classId');
      const content = component.get('offlineActivity');
      const contentSource = component.get('contentSource');
      const contentType = CONTENT_TYPES.OFFLINE_ACTIVITY;
      const selfGradeItemContext = Ember.Object.create({
        classId,
        content,
        contentType,
        contentSource,
        dcaContentId: component.get('caContentId')
      });
      const itemsToGrade = Ember.A([selfGradeItemContext]);
      component.set('itemsToGrade', itemsToGrade);
      component.set('selfGradeItemContext', selfGradeItemContext);
      component.set('isShowOaSelfGrading', true);
    },

    //Action triggered once self grading is done
    onDoneOaGrading() {
      const component = this;
      component.set('isEnableSelfGrading', false);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {UUID} classId
   */
  classId: null,

  /**
   * @property {UUID} classId
   */
  courseId: null,

  /**
   * @property {UUID} classId
   */
  unitId: null,

  /**
   * @property {UUID} classId
   */
  lessonId: null,

  /**
   * @property {UUID} userId
   */
  userId: Ember.computed.alias('session.userId'),

  /**
   * @property {Number} oaTimespentHour
   */
  oaTimespentHour: 0,

  /**
   * @property {Number} oaTimespentMinute
   */
  oaTimespentMinute: 0,

  /**
   * @property {Boolean} isTimespentExpanded
   */
  isTimespentExpanded: true,

  /**
   * @property {Number} timespentInMilliSec
   */
  timespentInMilliSec: Ember.computed(
    'oaTimespentHour',
    'oaTimespentMinute',
    function() {
      const component = this;
      let hour = component.get('oaTimespentHour') || 0;
      let minute = component.get('oaTimespentMinute') || 0;
      return getTimeInMillisec(hour, minute);
    }
  ),

  /**
   * @property {Number} timespentInMilliSecCopy
   * Property for copied version of timespent in millisec
   */
  timespentInMilliSecCopy: 0,

  /**
   * @property {Boolean} isEnableSaveTimespent
   */
  isEnableSaveTimespent: Ember.computed('timespentInMilliSec', function() {
    const component = this;
    const timespentInMilliSec = component.get('timespentInMilliSec');
    const timespentInMilliSecCopy = component.get('timespentInMilliSecCopy');
    return (
      timespentInMilliSec > timespentInMilliSecCopy &&
      component.validateOATimespent()
    );
  }),

  /**
   * @property {Boolean} isPreview
   * Property to show the player in read only mode or not
   */
  isPreview: false,

  /**
   * @property {String} contentSource
   * Assign player event source as based on caContentId property
   */
  contentSource: Ember.computed('caContentId', function() {
    const component = this;
    const caContentId = component.get('caContentId');
    return caContentId
      ? PLAYER_EVENT_SOURCE.DAILY_CLASS
      : PLAYER_EVENT_SOURCE.COURSE_MAP;
  }),

  /**
   * @property {Boolean} isShowCompletionConfirmation
   * Property to check whether to show or not the completeion confirmation popup
   */
  isShowCompletionConfirmation: false,

  /**
   * @property {Boolean} isOaCompleted
   * Property to evaluate whether the OA is completed or not
   */
  isOaCompleted: false,
  /**
   * @property {Boolean} isStudent
   */
  isStudent: Ember.computed.equal('session.role', ROLES.STUDENT),
  /**
   * property used to show student title
   */
  studentTitle: ROLES.STUDENT,
  /**
   * property used to show teacher title
   */
  teacherTitle: ROLES.TEACHER,
  /**
   * @property {studentActivityReferences[]} List of user reference details
   */
  studentActivityReferences: Ember.computed(
    'offlineActivity.references',
    function() {
      let reference = this.get('offlineActivity.references');
      if (reference && reference.length) {
        let filtercontent = reference.filterBy('userType', ROLES.STUDENT);
        return Ember.Object.create({
          references: filtercontent
        });
      }
      return {};
    }
  ),
  /**
   * @property {teacherActivityReferences[]} List of teacher reference details
   */
  teacherActivityReferences: Ember.computed(
    'offlineActivity.references',
    function() {
      let reference = this.get('offlineActivity.references');
      if (reference && reference.length) {
        let filtercontent = reference.filterBy('userType', ROLES.TEACHER);
        return Ember.Object.create({
          references: filtercontent
        });
      }
      return {};
    }
  ),
  /**
   * @property {UUID} oaId
   * Property for active Offline Activity UUID
   */
  oaId: Ember.computed.alias('offlineActivity.id'),

  /**
   * @property {Boolean} isEnableCompletionButton
   * Property to check whether to enable or not the mark complete button
   */
  isEnableCompletionButton: Ember.computed(
    'activityTasks.@each.isAddedMandatorySubmission',
    'activityTasks.@each.isTaskSubmitted',
    'activityTasks',
    function() {
      const component = this;
      const activityTasks = component.get('activityTasks') || Ember.A([]);
      if (activityTasks && activityTasks.length > 0) {
        const isInCompleteTaskAvailable = activityTasks.filter(
          task => !task.isAddedMandatorySubmission && task.isEvidenceRequired
        );
        const isUnSubmittedTaskAvailable = activityTasks.filter(
          task => !task.isTaskSubmitted && task.isEvidenceRequired
        );
        let enableCompletionButton = !(
          isInCompleteTaskAvailable.length || isUnSubmittedTaskAvailable.length
        );
        return enableCompletionButton;
      } else {
        return false;
      }
    }
  ),

  /**
   * @property {String} timeZone
   */
  timeZone: Ember.computed(function() {
    return moment.tz.guess() || null;
  }),

  /**
   * @property {Boolean} isEnableSelfGrading
   * Property to enable/disable self grading flow
   */
  isEnableSelfGrading: Ember.computed(
    'isSelfGradingDone',
    'isOaCompleted',
    function() {
      const component = this;
      return (
        !component.get('isSelfGradingDone') && component.get('isOaCompleted')
      );
    }
  ),

  /**
   * @property {Boolean} isSelfGradingDone
   * Property to check whether self grading is done or not
   */
  isSelfGradingDone: false,

  /**
   * @property {Array} studentRubric
   * Property will contain attached student rubric item
   */
  studentRubric: Ember.computed.filterBy(
    'offlineActivity.rubric',
    'grader',
    'Self'
  ),

  /**
   * @property {Array} teacherRubric
   * Property will contain attached teacher rubric item
   */
  teacherRubric: Ember.computed.filterBy(
    'offlineActivity.rubric',
    'grader',
    'Teacher'
  ),

  /**
   * @property {Boolean} isCourseMapGrading
   * Property to determine whether it's a course map grading or CA
   */
  isCourseMapGrading: Ember.computed.equal(
    'contentSource',
    PLAYER_EVENT_SOURCE.COURSE_MAP
  ),

  /**
   * @property {Boolean} isShowOaSelfGrading
   * Property to show/hide OA grading container
   */
  isShowOaSelfGrading: Ember.computed(
    'activityTasks',
    'isOaCompleted',
    function() {
      const component = this;
      return (
        component.get('activityTasks.length') && component.get('isOaCompleted')
      );
    }
  ),

  /**
   * @property {Object} selfGradeItemContext
   * Property for OA's grading context
   */
  selfGradeItemContext: Ember.computed(function() {
    const component = this;
    const classId = component.get('classId');
    const content = component.get('offlineActivity');
    const contentSource = component.get('contentSource');
    const contentType = CONTENT_TYPES.OFFLINE_ACTIVITY;
    return Ember.Object.create({
      classId,
      content,
      contentType,
      contentSource,
      dcaContentId: component.get('caContentId')
    });
  }),

  /**
   * @property {Array} itemsToGrade
   * Property for list of items needs to be graded
   */
  itemsToGrade: Ember.computed('selfGradeItemContext', function() {
    return Ember.A([this.get('selfGradeItemContext')]);
  }),

  isParentSubmit: false,

  tiggerAction: false,

  triggerObserver: Ember.observer('tiggerAction', function() {
    if (this.get('tiggerAction')) {
      this.send('onCompleteSubmission');
    }
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadTaskSubmissionData
   * Method to load student submitted oa task data
   */
  loadTaskSubmissionData() {
    const component = this;
    component.set('isLoading', true);
    return Ember.RSVP.hash({
      tasksSubmissions: !component.get('isPreview')
        ? component.get('offlineActivitySubmissions') ||
          component.fetchTasksSubmissions()
        : null
    }).then(({ tasksSubmissions }) => {
      if (!component.isDestroyed) {
        let activityTasks = component.get('offlineActivity.tasks');
        if (tasksSubmissions) {
          let studentTasksSubmissions = tasksSubmissions.get('tasks');
          let oaRubrics = tasksSubmissions.get('oaRubrics');
          let submittedTimespentInMillisec = oaRubrics
            ? oaRubrics.get('studentGrades.timeSpent')
            : 0;
          studentTasksSubmissions.map(taskSubmission => {
            let activityTask = activityTasks.findBy(
              'id',
              taskSubmission.get('taskId')
            );

            if (activityTask) {
              let activityTaskSubmissions = taskSubmission.get('submissions');
              activityTask.set(
                'studentTaskSubmissions',
                activityTaskSubmissions
              );
              if (activityTaskSubmissions.length) {
                let taskSubmissionText = activityTaskSubmissions.findBy(
                  'submissionType',
                  'free-form-text'
                );
                activityTask.set(
                  'submissionText',
                  taskSubmissionText
                    ? taskSubmissionText.get('submissionInfo')
                    : null
                );
              }
            }
          });
          if (submittedTimespentInMillisec) {
            component.set(
              'timespentInMilliSecCopy',
              submittedTimespentInMillisec
            );
            component.formatMillisecondsToHourMinute(
              formatTimeInMilliSec(submittedTimespentInMillisec)
            );
          }
          if (tasksSubmissions.get('oaRubrics.studentGrades')) {
            let studentGrades = tasksSubmissions.get('oaRubrics.studentGrades');
            component.set('isSelfGradingDone', !!studentGrades.get('grader'));
          }
          component.set('offlineActivitySubmissions', tasksSubmissions);
        }
        component.set('activityTasks', activityTasks);
        component.set('isLoading', false);
      }
    });
  },

  /**
   * @function doCheckOaCompleted
   * Method to check whether the OA is completed by the student or not
   */
  doCheckOaCompleted() {
    const component = this;
    return component.fetchOaCompletedStudents().then(function(students) {
      const userId = component.get('userId');
      let isCompletedByStudent = students.includes(userId);
      component.set('isOaCompleted', isCompletedByStudent);
    });
  },

  /**
   * @function fetchTasksSubmissions
   * Method to fetch student submitted oa task data
   */
  fetchTasksSubmissions() {
    const component = this;
    const classId = component.get('classId');
    const oaId = component.get('caContentId') || component.get('oaId');
    const userId = component.get('userId');
    let dataParam = undefined;
    if (component.get('isStudyPlayer')) {
      const courseId = component.get('courseId');
      const unitId = component.get('unitId');
      const lessonId = component.get('lessonId');
      dataParam = {
        courseId,
        unitId,
        lessonId
      };
    }
    return component
      .get('oaAnalyticsService')
      .getSubmissionsToGrade(classId, oaId, userId, dataParam);
  },

  /**
   * @function formatMillisecondsToHourMinute
   * Method to extract hour and minute from fullstring
   */
  formatMillisecondsToHourMinute(timeString) {
    const component = this;
    let hour = 0;
    let minute = 0;
    if (timeString) {
      let splittedTime = timeString.split(' ');
      let firstHalfString = splittedTime[0];
      let secodHalfString = splittedTime[1];
      if (firstHalfString.includes('h')) {
        hour = firstHalfString.slice(0, -1);
      } else if (firstHalfString.includes('m')) {
        minute = firstHalfString.slice(0, -1);
      }
      if (secodHalfString.includes('m')) {
        minute = secodHalfString.slice(0, -1);
      }
    }
    component.set('oaTimespentHour', hour);
    component.set('oaTimespentMinute', minute);
  },

  /**
   * @function validateOATimespent
   * Method to validate OA timespent
   */
  validateOATimespent() {
    const component = this;
    let isValidTimeSpent = false;
    let hour = component.get('oaTimespentHour') || 0;
    let minute = component.get('oaTimespentMinute') || 0;
    if (hour || minute) {
      isValidTimeSpent =
        hour > 0 ? minute >= 0 && minute < 60 : minute > 0 && minute <= 60;
    }
    return isValidTimeSpent;
  },

  /**
   * @function markOACompleted
   * @return {Promise}
   * Method to update the OA status for active student
   */
  markOACompleted() {
    const component = this;
    const classId = component.get('classId');
    const caContentId = component.get('caContentId');
    const oaId = component.get('oaId');
    const contentSource = component.get('contentSource');
    const studentId = component.get('userId');
    const studentRubric = component.get('studentRubric').objectAt(0) || null;
    const oaData = {
      class_id: classId,
      oa_id: oaId,
      content_source: contentSource,
      student_id: studentId,
      marked_by: ROLES.STUDENT,
      path_id: 0,
      path_type: null,
      time_zone: component.get('timeZone'),
      student_rubric_id: null
    };
    if (studentRubric) {
      oaData.student_rubric_id = studentRubric.get('id');
    }
    if (component.get('isStudyPlayer')) {
      oaData.course_id = component.get('courseId');
      oaData.unit_id = component.get('unitId');
      oaData.lesson_id = component.get('lessonId');
    } else {
      oaData.oa_dca_id = parseInt(caContentId);
    }
    return component.get('oaService').updateOACompleted(oaData);
  },

  /**
   * @function fetchOaCompletedStudents
   * @return {Promise}
   * Method to get list of students who have marked an OA as completed
   */
  fetchOaCompletedStudents() {
    const component = this;
    const classId = component.get('classId');
    const oaId = component.get('oaId');
    //content Id will be undefined to treat it as a CM request
    const caContentId = component.get('caContentId') || undefined;
    const courseId = component.get('courseId');
    const unitId = component.get('unitId');
    const lessonId = component.get('lessonId');
    let dataParam = null;
    if (component.get('isStudyPlayer')) {
      dataParam = {
        courseId,
        unitId,
        lessonId
      };
    }
    return component
      .get('oaAnalyticsService')
      .getOaCompletedStudents(classId, oaId, caContentId, dataParam);
  },

  afterRender: function() {
    const component = this;
    const activityTasks = component.get('offlineActivity.tasks') || Ember.A([]);
    if (activityTasks && activityTasks.length > 0) {
      activityTasks.map(act => act.set('focus', false));
      activityTasks.get('firstObject').set('focus', true); //first task to focus
    }
  },

  /**
   * @function submitTaskDetails
   * Method to send student task submissions into Analytics
   */
  submitTaskDetails(taskSubmissionPayload) {
    const component = this;
    component.get('oaService').oaTaskSubmissions(taskSubmissionPayload);
  },

  /**
   * @function createTaskSubmissionPayload
   * Method to create task submission request payload
   */
  createTaskTimeSubmissionPayload() {
    const component = this;
    const userId = component.get('userId');
    const contentSource = component.get('contentSource');
    const classId = component.get('classId');
    const caContentId = component.get('caContentId');
    let taskSubmissions = [];
    let timespentInMilliSec = component.get('timespentInMilliSec');

    let submissionPayload = {
      student_id: userId,
      class_id: classId,
      oa_id: component.get('oaId'),
      content_source: contentSource,
      submissions: taskSubmissions,
      time_spent: timespentInMilliSec
    };
    if (component.get('isStudyPlayer')) {
      submissionPayload.course_id = component.get('courseId');
      submissionPayload.unit_id = component.get('unitId');
      submissionPayload.lesson_id = component.get('lessonId');
    } else {
      submissionPayload.oa_dca_id = parseInt(caContentId);
    }
    return submissionPayload;
  }
});
