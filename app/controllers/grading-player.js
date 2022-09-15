import Ember from 'ember';

/**
 * @typedef {object} Grading Player Controller
 */
export default Ember.Controller.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {RubricService} Service to retrieve rubric information
   */
  rubricService: Ember.inject.service('api-sdk/rubric'),

  queryParams: [
    'classId',
    'courseId',
    'unitId',
    'lessonId',
    'collectionId',
    'questionId'
  ],

  actions: {
    /**
     * Open student roster
     */
    openStudentRoster: function() {
      this.set('showRoster', true);
    },

    /**
     * Close student roster
     */
    closeRoster: function() {
      this.set('showRoster', false);
    },

    /**
     * Triggered when current user has been changed
     */
    changeUser: function(userId) {
      this.changeAnswer(userId);
    },

    /**
     * Load next student
     */
    onLoadNext: function() {
      this.loadStudent(true);
    },

    /**
     * Load previous student
     */
    onLoadPrevious: function() {
      this.loadStudent(false);
    },

    /**
     * Submit a grade
     */
    onSubmitGrade: function() {
      this.submitGrade();
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * The class id
   * @property {String} classId
   */
  classId: null,

  /**
   * The course id
   * @property {String} courseId
   */
  courseId: null,

  /**
   * Current answer
   * @property {RubricAnswer} currentAnswer
   */
  currentAnswer: Ember.computed('currentUserId', 'userMappings', function() {
    return this.get('userMappings')[this.get('currentUserId')].answer;
  }),

  /**
   * Current grade
   * @property {RubricGrade} currentGrade
   */
  currentGrade: Ember.computed('currentUserId', 'userMappings', function() {
    return this.get('userMappings')[this.get('currentUserId')].grade;
  }),

  /**
   * Current user
   * @property {User} currentUser
   */
  currentUser: Ember.computed('currentUserId', 'userMappings', function() {
    return this.get('userMappings')[this.get('currentUserId')].user;
  }),

  /**
   * Current user
   * @property {String} currentUserId
   */
  currentUserId: null,

  /**
   * The unit id
   * @property {String} unitId
   */
  unitId: null,

  /**
   * The lesson id
   * @property {String} lessonId
   */
  lessonId: null,

  /**
   * The collection id
   * @property {String} collectionId
   */
  collectionId: null,

  /**
   * The question id
   * @property {String} questionId
   */
  questionId: null,

  /**
   * If the student roster should be hidden
   * @property {Boolean} showRoster
   */
  showRoster: false,

  /**
   * Current student id
   * @property {String} studentId
   */
  studentId: null,

  /**
   * If the response should be hidden
   * @property {Boolean} hideResponse
   */

  hideResponse: false,

  /**
   * Mappings for users, answers and grades
   * @property {Map} userMappings
   */
  userMappings: null,

  /**
   * Index of the current user
   * @property {Integer} currentUserIndex
   */
  currentUserIndex: Ember.computed('currentUserId', 'users.[]', function() {
    const user = this.get('currentUser');
    const users = this.get('users');
    return users.indexOf(user);
  }),

  /**
   * If the next button should be disabled
   * @property {boolean} isNextDisabled
   */
  isNextDisabled: Ember.computed('currentUserIndex', 'users.[]', function() {
    const currentIndex = this.get('currentUserIndex');
    const users = this.get('users');
    return currentIndex === users.length - 1;
  }),

  /**
   * If the previous button should be disabled
   * @property {boolean} isPreviousDisabled
   */
  isPreviousDisabled: Ember.computed('currentUserIndex', function() {
    const currentIndex = this.get('currentUserIndex');
    return currentIndex === 0;
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Find answer to grade
   */
  getAnswerToGrade: function(
    studentId,
    classId,
    courseId,
    collectionId,
    questionId,
    unitId,
    lessonId
  ) {
    return this.get('rubricService').getAnswerToGrade(
      studentId,
      classId,
      courseId,
      collectionId,
      questionId,
      unitId,
      lessonId
    );
  },

  // -------------------------------------------------------------------------
  // Methods
  /**
   * Change user answer
   */
  changeAnswer: function(userId) {
    const controller = this;
    let { answer } = controller.get('userMappings')[userId];
    if (answer) {
      controller.set('currentUserId', userId);
    } else {
      controller
        .getAnswerToGrade(
          userId,
          controller.get('classId'),
          controller.get('courseId'),
          controller.get('collectionId'),
          controller.get('questionId'),
          controller.get('unitId'),
          controller.get('lessonId')
        )
        .then(newAnswer => {
          let userMapping = controller.get('userMappings')[userId];
          userMapping.answer = newAnswer;
          userMapping.grade.set('sessionId', newAnswer.get('sessionId'));
          controller.set('currentUserId', userId);
        });
    }
  },

  /**
   * Load the next student information
   * @param loadNext if it should load the next or previous student
   */
  loadStudent: function(loadNext) {
    const diff = loadNext ? 1 : -1;
    const users = this.get('users');
    const currentUserIndex = this.get('currentUserIndex');
    const nextIndex = currentUserIndex + diff;
    if (nextIndex < users.length && nextIndex > -1) {
      this.changeAnswer(users.get(nextIndex).get('id'));
    }
  },

  /**
   * Submit a graded answer
   */
  submitGrade: function() {
    this.get('currentGrade').set('updatedDate', new Date());
    this.get('rubricService')
      .setStudentRubricGrades(this.get('currentGrade'))
      .then(() => {
        this.get('currentUser').set('checked', true);
        this.loadStudent(true);
        if (this.get('isNextDisabled')) {
          this.transitionToRoute(
            'teacher.class.course-map',
            this.get('classId')
          );
        }
      });
  }
});
