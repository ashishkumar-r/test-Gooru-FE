import Ember from 'ember';
import RubricGrade from 'gooru-web/models/rubric/rubric-grade';
import RubricCategoryScore from 'gooru-web/models/rubric/grade-category-score';
import { PLAYER_EVENT_SOURCE, CONTENT_TYPES } from 'gooru-web/config/config';
import {
  downloadAllSubmision,
  setDownloadPathForUrl
} from 'gooru-web/utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['grade', 'backdrop-pull-ups', 'oa-grading-report'],

  classNameBindings: ['isInlineGrading:inline-grading'],

  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @requires service:api-sdk/offline-activity-analytics
   */
  oaAnaltyicsService: Ember.inject.service(
    'api-sdk/offline-activity/oa-analytics'
  ),

  /**
   * @requires service:api-sdk/class-activity
   */
  classActivityService: Ember.inject.service('api-sdk/class-activity'),

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  rubricService: Ember.inject.service('api-sdk/rubric'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  session: Ember.inject.service('session'),

  offlineActivityService: Ember.inject.service(
    'api-sdk/offline-activity/offline-activity'
  ),
  // -------------------------------------------------------------------------
  // Properties

  /**
   * Content of this OA grade item.
   * @type {Object}
   */
  content: Ember.computed.alias('context.content'),

  /**
   * Content Id of this OA grade item.
   * @type {String}
   */
  activityId: Ember.computed.alias('content.id'),

  /**
   * Tasks of this OA grade item.
   * @type {Array}
   */
  tasks: Ember.computed.alias('content.tasks'),

  /**
   * Rubrics of this OA grade item.
   * @type {Object}
   */
  rubric: Ember.computed.alias('content.rubric'),

  /**
   * Selected Student to grade
   * @type {Object}
   */
  student: Ember.Object.create({}),

  /**
   * Selected Student id
   * @type {Object}
   */
  studentId: Ember.computed('student', function() {
    return this.get('student.id');
  }),

  /**
   * Maintains the value of selected user index.
   * @return {Number}
   */
  currentStudentIndex: Ember.computed('studentId', 'users', function() {
    let studentIndex = 1;
    let users = this.get('users');
    if (users) {
      let studentId = this.get('studentId');
      let user = users.findBy('id', studentId);
      studentIndex = users.indexOf(user) + 1;
    }
    return studentIndex;
  }),

  /**
   * Maintains the teacher rubric
   * @return {Object}
   */
  teacherRubric: Ember.computed('studentId', 'users', function() {
    return this.get('student.teacherRubric');
  }),

  /**
   * Maintains the student rubric
   * @return {Object}
   */
  studentRubric: Ember.computed('studentId', 'users', function() {
    return this.get('student.studentRubric');
  }),

  /**
   * Maintains the teacher rubric categories
   * @return {Object}
   */
  teacherRubricCategories: Ember.computed('teacherRubric', function() {
    return this.get('teacherRubric.categories')
      ? this.get('teacherRubric.categories')
      : [];
  }),

  /**
   * Maintains the student rubric categories
   * @return {Object}
   */
  studentRubricCategories: Ember.computed('studentRubric', function() {
    return this.get('studentRubric.categories')
      ? this.get('studentRubric.categories')
      : [];
  }),

  /**
   * Calculate rubric total points
   * @type {Number}
   */
  totalRubricPoints: Ember.computed(
    'teacherRubricCategories',
    'studentRubricCategories',
    function() {
      let component = this;
      let totalRubricPoints = 0;
      let categories = component.get('isTeacher')
        ? component.get('teacherRubricCategories')
        : component.get('studentRubricCategories');
      if (categories) {
        categories.forEach(category => {
          if (category.get('allowsLevels') && category.get('allowsScoring')) {
            totalRubricPoints += category.get('totalPoints');
          }
        });
      }
      return totalRubricPoints;
    }
  ),

  /**
   * Calculate user rubric total points
   * @type {Number}
   */
  totalUserRubricPoints: Ember.computed(
    'studentId',
    'teacherRubricCategories.@each.selected',
    'teacherRubricCategories.@each.scoreInPrecentage',
    'studentRubricCategories.@each.selected',
    'studentRubricCategories.@each.scoreInPrecentage',
    function() {
      let component = this;
      let totalUserRubricPoints = 0;
      let categories = component.get('isTeacher')
        ? component.get('teacherRubricCategories')
        : component.get('studentRubricCategories');
      if (categories) {
        categories.forEach(category => {
          if (category.get('allowsLevels') && category.get('allowsScoring')) {
            let level = category.get('levels').findBy('selected', true);
            if (level) {
              totalUserRubricPoints += parseInt(level.get('score'));
            }
          }
        });
      }
      return totalUserRubricPoints;
    }
  ),

  /**
   * Calculate rubric total score.
   * @return {Number}
   */
  userRubricScore: Ember.computed(
    'totalRubricPoints',
    'totalUserRubricPoints',
    function() {
      let score = -1;
      let totalRubricPoints = this.get('totalRubricPoints');
      let totalUserRubricPoints = this.get('totalUserRubricPoints');
      if (totalUserRubricPoints > 0) {
        score = Math.floor((totalUserRubricPoints / totalRubricPoints) * 100);
      }
      return score;
    }
  ),

  /**
   * Calculate grade total score.
   * @return {Number}
   */
  userGradeScore: Ember.computed(
    'teacherRubric.studentScore',
    'studentRubric.studentScore',
    function() {
      let score = -1;
      let component = this;
      let gradeMaxScore = component.get('content.maxScore');
      let studentScore = component.get('isTeacher')
        ? component.get('teacherRubric.studentScore')
        : component.get('studentRubric.studentScore');
      if (studentScore > 0) {
        score = Math.floor((studentScore / gradeMaxScore) * 100);
      }
      return score;
    }
  ),

  /**
   * Read student self graded score
   * @return {Number}
   */
  studentSelfGrade: Ember.computed('studentRubric', function() {
    let component = this;
    let score = 0;
    let selfGrade = component.get('studentRubric');
    if (selfGrade) {
      let gradeMaxScore = selfGrade.get('maxScore');
      let studentScore = selfGrade.get('studentScore');
      if (studentScore > 0) {
        score = Math.floor((studentScore / gradeMaxScore) * 100);
      }
    }
    return score;
  }),

  /**
   * Maintains the state OA has scoring or not for teacher | student
   * @return {Number}
   */
  isScoring: Ember.computed('teacherRubric', 'studentRubric', function() {
    let component = this;
    return component.get('isTeacher')
      ? component.get('teacherRubric.scoring') &&
          component.get('content.maxScore')
      : component.get('studentRubric.scoring') &&
          component.get('content.maxScore');
  }),

  /**
   * @property {Boolean} isInlineGrading
   * Property to determine whether doing inline grading (inside player) or not
   */
  isInlineGrading: false,

  isShowStudentList: false,

  userEnteredValue: '',

  isShowClear: false,

  filteredList: Ember.computed('users', function() {
    return this.get('users');
  }),

  disableOnClickPreNext: false,

  /**
   * @property {Object} offlineActivitySubmissions
   * Property for current OA submissions
   */
  offlineActivitySubmissions: null,

  /**
   * @property {Boolean} isTeacherGradingDone
   * Property to determine whether the teacher graded the student or not
   */
  isTeacherGradingDone: Ember.computed(
    'offlineActivitySubmissions.oaRubrics',
    function() {
      const component = this;
      const offlineActivitySubmissions = component.get(
        'offlineActivitySubmissions'
      );
      return offlineActivitySubmissions
        ? !!offlineActivitySubmissions.get('oaRubrics.teacherGrades')
        : false;
    }
  ),

  /**
   * @property {Boolean} isStudentGradingDone
   * Property to determine whether the student graded
   */
  isStudentGradingDone: Ember.computed(
    'offlineActivitySubmissions.oaRubrics',
    function() {
      const component = this;
      const offlineActivitySubmissions = component.get(
        'offlineActivitySubmissions'
      );
      return offlineActivitySubmissions
        ? !!offlineActivitySubmissions.get('oaRubrics.studentGrades.grader')
        : false;
    }
  ),

  isShowDownloadSubmission: Ember.computed(
    'offlineActivitySubmissions.tasks.@each.submissions',
    function() {
      const component = this;
      if (component.get('offlineActivitySubmissions.tasks')) {
        this.get('offlineActivitySubmissions.tasks').forEach(task => {
          if (task.submissions) {
            const submissionData = task.submissions.map(item => {
              return item.submissionType === 'uploaded';
            });
            component.set('submissionData', submissionData);
          }
        });
        if (component.get('submissionData')) {
          const isShowsubmissionData = component
            .get('submissionData')
            .contains(true);
          return isShowsubmissionData;
        }
      }
    }
  ),
  /**
   * @property {Boolean} isLeftPanelExpanded
   * Property to check whether the left panel is in expanded state or not
   */
  isLeftPanelExpanded: false,

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when the user invoke the pull up.
     **/
    onPullUpClose(closeAll) {
      this.closePullUp(closeAll);
    },

    onClickPrev() {
      let component = this;
      component.set('disableOnClickPreNext', true);
      component
        .$(
          '.oa-grade-students-carousel #oa-grade-students-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let users = component.get('users');
      let selectedElement = component.$(
        '.oa-grade-students-carousel #oa-grade-students-carousel-wrapper .item.active'
      );
      let currentIndex = selectedElement.data('item-index');
      let selectedIndex = selectedElement.data('item-index') - 1;
      if (currentIndex === 0) {
        selectedIndex = users.length - 1;
      }
      let user = users.objectAt(selectedIndex);
      component.set('studentId', user.get('id'));
      component.set('student', user);
      component
        .$('.oa-grade-students-carousel #oa-grade-students-carousel-wrapper')
        .carousel('prev');
      component.loadData();
    },

    onClickNext() {
      let component = this;
      component.set('disableOnClickPreNext', true);
      component
        .$(
          '.oa-grade-students-carousel #oa-grade-students-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let users = component.get('users');
      let selectedElement = component.$(
        '.oa-grade-students-carousel #oa-grade-students-carousel-wrapper .item.active'
      );
      let currentIndex = selectedElement.data('item-index');
      let selectedIndex = currentIndex + 1;
      if (users.length - 1 === currentIndex) {
        selectedIndex = 0;
      }
      let user = users.objectAt(selectedIndex);
      component.set('studentId', user.get('id'));
      component.set('student', user);
      component
        .$('.oa-grade-students-carousel #oa-grade-students-carousel-wrapper')
        .carousel('next');
      component.loadData();
    },

    /**
     * Action get triggered when rubric attachment preview got close
     */
    filePreviewClose(user) {
      this.$(`.rubric-file-preview-container.${user}`).fadeOut('slow');
    },

    /**
     * Action get triggered when rubric attachment preview got open
     */
    filePreviewOpen(user) {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_CA_ITEM_GRADE_OFFLINE_FILE_ATTACHED
      );
      this.$(`.rubric-file-preview-container.${user}`)
        .css('visibility', 'visible')
        .hide()
        .fadeIn('slow');
    },

    saveGrade() {
      this.saveUserGrade();
    },

    //Action triggered when clicking on the right panel header
    // It's only enabled for mobile view
    onTogglePanel() {
      // NOTE hardcoded pixer value represent toggle header.
      const component = this;
      let top = '130px';
      if (component.get('isLeftPanelExpanded')) {
        top = `${component.$().height() - 41}px`;
      }
      component.$('.left-panel').animate(
        {
          top
        },
        400
      );
      component.toggleProperty('isLeftPanelExpanded');
    },

    onClickClear() {
      this.set('isShowStudentList', false);
    },

    onClickDropdown() {
      this.set('isShowStudentList', true);
    },

    onClickStudent(currentUser) {
      let component = this;
      component.set('student', currentUser);
      component.set('studentId', currentUser.get('id'));
      component.set('isShowStudentList', false);
      component.send('onClearSearch');
      component.loadData();
    },

    onSearch(e) {
      const controller = this;
      controller.set('userEnteredValue', e.target.value);
      if (e.target.value) {
        controller.set('isShowClear', true);
      } else {
        controller.set('isShowClear', false);
      }
      this.send('searchFilter');
    },
    onClickSearch() {
      const controller = this;
      controller.set('isShowClear', true);
      controller.send('searchFilter');
    },

    onClearSearch() {
      const controller = this;
      controller.set('isShowClear', false);
      controller.set('userEnteredValue', '');
      this.send('searchFilter');
    },

    searchFilter() {
      const controller = this;
      let inputValue = controller.get('userEnteredValue');
      let filteredList = controller.get('users');
      if (inputValue) {
        let regexp = new RegExp(inputValue, 'gi');
        var filtered = filteredList.filter(function(student) {
          return (
            student.get('firstName').match(regexp) ||
            student.get('lastName').match(regexp)
          );
        });
        controller.set('filteredList', filtered);
      } else {
        controller.set('filteredList', filteredList);
      }
    },
    onClickDownload() {
      let uploadUrls = [];
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_CA_ITEM_GRADE_OFFLINE_SUBMISSION
      );
      this.get('studentUploadData').filter(studentData => {
        studentData.tasks.forEach(task => {
          task.submissions.map(studentTask => {
            if (studentTask.submissionType === 'uploaded') {
              const fileName =
                studentTask.submissionInfo.indexOf(
                  this.get('session.cdnUrls.content')
                ) !== -1
                  ? studentTask.submissionInfo
                  : `${this.get('session.cdnUrls.content')}${
                    studentTask.submissionInfo
                  }`;
              const fileItem = {
                fileUrl: setDownloadPathForUrl(fileName),
                orginalFileName: studentTask.submissionOriginalFileName,
                userName: studentData.userName
              };
              uploadUrls.push(fileItem);
              this.set('taskUploadUrls', uploadUrls);
            }
          });
        });
      });
      if (this.get('taskUploadUrls')) {
        const filename = `${this.get('content.format')}_${this.get(
          'content.title'
        )}`;
        downloadAllSubmision(this.get('taskUploadUrls'), filename, null, true);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Events

  /**
   * Function to triggered once when the component element is first rendered.
   */
  didInsertElement() {
    const component = this;
    if (!component.get('isInlineGrading')) {
      component.openPullUp();
    }
    component.initialize();
  },

  willDestroyElement() {
    const component = this;
    component.set('isInlineGrading', false);
  },

  didDestroyElement() {
    this.handleAppContainerScroll();
  },

  /**
   * Function to triggered once when the component element is after rendered
   */
  didRender() {
    const component = this;
    component.handleRubricTooltip();
    component.handleAppContainerScroll();
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  // -------------------------------------------------------------------------
  //Methods

  handleRubricTooltip() {
    const component = this;
    component.$().on('click', function(e) {
      if (!component.$(e.target).hasClass('grade-info-popover')) {
        Ember.$('.popover').hide();
      }
    });
  },

  initialize() {
    let component = this;
    return Ember.RSVP.hash({
      users: component.get('isTeacher') ? component.getGradingStudentList() : []
    })
      .then(({ users }) => {
        if (!component.isDestroyed) {
          let studentId = component.get('studentId');
          if (!studentId) {
            let student = users.get('firstObject');
            component.set('student', student);
            studentId = student.get('id');
          } else {
            let student = component.get('student');
            student.set('id', studentId);
            users.pushObject(student);
          }
          return Ember.RSVP.hash({
            submission: component.get('offlineActivitySubmissions')
              ? component.get('offlineActivitySubmissions')
              : component.fetchStudentSubmissions(),
            users
          });
        }
      })
      .then(({ submission, users }) => {
        if (!component.get('isDestroyed')) {
          users.map(user => {
            user.set('isGraded', false);
            let studentRubric = component
              .get('rubric')
              .findBy('isTeacherRubric', false);
            let newStudentRubric = studentRubric
              ? studentRubric.copy()
              : studentRubric;
            user.set(
              'studentRubric',
              component.createRubricGrade(newStudentRubric, user)
            );
            let teacherRubric = component
              .get('rubric')
              .findBy('isTeacherRubric', true);
            let newTeacherRubric = teacherRubric
              ? teacherRubric.copy()
              : teacherRubric;
            user.set(
              'teacherRubric',
              component.createRubricGrade(newTeacherRubric, user)
            );
          });
          component.set('users', users);
          component.set('offlineActivitySubmissions', submission);
          let studentGrade = submission.get('oaRubrics.studentGrades');
          let teacherGrade = submission.get('oaRubrics.teacherGrades');
          let taskSubmission = submission.get('tasks');
          component.parseSubmissionGrade(
            studentGrade,
            teacherGrade,
            submission.get('sessionId')
          );
          component.parseStudentTaskSubmission(taskSubmission);
          component.set('isLoading', false);
          component.handleCarouselControl();
        }
        const context = component.get('context');
        const content = context.get('content');
        const contentId = context.get('dcaContentId') || content.get('id');
        const dataParam = {
          classId: context.get('classId'),
          oaId: contentId
        };
        const Ids = this.get('users').map(student => {
          return student.id;
        });
        dataParam.studentId = { students: Ids };
        let submissionPromise;
        if (component.get('isCourseMapGrading')) {
          dataParam.lessonId = content.lessonId;
          dataParam.unitId = content.unitId;
          dataParam.courseId = content.courseId;
          submissionPromise = component
            .get('offlineActivityService')
            .getBulkSubmission(dataParam);
        } else {
          submissionPromise = component
            .get('offlineActivityService')
            .getCABulkSubmission(dataParam);
        }
        if (submissionPromise) {
          submissionPromise.then(response => {
            const bulkUser = JSON.parse(response);
            bulkUser.students.map(res => {
              const userData = this.get('users').find(student => {
                return student.id === res.userId;
              });
              res.userName = userData.username;
            });
            component.set('studentUploadData', bulkUser.students);
          });
        }
      });
  },

  /**
   * Method to set values of student self grade and teacher grade for a selected student
   * @param  {Object} studentGrade
   * @param  {Object} teacherGrade
   */
  parseSubmissionGrade(studentGrade, teacherGrade, sessionId) {
    let component = this;
    let student = component.get('student');
    student.set('sessionId', sessionId);
    if (studentGrade) {
      let studentRubric = student.get('studentRubric');
      component.parseRubricCategories(studentGrade, studentRubric);
      if (studentGrade.get('maxScore')) {
        studentRubric.set('isSelfGraded', true);
      }
    }

    if (teacherGrade) {
      student.set('isGraded', true);
      let teacherRubric = student.get('teacherRubric');
      component.parseRubricCategories(teacherGrade, teacherRubric);
    }
  },

  parseRubricCategories(grade, rubric) {
    let categories = rubric.get('categories') ? rubric.get('categories') : [];
    let gradedCategories = grade.get('categoryGrade')
      ? grade.get('categoryGrade')
      : [];
    if (grade && gradedCategories.length > 0) {
      categories.map((category, index) => {
        let gradedCategory = gradedCategories.objectAt(index);
        let levels = category.get('levels');
        if (levels) {
          if (category.get('allowsLevels') && category.get('allowsScoring')) {
            levels = levels.sortBy('score');
            levels.map((level, index) => {
              let score =
                index > 0 ? index * Math.floor(100 / (levels.length - 1)) : 10;
              level.set('scoreInPrecentage', score);
              if (
                level.get('score') === gradedCategory.get('levelScore') &&
                level.get('name') === gradedCategory.get('levelObtained')
              ) {
                category.set('scoreInPrecentage', score);
              }
            });
          }
          let levelObtained = levels.findBy(
            'name',
            gradedCategory.get('levelObtained')
          );
          if (levelObtained) {
            levelObtained.set('selected', true);
          }
          category.set('comment', gradedCategory.get('levelComment'));
          category.set('levels', levels);
        }
      });
    }
    let score = grade.get('score') ? grade.get('score') : 0;
    rubric.set('comment', grade.get('overallComment'));
    rubric.set('studentScore', score);
  },

  /**
   * Method to parse student lavel task submission
   * @param  {Object} tasksSubmission
   */
  parseStudentTaskSubmission(tasksSubmission) {
    let component = this;
    let tasks = component.get('tasks');
    let activityTasks = Ember.A([]);
    tasks.map(task => {
      let newTask = component.createNewObjectForTask(task);
      let studentTaskSubmissions = tasksSubmission.findBy(
        'taskId',
        task.get('id')
      );
      if (studentTaskSubmissions) {
        let activityTaskSubmissions = studentTaskSubmissions.get('submissions');
        newTask.set('studentTaskSubmissions', activityTaskSubmissions);
        let taskSubmissionText = activityTaskSubmissions.findBy(
          'submissionType',
          'free-form-text'
        );
        newTask.set(
          'submissionText',
          taskSubmissionText ? taskSubmissionText.get('submissionInfo') : null
        );
      }
      activityTasks.pushObject(newTask);
    });
    component.set('activityTasks', activityTasks);
  },

  /**
   * Method to create new object instance for task level
   * @param  {Object} tasksSubmission
   */
  createNewObjectForTask(task) {
    return Ember.Object.create({
      title: task.get('title'),
      oaId: task.get('oaId'),
      id: task.get('id'),
      description: task.get('description'),
      submissionCount: task.get('submissionCount'),
      oaTaskSubmissions:
        task.get('oaTaskSubmissions').length > 0
          ? task.get('oaTaskSubmissions').map(item => {
            return Ember.Object.create({
              id: item.id,
              taskSubmissionSubType: item.taskSubmissionSubType,
              taskSubmissionType: item.taskSubmissionType,
              oaTaskId: item.oaTaskId
            });
          })
          : []
    });
  },

  /**
   * Method to save user grade by a teacher
   */
  saveUserGrade() {
    let component = this;
    const isTeacher = component.get('isTeacher');
    let userGrade = isTeacher
      ? component.get('teacherRubric')
      : component.get('studentRubric');
    let grader = isTeacher ? 'teacher' : 'self';
    let categories = isTeacher
      ? component.get('teacherRubricCategories')
      : component.get('studentRubricCategories');
    let context = component.get('context');
    let currentStudent = component.get('student');
    let contentSource = component.get('isCourseMapGrading')
      ? PLAYER_EVENT_SOURCE.COURSE_MAP
      : PLAYER_EVENT_SOURCE.DAILY_CLASS;
    if (isTeacher) {
      userGrade.set('sessionId', currentStudent.get('sessionId'));
      userGrade.set('graderId', component.get('session.userId'));
    }
    let maxScore = isTeacher
      ? component.get('content.maxScore')
      : userGrade
        ? userGrade.get('maxScore')
        : null;
    userGrade.set('maxScore', maxScore);
    let categoriesScore = Ember.A([]);
    userGrade.set('classId', context.get('classId'));
    userGrade.set('dcaContentId', context.get('dcaContentId'));
    userGrade.set('collectionId', context.get('content.id'));
    userGrade.set('contentSource', contentSource);
    userGrade.set('collectionType', CONTENT_TYPES.OFFLINE_ACTIVITY);
    categories.forEach(category => {
      let level = null;
      if (category.get('allowsLevels')) {
        level = category.get('levels').findBy('selected', true);
        categoriesScore.pushObject(
          component.createRubricCategory(category, level)
        );
      } else if (category.get('comment')) {
        categoriesScore.pushObject(
          component.createRubricCategory(category, level)
        );
      } else {
        categoriesScore.pushObject(component.createRubricCategory(category));
      }
    });
    userGrade.set('grader', grader);
    userGrade.set('categoriesScore', categoriesScore);
    userGrade.set('courseId', context.get('content.courseId') || null);
    userGrade.set('unitId', context.get('content.unitId') || null);
    userGrade.set('lessonId', context.get('content.lessonId') || null);
    userGrade.set('isCourseMapGrading', component.get('isCourseMapGrading'));
    component.set('isStudentGradingDone', true);
    component
      .get('oaAnaltyicsService')
      .submitOAGrade(userGrade)
      .then(function() {
        currentStudent.set('isGraded', true);
        component.slideToNextUser();
      });
  },

  /**
   * Method to create rubric category
   * @param  {Object} category
   * @param  {Object} level
   */
  createRubricCategory(category, level) {
    let rubricCategory = RubricCategoryScore.create(
      Ember.getOwner(this).ownerInjection(),
      {
        title: category.get('title')
      }
    );
    rubricCategory.set('levelMaxScore', null);
    if (level) {
      rubricCategory.set('levelObtained', level.get('name'));
      if (category.get('allowsLevels') && category.get('allowsScoring')) {
        rubricCategory.set('levelScore', level.get('score'));
        rubricCategory.set('levelMaxScore', category.get('totalPoints'));
      }
    }
    rubricCategory.set('levelComment', category.get('comment'));
    return rubricCategory;
  },

  /**
   * Method to create rubric grade
   * @param  {Object} rubric
   * @param  {Object} user
   */
  createRubricGrade(rubric, user) {
    let component = this;
    return RubricGrade.create(Ember.getOwner(this).ownerInjection(), rubric, {
      comment: '',
      studentId: user.get('id'),
      classId: component.get('context.classId'),
      collectionId: component.get('context.dcaContentId'),
      createdDate: new Date(),
      studentScore: 0,
      maxScore: rubric ? rubric.get('maxScore') : null,
      scoring: !!rubric
    });
  },

  /**
   * Method to fetch submissions given by teacher and student
   */
  loadData() {
    let component = this;
    component.set('isLoading', true);
    component.fetchStudentSubmissions().then(submission => {
      let studentGrade = submission.get('oaRubrics.studentGrades');
      let teacherGrade = submission.get('oaRubrics.teacherGrades');
      let taskSubmission = submission.get('tasks');
      component.set('offlineActivitySubmissions', submission);

      component.parseSubmissionGrade(
        studentGrade,
        teacherGrade,
        submission.get('sessionId')
      );
      component.parseStudentTaskSubmission(taskSubmission);
      component.set('isLoading', false);
      component.set('disableOnClickPreNext', false);
      component.handleCarouselControl();
    });
  },

  /**
   * @function fetchStudentSubmissions
   * Method to fetch student OA submissions
   * @return {Promise}
   */
  fetchStudentSubmissions() {
    const component = this;
    const context = component.get('context');
    const content = context.get('content');
    const classId = context.get('classId');
    const contentId = context.get('dcaContentId') || content.get('id');
    const studentId = component.get('studentId');
    let requestParam = undefined;
    if (component.get('isCourseMapGrading')) {
      requestParam = {
        courseId: content.get('courseId'),
        unitId: content.get('unitId'),
        lessonId: content.get('lessonId')
      };
    }
    return component
      .get('oaAnaltyicsService')
      .getSubmissionsToGrade(classId, contentId, studentId, requestParam);
  },

  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    let component = this;
    component.$().animate(
      {
        bottom: '0'
      },
      400
    );
  },

  closePullUp() {
    let component = this;
    component.$().animate(
      {
        bottom: '-100%'
      },
      400,
      function() {
        component.sendAction('onClosePullUp');
        component.set('showPullUp', false);
      }
    );
  },

  /**
   * Method to handle container scroll
   */
  handleAppContainerScroll() {
    let activePullUpCount = Ember.$(document.body).find('.backdrop-pull-ups')
      .length;
    if (activePullUpCount > 0) {
      Ember.$(document.body).addClass('no-vertical-scroll');
    } else if (activePullUpCount === 0) {
      Ember.$(document.body).removeClass('no-vertical-scroll');
    }
  },

  /**
   * Method to slide to next user
   */
  slideToNextUser() {
    let component = this;
    let users = component.get('users').filterBy('isGraded', false);
    if (users.length > 0) {
      let studentId = component.get('studentId');
      let users = component.get('users');
      let selectedUser = users.findBy('id', studentId);
      let selectedIndex = users.indexOf(selectedUser);
      let rightNavElement = component.$(
        '#oa-grade-students-carousel-wrapper .carousel-control.right'
      );
      let leftNavElement = component.$(
        '#oa-grade-students-carousel-wrapper .carousel-control.left'
      );
      let nextUserIndex = 0;
      if (!rightNavElement.hasClass('in-active')) {
        nextUserIndex = selectedIndex + 1;
      } else if (!leftNavElement.hasClass('in-active')) {
        nextUserIndex = selectedIndex - 1;
      }
      let nextUser = users.objectAt(nextUserIndex);
      if (!nextUser) {
        nextUser = users.objectAt(0);
      }
      component.set('studentId', nextUser.get('id'));
      component.set('student', nextUser);
      component
        .$('.oa-grade-students-carousel  #oa-grade-students-carousel-wrapper')
        .carousel(nextUserIndex);
      component.loadData();
      component.handleCarouselControl();
    } else if (!component.get('isInlineGrading')) {
      component.$('.caught-up-container').show(400, function() {
        let itemsToGrade = component.get('itemsToGrade');
        if (itemsToGrade) {
          let contentId = component.get('content.id');
          let item = itemsToGrade.findBy('content.id', contentId);
          itemsToGrade.removeObject(item);
        }
        component.$().fadeOut(5000, function() {
          component.set('showPullUp', false);
          component.sendAction('refreshItem', component.get('context'));
        });
      });
    }
  },

  /**
   * Method to handle carousel
   */
  handleCarouselControl() {
    let component = this;
    let studentId = component.get('studentId');
    let users = component.get('users');
    let selectedUser = users.findBy('id', studentId);
    let currentIndex = users.indexOf(selectedUser);
    if (users.length - 1 === 0) {
      component
        .$(
          '.oa-grade-students-carousel #oa-grade-students-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
    } else {
      if (currentIndex === 0) {
        component
          .$(
            '.oa-grade-students-carousel #oa-grade-students-carousel-wrapper .carousel-control.left'
          )
          .addClass('in-active');
      } else {
        component
          .$(
            '.oa-grade-students-carousel #oa-grade-students-carousel-wrapper .carousel-control.left'
          )
          .removeClass('in-active');
      }
      if (currentIndex === users.length - 1) {
        component
          .$(
            '.oa-grade-students-carousel #oa-grade-students-carousel-wrapper .carousel-control.right'
          )
          .addClass('in-active');
      } else {
        component
          .$(
            '.oa-grade-students-carousel #oa-grade-students-carousel-wrapper .carousel-control.right'
          )
          .removeClass('in-active');
      }
    }
  },

  /**
   * @function getGradingStudentList
   * Method to get list of students to be graded
   * @return {Promise} studentList
   */
  getGradingStudentList() {
    const component = this;
    const classId = component.get('context.classId');
    const contentId =
      component.get('context.dcaContentId') ||
      component.get('context.content.id');
    const requestParam = {
      classId,
      type: 'oa'
    };
    if (component.get('isCourseMapGrading')) {
      requestParam.source = PLAYER_EVENT_SOURCE.COURSE_MAP;
      requestParam.courseId = component.get('context.content.courseId') || null;
    } else {
      requestParam.source = 'dca';
    }
    return Ember.RSVP.hash({
      studentIds: component
        .get('rubricService')
        .getOaGradingStudents(contentId, requestParam)
    }).then(({ studentIds }) => {
      return component
        .get('profileService')
        .readMultipleProfiles(studentIds.students);
    });
  }
});
