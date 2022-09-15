import Ember from 'ember';
import { getGradeColor } from 'gooru-web/utils/utils';
import RubricGrade from 'gooru-web/models/rubric/rubric-grade';
import RubricCategoryScore from 'gooru-web/models/rubric/grade-category-score';
import { PLAYER_EVENT_SOURCE, CONTENT_TYPES } from 'gooru-web/config/config';
import FillInTheBlank from 'gooru-web/utils/question/fill-in-the-blank';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
export default Ember.Component.extend(TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {RubricService} Service to retrieve rubric information
   */
  rubricService: Ember.inject.service('api-sdk/rubric'),

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @type {ProfileService} Service to retrieve question information
   */
  questionService: Ember.inject.service('api-sdk/question'),

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['grade', 'backdrop-pull-ups', 'free-response-question-grade'],

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Events

  /**
   * Function to triggered once when the component element is first rendered.
   */
  didInsertElement() {
    this._super(...arguments);
    this.openPullUp();
    this.initialize();
    this.get('userGrade');
  },

  didDestroyElement() {
    this.handleAppContainerScroll();
    this.set('correctAnswerList', Ember.A([]));
  },

  /**
   * Function to triggered once when the component element is after rendered
   */
  didRender() {
    this._super(...arguments);
    let component = this;
    component.setupTooltip();
    component.handleAppContainerScroll();
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * ClassId belongs to this FRQ grade item.
   * @type {String}
   */
  classId: Ember.computed.alias('context.classId'),

  /**
   * CourseId belongs to this FRQ grade item.
   * @type {String}
   */
  courseId: Ember.computed.alias('context.courseId'),

  /**
   * Unit belongs to this FRQ grade item.
   * @type {Object}
   */
  unit: Ember.computed.alias('context.unit'),

  /**
   * Lesson belongs to this FRQ grade item.
   * @type {Object}
   */
  lesson: Ember.computed.alias('context.lesson'),

  /**
   * Collection of this FRQ grade item.
   * @type {Object}
   */
  collection: Ember.computed.alias('context.collection'),

  /**
   * Question of this FRQ grade item.
   * @type {Object}
   */
  question: Ember.computed.alias('context.content'),

  /**
   * Propery to hide the default pullup.
   * @property {Boolean}
   */
  showPullUp: false,

  /**
   * It maintains the state of loading
   * @type {Boolean}
   */
  isLoading: false,

  isShowStudentList: false,

  userEnteredValue: '',

  isShowClear: false,

  filteredList: Ember.computed('users', function() {
    return this.get('users');
  }),

  /**
   * Selected Student to grade
   * @type {Object}
   */
  student: Ember.Object.create({}),

  /**
   * List of users who need grading
   * @type {Array}
   */
  users: Ember.A([]),

  /**
   *  Rubric which is associated with question
   * @type {Object}
   */
  rubric: null,

  /**
   * Answer data provided by the users
   * @type {Object}
   */
  answer: null,

  /**
   * Computed Properties for rubric categories
   * @type {Object}
   */
  categories: Ember.computed('userGrade', function() {
    let categories = this.get('userGrade.categories')
      ? this.get('userGrade.categories')
      : Ember.A([]);
    categories.map(category => {
      let levels = category.get('levels');
      if (levels) {
        if (category.get('allowsLevels') && category.get('allowsScoring')) {
          levels = levels.sortBy('score');
        }
        category.set('levels', levels);
      }
    });
    return categories ? categories : Ember.A([]);
  }),

  /**
   * Maintains the user grade
   * @return {Object}
   */
  userGrade: Ember.computed('studentId', 'users.[]', function() {
    let studentId = this.get('studentId');
    let user = this.get('users').findBy('id', studentId);
    return user ? user.get('rubricGrade') : null;
  }),

  userGradeObserver: Ember.observer('allContexts.@each.question', function() {
    let component = this;
    if (this.get('userGrade') != null) {
      let userGrade = this.get('userGrade');
      let categories = this.get('categories');
      let allContexts = this.get('allContexts');
      if (allContexts.length) {
        let data = component
          .get('allContexts')
          .findBy('question.id', userGrade.resourceId);
        if (data) {
          data.set('userGrade', userGrade);
          data.set('categories', categories);
        }
      }
    }
  }),

  /**
   *  Maintains student id value who requires grading
   * @type {String}
   */
  studentId: null,

  /**
   * Calculate rubric total points
   * @type {Number}
   */
  totalRubricPoints: Ember.computed('rubric.categories', function() {
    let component = this;
    let totalRubricPoints = 0;
    let categories = component.get('rubric.categories');
    if (categories) {
      categories.forEach(category => {
        if (category.get('allowsLevels') && category.get('allowsScoring')) {
          totalRubricPoints += category.get('totalPoints');
        }
      });
    }
    return totalRubricPoints;
  }),

  /**
   * Calculate user rubric total points
   * @type {Number}
   */
  totalUserRubricPoints: Ember.computed(
    'studentId',
    'categories.@each.selected',
    'categories.@each.scoreInPrecentage',
    function() {
      let component = this;
      let totalUserRubricPoints = 0;
      let categories = component.get('categories');
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
  userGradeScore: Ember.computed('userGrade.studentScore', function() {
    let score = -1;
    let gradeMaxScore = this.get('rubric.maxScore');
    let studentScore = this.get('userGrade.studentScore');
    if (studentScore > 0) {
      score = Math.floor((studentScore / gradeMaxScore) * 100);
    }
    return score;
  }),

  /**
   * Read student grade score
   * @return {Number}
   */
  studentGradeScore: Ember.computed('userGrade.studentScore', function() {
    let score = 0;
    let studentScore = this.get('userGrade.studentScore');
    if (studentScore) {
      score = studentScore;
    }
    return score;
  }),

  /**
   * Maintains the value of selected user index.
   * @return {Number}
   */
  currentStudentIndex: Ember.computed('studentId', 'users', function() {
    let studentIndex = 1;
    let users = this.get('users');
    let student = this.get('student');
    if (users) {
      let user = users.findBy('id', student.id);
      studentIndex = users.indexOf(user) + 1;
    }
    return studentIndex === 0 ? 1 : studentIndex;
  }),

  /**
   * Maintains the  list of question items  need to grade.
   * @type {Array}
   */
  itemsToGrade: Ember.A([]),
  /**
   * @property {Boolean} isPause
   */
  isPause: false,
  /*
   * Hold the audio details
   */
  audioRecorder: null,

  correctAnswerList: Ember.A(),

  /**
   * Checking is demo account
   */
  isGuestAccount: Ember.computed.alias('session.isGuest'),

  allContexts: Ember.computed.alias('allContext'),
  // -------------------------------------------------------------------------
  // Actions

  actions: {
    onUserGradeScore(quesUserGrade) {
      let score = 0;
      let gradingScore = -1;

      let studentScore = quesUserGrade.get('userGrade.studentScore');
      if (studentScore) {
        score = studentScore;
      }

      let gradeMaxScore = quesUserGrade.get('rubric.maxScore');
      if (score > 0) {
        gradingScore = Math.floor((score / gradeMaxScore) * 100);
      }
      quesUserGrade.set('rubric.studentGradeScore', score);
      quesUserGrade.set('rubric.gradingScore', gradingScore);
    },
    /**
     * Action triggered when the user invoke the pull up.
     **/
    onPullUpClose(closeAll) {
      this.closePullUp(closeAll);
    },

    /**
     * Action get triggered when comment icon got toggle.
     */
    onShowAddCommentBox(index, categoryIndex) {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_CA_ITEM_GRADE_RUBRIC_COMMENT);

      let element = component.$(
        `#frq-grade-rubric-category-${index}-${categoryIndex}`
      );
      if (element.hasClass('comment-active')) {
        element.find('.frq-grade-comment-section').slideUp(400, function() {
          element.removeClass('comment-active');
        });
      } else {
        element.find('.frq-grade-comment-section').slideDown(400, function() {
          element.addClass('comment-active');
        });
      }
    },

    /**
     * Action triggered when clear the category level choosen
     * @param  {Object} category
     */
    unSelectCategoryLevel(question, category) {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_CA_ITEM_GRADE_RUBRIC_CLEAR);
      category.set('scoreInPrecentage', null);
      let levels = category.get('levels');
      if (levels && levels.length > 0) {
        levels.findBy('selected', true).set('selected', false);
      }
      category.set('selected', false);

      let score =
        question.get('rubric.totalUserRubricPoints') -
        category.get('selectedScore');

      question.set('rubric.studentGradeScore', 0);
      question.set('rubric.gradingScore', -1);
      question.set('rubric.userRubricScore', -1);
      question.set('rubric.totalUserRubricPoints', score);
    },

    /**
     * Action triggered when category get choosen
     * @param  {Object} category
     */
    onChooseCategory(category) {
      category.set('selected', true);
    },

    onClickPrev() {
      let component = this;
      component
        .$(
          '.frq-grade-students-carousel #frq-grade-students-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let users = component.get('users');
      let selectedElement = component.$(
        '.frq-grade-students-carousel #frq-grade-students-carousel-wrapper .item.active'
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
        .$('.frq-grade-students-carousel #frq-grade-students-carousel-wrapper')
        .carousel('prev');
      component.loadData();
    },

    onClickNext() {
      let component = this;
      component
        .$(
          '.frq-grade-students-carousel #frq-grade-students-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let users = component.get('users');
      let selectedElement = component.$(
        '.frq-grade-students-carousel #frq-grade-students-carousel-wrapper .item.active'
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
        .$('.frq-grade-students-carousel #frq-grade-students-carousel-wrapper')
        .carousel('next');
      component.loadData();
    },

    /**
     * Action triggered when general comment section got focus in/out.
     */
    updateUserGradeComment() {
      let comment = this.$('.frq-grade-general-comment-container p').text();
      this.set('userGrade.comment', comment);
    },

    /**
     * Action get triggered when user submit grade for student.
     */
    submitUserGrade() {
      this.saveUserGrade();
    },

    /**
     * Action get triggered when rubric attachment preview got close
     */
    filePreviewClose() {
      this.$('.rubric-file-preview-container').fadeOut('slow');
    },

    /**
     * Action get triggered when rubric attachment preview got open
     */
    filePreviewOpen() {
      this.$('.rubric-file-preview-container')
        .css('visibility', 'visible')
        .hide()
        .fadeIn('slow');
    },
    onPlayAudio(container, url, index) {
      const component = this;
      let _audio = component.get('audioRecorder');
      if (!_audio || component.get('answerIndex') !== index) {
        _audio = new Audio(url);
        component.set('answerIndex', index);
      }
      component.set('audioRecorder', _audio);
      _audio.play();
      component.set('isPause', true);
      _audio.ontimeupdate = function() {
        component
          .$(
            `.frq-question-answer-info .${container} .audio-progress .progress-filling`
          )
          .css('width', `${(_audio.currentTime / _audio.duration) * 100}%`);
      };
      _audio.addEventListener('ended', () => {
        component.set('isPause', false);
      });
    },
    //Action triggered when pause audio
    onPauseAudio() {
      const component = this;
      const audio = component.get('audioRecorder');
      audio.pause();
      component.set('isPause', false);
    },

    onClickClear() {
      this.set('isShowStudentList', false);
    },

    onClickDropdown() {
      this.set('isShowStudentList', true);
    },

    onClickStudent(currentUser) {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_CA_ITEM_GRADE_SELECT_USER);
      component.set('student', currentUser);
      component.set('studentId', currentUser.get('id'));
      component.send('onClearSearch');
      component.set('isShowStudentList', false);
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
    }
  },

  //--------------------------------------------------------------------------
  // Methods

  initialize() {
    let component = this;
    Array.from(component.get('allContexts')).forEach(ques => {
      let classId = ques.classId;
      let courseId = ques.courseId;
      let unitId = component.get('unitId') || ques.unitId;
      let lessonId = component.get('lessonId') || ques.lessonId;
      let collectionId = ques.collection.id;
      let questionId = ques.content.id;
      let isDCAContext = component.get('isDCAContext');
      let activityDate = ques.activityDate;
      let subQuestionId = ques.subQuestionId;
      let subResourceId = subQuestionId ? subQuestionId : questionId;
      let isDefaultShowFW = component.get('isDefaultShowFW');
      let classFramework = component.get('classFramework');
      component.set('isLoading', true);
      return Ember.RSVP.hash({
        question: this.get('questionService').readQuestion(
          questionId,
          isDefaultShowFW,
          classFramework
        ),
        users: isDCAContext
          ? this.get('rubricService').getDCAStudentsForQuestion(
            subResourceId,
            classId,
            collectionId,
            activityDate
          )
          : this.get('rubricService').getStudentsForQuestion(
            subResourceId,
            classId,
            courseId,
            collectionId
          )
      })
        .then(({ users, question }) => {
          if (subQuestionId && question.subQuestions) {
            question = question.subQuestions.findBy('id', subQuestionId);
          }
          if (users.get('students') && users.get('students').length) {
            let studentId = component.get('studentId');
            if (!studentId) {
              studentId = users.get('students.firstObject');
              component.set('studentId', studentId);
            }
            let isAnswerGrade = users.get('students').includes(studentId);
            return Ember.RSVP.hash({
              answer: isAnswerGrade
                ? isDCAContext
                  ? this.get('rubricService').getAnswerToGradeForDCA(
                    studentId,
                    classId,
                    collectionId,
                    subResourceId,
                    activityDate
                  )
                  : this.get('rubricService').getAnswerToGrade(
                    studentId,
                    classId,
                    courseId,
                    collectionId,
                    subResourceId,
                    unitId,
                    lessonId
                  )
                : null,
              rubric: question.get('rubric.id')
                ? this.get('rubricService').getRubric(question.get('rubric.id'))
                : null,
              userIds: users.get('students'),
              users: this.get('profileService').readMultipleProfiles(
                users.get('students')
              ),
              currentUserId: studentId,
              classId,
              questionId: subResourceId,
              courseId,
              collectionId,
              unitId,
              baseResourceId: subQuestionId ? questionId : null,
              lessonId,
              question: question
            });
          }
        })
        .then(({ users, rubric, answer, question }) => {
          let totalRubricPoints = 0;
          if (!component.get('isDestroyed')) {
            users.map(user => {
              let newRubric = rubric ? rubric.copy() : rubric;
              user.set(
                'rubricGrade',
                component.createRubricGrade(newRubric, user, question)
              );
            });
            if (users) {
              let student = users.get('firstObject');
              component.set('student', student);
            }
            component.set('users', users);
            ques.set('rubric', rubric);
            ques.set('answer', answer);
            ques.set('question', question);
            component.set('rubric', rubric);
            component.set('answer', answer);
            component.answerLoader(answer, question);
            ques.set('resource', question);
            ques.set('subQuestions', question.subQuestions);
            if (ques.subQuestions) {
              let studentId = component.get('studentId');
              ques.subQuestions.map(subqsn => {
                let isAnswerProise;
                if (isDCAContext) {
                  isAnswerProise = this.get(
                    'rubricService'
                  ).getAnswerToGradeForDCA(
                    studentId,
                    classId,
                    collectionId,
                    subqsn.id,
                    activityDate
                  );
                } else {
                  isAnswerProise = this.get('rubricService').getAnswerToGrade(
                    studentId,
                    classId,
                    courseId,
                    collectionId,
                    subqsn.id,
                    unitId,
                    lessonId
                  );
                }
                isAnswerProise.then(subAns => {
                  if (subAns) {
                    subqsn.set('answerObject', subAns.answerText);
                    subAns.answerText.map(ansResponse => {
                      subqsn.set('userAnswer', ansResponse.text);
                    });
                  } else {
                    subqsn.set('userAnswer', 'N/A');
                  }
                });
                subqsn.resource = question;
              });
            }
            if (answer) {
              ques.set('answerObject', answer.answerText);
              answer.answerText.map(result => {
                ques.set('userAnswer', result.text);
              });
            } else {
              ques.set('userAnswer', 'N/A');
            }
            ques.set('answered', true);
            component.set('isLoading', false);
            component.handleCarouselControl();

            if (ques.categories) {
              let categories = ques.categories;
              if (categories) {
                categories.forEach(category => {
                  if (
                    category.get('allowsLevels') &&
                    category.get('allowsScoring') &&
                    ques.rubric
                  ) {
                    totalRubricPoints += category.get('totalPoints');
                    ques.set('rubric.totalRubricPoints', totalRubricPoints);
                  }
                });

                return totalRubricPoints;
              }
            } else {
              if (ques.rubric) {
                ques.set('rubric.totalRubricPoints', 0);
              }
            }
          }
        });
    });
  },

  answerLoader(answer, question) {
    let component = this;
    component.set('correctAnswerList', Ember.A([]));
    if (question.type === 'SERP_ID') {
      component.underlineHighlight(question, answer);
    }
    if (question.type === 'SERP_SOL') {
      component.sayOutTextHighlight(question);
    }
    if (answer && answer.answerText && question.type === 'SERP_WPM') {
      answer.answerText.forEach(item => {
        item.text = JSON.parse(item.text);
      });
    }

    if (question.type === 'SE_FRQ' || question.type === 'SE_FIB') {
      let userAnswers = Ember.A([]);
      if (answer && answer.answerText) {
        let correctAns = answer.answerText;
        correctAns.map(userAnswer => {
          let answerValue =
            userAnswer.text.indexOf(':') !== -1
              ? userAnswer.text.split(':')
              : '';
          userAnswers.pushObject({
            category: answerValue[0],
            value: answerValue[1]
          });
        });
      }
      component.set('answer.answerText', userAnswers);
    }
    if (question.type === 'SE_FIB') {
      let answerDetails = question.answerDetails;
      let userAnswers = component.get('answer.answerText');
      let answerData = answerDetails.map(function(answerDetail) {
        let questionTextParts = answerDetail.answer_text.split(
          FillInTheBlank.SCIENTIFIC_FIB_REGEX.global
        );
        let correctAnswer = userAnswers.filterBy(
          'category',
          answerDetail.answer_category
        );
        let checkAns = '';
        questionTextParts.forEach(function(questionTextPart, index) {
          const answerText = correctAnswer[index]
            ? correctAnswer[index].value
            : '';
          const input = correctAnswer[index]
            ? `<input type='text' value=${answerText} >`
            : '';
          checkAns += `${questionTextPart}${input}`;
        });
        return {
          category: answerDetail.answer_category,
          value: checkAns
        };
      });
      component.set('answer.answerText', answerData);
    }
  },

  loadData() {
    let component = this;
    Array.from(component.get('allContexts')).forEach(ques => {
      let studentId = component.get('studentId');
      if (ques.categories && ques.categories.length) {
        ques.categories.forEach(item => {
          item.set('scoreInPrecentage', null);
          item.set('selected', false);
          item.set('selectedScore', null);
        });
      }
      if (ques.rubric) {
        ques.set('rubric.totalUserRubricPoints', null);
        ques.set('rubric.userRubricScore', null);
        ques.set('rubric.studentGradeScore', null);
        ques.set('rubric.gradingScore', null);
      }
      if (ques.userGrade) {
        ques.set('userGrade.studentScore', 0);
        ques.set('userGrade.studentId', studentId);
      }
      let classId = ques.classId;
      let courseId = ques.courseId;
      let unitId = component.get('unitId') || ques.unitId;
      let lessonId = component.get('lessonId') || ques.lessonId;
      let collectionId = ques.collection.id;
      let questionId = ques.content.id;
      let isDCAContext = component.get('isDCAContext');
      let activityDate = ques.activityDate;
      let subQuestionId = ques.subQuestionId;
      let subResourceId = subQuestionId ? subQuestionId : questionId;
      if (
        ques.content.content_subformat ===
        'serp_lang_activities_for_comprehension_question'
      ) {
        subQuestionId = questionId;
      }
      component.set('isLoading', true);
      return Ember.RSVP.hash({
        users: isDCAContext
          ? this.get('rubricService').getDCAStudentsForQuestion(
            subResourceId,
            classId,
            collectionId,
            activityDate
          )
          : this.get('rubricService').getStudentsForQuestion(
            subResourceId,
            classId,
            courseId,
            collectionId
          )
      }).then(({ users }) => {
        let isAnswerGrade = users.get('students').includes(studentId);
        return Ember.RSVP.hash({
          question: this.get('questionService').readQuestion(questionId),
          answer: isAnswerGrade
            ? isDCAContext
              ? this.get('rubricService').getAnswerToGradeForDCA(
                studentId,
                classId,
                collectionId,
                subResourceId,
                activityDate
              )
              : this.get('rubricService').getAnswerToGrade(
                studentId,
                classId,
                courseId,
                collectionId,
                subResourceId,
                unitId,
                lessonId
              )
            : null
        }).then(({ answer, question }) => {
          if (!component.get('isDestroyed')) {
            component.set('audioRecorder', null);
            component.set('answer', answer);
            ques.set('answer', answer);
            component.answerLoader(answer, question);
            ques.set('resource', question);
            ques.set('subQuestions', question.subQuestions);
            if (ques.subQuestions) {
              ques.subQuestions.map(subqsn => {
                let isAnswerProise;
                if (isDCAContext && isAnswerGrade) {
                  isAnswerProise = this.get(
                    'rubricService'
                  ).getAnswerToGradeForDCA(
                    studentId,
                    classId,
                    collectionId,
                    subqsn.id,
                    activityDate
                  );
                } else {
                  isAnswerProise = this.get('rubricService').getAnswerToGrade(
                    studentId,
                    classId,
                    courseId,
                    collectionId,
                    subqsn.id,
                    unitId,
                    lessonId
                  );
                }
                isAnswerProise.then(subAns => {
                  if (subAns) {
                    subqsn.set('answerObject', subAns.answerText);
                    subAns.answerText.map(ansResponse => {
                      subqsn.set('userAnswer', ansResponse.text);
                    });
                  } else {
                    subqsn.set('userAnswer', 'N/A');
                  }
                });
                subqsn.resource = subqsn;
                subqsn.set('answered', true);
              });
            }
            if (answer) {
              ques.resource.set('answers', answer.answerText);
              ques.set('answerObject', answer.answerText);
              answer.answerText.map(result => {
                ques.set('userAnswer', result.text);
              });
            } else {
              ques.set('userAnswer', 'N/A');
            }
            ques.set('answered', true);
            component.set('isLoading', false);
            component.handleCarouselControl();
          }
        });
      });
    });
  },

  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    let component = this;
    component.$().animate(
      {
        top: '10%'
      },
      400
    );
  },

  closePullUp(closeAll) {
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.set('showPullUp', false);
        if (closeAll) {
          component.sendAction('onClosePullUp');
        }
      }
    );
  },

  handleAppContainerScroll() {
    let activePullUpCount = Ember.$(document.body).find('.backdrop-pull-ups')
      .length;
    if (activePullUpCount > 0) {
      Ember.$(document.body).addClass('no-vertical-scroll');
    } else if (activePullUpCount === 0) {
      Ember.$(document.body).removeClass('no-vertical-scroll');
    }
  },

  setupTooltip: function() {
    let totalUserRubricPoints = 0;
    let score = -1;

    let component = this;
    // let categories = component.get('categories');
    component.$('.frq-grade-info-popover').popover({
      placement: 'top auto',
      container: '.free-response-question-grade',
      trigger: 'manual'
    });
    let isMobile = window.matchMedia('only screen and (max-width: 768px)');
    if (isMobile.matches) {
      component.$('.close-popover').click(function() {
        component.$('.frq-grade-info-popover').popover('hide');
      });
    }

    component.$('.frq-grade-info-popover').on('click', function() {
      let levelIndex = component.$(this).data('level');
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_CA_ITEM_GRADE_RUBRIC_LEVEL);
      let categoryIndex = component.$(this).data('category');
      let quesIndex = component.$(this).data('question');
      let question = component.get('allContexts').objectAt(quesIndex);
      let category = question.categories.objectAt(categoryIndex);
      let level = category.get('levels').objectAt(levelIndex);
      category.get('levels').map(level => {
        level.set('selected', false);
      });
      level.set('selected', true);
      let totalPoints = category.get('totalPoints');
      let scoreInPrecentage = Math.floor(
        (level.get('score') / totalPoints) * 100
      );
      category.set('scoreInPrecentage', scoreInPrecentage);
      category.set('selected', true);

      if (question.categories) {
        question.categories.forEach(category => {
          if (category.get('allowsLevels') && category.get('allowsScoring')) {
            let level = category.get('levels').findBy('selected', true);

            if (level) {
              totalUserRubricPoints += parseInt(level.get('score'));

              category.set('selectedScore', level.get('score'));
            }
          }
        });
      }

      question.set('rubric.totalUserRubricPoints', totalUserRubricPoints);

      let totalRubricPoints = question.get('rubric.totalRubricPoints');

      if (totalUserRubricPoints > 0) {
        score = Math.floor((totalUserRubricPoints / totalRubricPoints) * 100);
      }
      question.set('rubric.userRubricScore', score);

      if (isMobile.matches) {
        component
          .$('.frq-grade-info-popover')
          .not(this)
          .popover('hide');
        component.$(this).popover('show');
        Ember.$('.popover-title')
          .append('<span class="close-popover">x</span>')
          .css('background-color', getGradeColor(scoreInPrecentage));
      }
    });
    if (!isMobile.matches) {
      component.$('.frq-grade-info-popover').on('mouseleave', function() {
        $(this).popover('hide');
      });
      component.$('.frq-grade-info-popover').on('mouseenter', function() {
        let levelIndex = component.$(this).data('level');
        let categoryIndex = component.$(this).data('category');
        let quesIndex = component.$(this).data('question');
        let question = component.get('allContexts').objectAt(quesIndex);
        let category = question.categories.objectAt(categoryIndex);
        let totalPoints = category.get('totalPoints');
        let level = category.get('levels').objectAt(levelIndex);
        $(this).popover('show');
        if (category.get('allowsScoring')) {
          let scoreInPrecentage = Math.floor(
            (level.get('score') / totalPoints) * 100
          );
          Ember.$('.popover-title').css(
            'background-color',
            getGradeColor(scoreInPrecentage)
          );
        } else {
          Ember.$('.popover-title').hide();
        }
      });
    }
  },

  createRubricCategory(category, level) {
    let rubricCategory = RubricCategoryScore.create(
      Ember.getOwner(this).ownerInjection(),
      {
        title: category.get('title')
      }
    );
    rubricCategory.set('levelMaxScore', 0);
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

  createRubricGrade(rubric, user, question) {
    let component = this;
    return RubricGrade.create(Ember.getOwner(this).ownerInjection(), rubric, {
      comment: '',
      studentId: user.get('id'),
      classId: component.get('classId'),
      courseId: component.get('courseId'),
      unitId: component.get('unit.id'),
      lessonId: component.get('lesson.id'),
      collectionId: component.get('collection.id'),
      resourceId: question.id,
      createdDate: new Date(),
      rubricCreatedDate: component.get('rubric.createdDate'),
      rubricUpdatedDate: component.get('updatedDate'),
      studentScore: 0
    });
  },

  saveUserGrade() {
    let component = this;
    component
      .get('parseEventService')
      .postParseEvent(PARSE_EVENTS.CLICK_CA_ITEM_GRADE_SUBMIT);
    let isDCAContext = component.get('isDCAContext');
    Array.from(component.get('allContexts')).forEach(context => {
      let categoriesScore = Ember.A([]);
      if (context.baseResourceId) {
        context.userGrade.set('baseResourceId', context.baseResourceId);
      }
      context.categories.forEach(category => {
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
        }
      });
      context.userGrade.set('categoriesScore', categoriesScore);
      context.userGrade.set('sessionId', component.get('answer.sessionId'));
      context.userGrade.set('updatedDate', new Date());
      if (isDCAContext) {
        context.userGrade.set('activityDate', context.get('activityDate'));
        context.userGrade.set('contentSource', PLAYER_EVENT_SOURCE.DAILY_CLASS);
        context.userGrade.set('collectionType', CONTENT_TYPES.ASSESSMENT);

        let contextInfo = null;
        if (context.dcaContentId) {
          contextInfo = btoa(
            JSON.stringify({
              dcaContentId: context.dcaContentId
            })
          );
        }
        context.userGrade.set('dcaContentId', contextInfo);
        component
          .get('rubricService')
          .setStudentRubricGradesForDCA(context.userGrade);
      } else {
        component
          .get('rubricService')
          .setStudentRubricGrades(context.userGrade);
      }
    });
    Ember.run.later(function() {
      let allContexts = component.get('allContexts');
      if (isDCAContext) {
        component.slideToNextUser(allContexts.get('lastObject'));
      } else {
        component.sendAction('getGradeListItem');
        component.slideToNextUser(allContexts.get('lastObject'));
      }
    }, 2000);
  },

  slideToNextUser(context) {
    let component = this;
    let users = component.get('users');
    if (users.length > 1) {
      let container = $('.frq-grade-body');
      container.animate(
        {
          scrollTop: 0
        },
        1000
      );
      let studentId = component.get('studentId');
      let users = component.get('users');
      let selectedUser = users.findBy('id', studentId);
      let selectedIndex = users.indexOf(selectedUser);
      let rightNavElement = component.$(
        '#frq-grade-students-carousel-wrapper .carousel-control.right'
      );
      let leftNavElement = component.$(
        '#frq-grade-students-carousel-wrapper .carousel-control.left'
      );
      let nextUserIndex = 0;
      if (!rightNavElement.hasClass('in-active')) {
        nextUserIndex = selectedIndex + 1;
      } else if (!leftNavElement.hasClass('in-active')) {
        nextUserIndex = selectedIndex - 1;
      }
      let nextUser = users.objectAt(nextUserIndex);
      component.set('studentId', nextUser.get('id'));
      component
        .$('.frq-grade-students-carousel  #frq-grade-students-carousel-wrapper')
        .carousel(nextUserIndex);
      users.removeAt(selectedIndex);
      component.loadData();
      component.handleCarouselControl();
    } else {
      component.$('.caught-up-container').show(400, function() {
        let itemsToGrade = component.get('itemsToGrade');
        if (itemsToGrade) {
          let questionId = component.get('question.id');
          let item = itemsToGrade.findBy('content.id', questionId);
          itemsToGrade.removeObject(item);
        }
        component.$().fadeOut(5000, function() {
          component.set('showPullUp', false);
          component.sendAction('refreshItem', context);
        });
      });
    }
  },

  handleCarouselControl() {
    let component = this;
    let studentId = component.get('studentId');
    let users = component.get('users');
    let selectedUser = users.findBy('id', studentId);
    let currentIndex = users.indexOf(selectedUser);
    if (users.length - 1 === 0) {
      component
        .$(
          '.frq-grade-students-carousel #frq-grade-students-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
    } else {
      if (currentIndex === 0) {
        component
          .$(
            '.frq-grade-students-carousel #frq-grade-students-carousel-wrapper .carousel-control.left'
          )
          .addClass('in-active');
      } else {
        component
          .$(
            '.frq-grade-students-carousel #frq-grade-students-carousel-wrapper .carousel-control.left'
          )
          .removeClass('in-active');
      }
      if (currentIndex === users.length - 1) {
        component
          .$(
            '.frq-grade-students-carousel #frq-grade-students-carousel-wrapper .carousel-control.right'
          )
          .addClass('in-active');
      } else {
        component
          .$(
            '.frq-grade-students-carousel #frq-grade-students-carousel-wrapper .carousel-control.right'
          )
          .removeClass('in-active');
      }
    }
  },

  sayOutTextHighlight(question) {
    let correctAnswerList = Ember.A([]);
    let component = this;
    let answers = question.answers;
    answers.forEach(item => {
      if (item.correctAnswer) {
        let element = document.createElement('div');
        element.textContent = item.text;
        item.correctAnswer.forEach(data => {
          element = component.hightLightSayoutWord(data, element);
        });
        correctAnswerList.push(element);
        question.set('correctAnswerList', correctAnswerList);
      }
    });
  },

  underlineHighlight(question, answer) {
    let correctAnswerList = Ember.A([]);
    if (answer && answer.answerText) {
      answer.answerText.map((result, index) => {
        var answerResult = question.answers.get(index);
        let element = document.createElement('div');
        element.textContent = answerResult ? answerResult.text : '';
        result.text.split(',').map(subresult => {
          if (answerResult.correctAnswer.indexOf(subresult) !== -1) {
            element = this.hightLightDefaultWord(subresult, element, true);
          } else {
            element = this.hightLightDefaultWord(subresult, element, false);
          }
        });
        correctAnswerList.push(element);
      });
    }
    question.set('correctAnswerList', correctAnswerList);
  },

  hightLightSayoutWord(text, element) {
    let innerHTML = '';
    var start = text.split(':')[1];
    var end = text.split(':')[2];
    var fulltext = text.split(':')[0];
    let html = `<span class="correct">${fulltext}</span>`;
    String.prototype.replaceBetween = function(start, end, what) {
      return this.substring(0, start) + what + this.substring(end);
    };
    element.childNodes.forEach(childNode => {
      if (childNode.data && childNode.data.substring(start, end) === fulltext) {
        innerHTML =
          innerHTML + childNode.data.replaceBetween(start, end, $.trim(html));
      } else if (childNode.data) {
        innerHTML = innerHTML + childNode.data;
      } else {
        innerHTML = innerHTML + childNode.outerHTML;
      }
    });
    element.innerHTML = innerHTML;
    return element;
  },

  hightLightDefaultWord(text, element, status) {
    let innerHTML = '';
    let html = '';
    if (status) {
      html = `<span class="correct">${text}</span>`;
    } else {
      html = `<span class="error">${text}</span>`;
    }
    element.childNodes.forEach(childNode => {
      if (childNode.data) {
        innerHTML = innerHTML + childNode.data.replace(text, $.trim(html));
      } else if (childNode.data) {
        innerHTML = innerHTML + childNode.data;
      } else {
        innerHTML = innerHTML + childNode.outerHTML;
      }
    });
    element.innerHTML = innerHTML;
    return element;
  }
});
