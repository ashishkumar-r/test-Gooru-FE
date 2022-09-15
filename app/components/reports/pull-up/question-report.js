import Ember from 'ember';
import {
  getReadRange,
  downloadAllSubmision,
  setDownloadPathForUrl
} from 'gooru-web/utils/utils';
import {
  DEFAULT_IMAGES,
  DEFAULT_THRESHOLD_VALUE
} from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'backdrop-pull-ups', 'pull-up-question-report'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/analytics
   */
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  courseService: Ember.inject.service('api-sdk/course'),

  classService: Ember.inject.service('api-sdk/class'),

  tenantService: Ember.inject.service('api-sdk/tenant'),

  session: Ember.inject.service('session'),

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
      component
        .$(
          '.question-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let questions = component.get('questions');
      let selectedElement = component.$(
        '.question-report-container #report-carousel-wrapper .item.active'
      );
      let currentIndex = selectedElement.data('item-index');
      let selectedIndex = selectedElement.data('item-index') - 1;
      if (currentIndex === 0) {
        selectedIndex = questions.length - 1;
      }
      component.set('selectedQuestion', questions.objectAt(selectedIndex));
      component
        .$('.question-report-container #report-carousel-wrapper')
        .carousel('prev');
      component.handleCarouselControl();
      if (this.get('selectedQuestion.type') === 'SERP_WPM') {
        component.onReadActivity();
      }
      component.userResourceData(component.get('userResourcesResults'));
    },

    onClickNext() {
      let component = this;
      component
        .$(
          '.question-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let questions = component.get('questions');
      let selectedElement = component.$(
        '.question-report-container #report-carousel-wrapper .item.active'
      );
      let currentIndex = selectedElement.data('item-index');
      let selectedIndex = currentIndex + 1;
      if (questions.length - 1 === currentIndex) {
        selectedIndex = 0;
      }
      component.set('selectedQuestion', questions.objectAt(selectedIndex));
      component
        .$('.question-report-container #report-carousel-wrapper')
        .carousel('next');
      component.handleCarouselControl();
      if (this.get('selectedQuestion.type') === 'SERP_WPM') {
        component.onReadActivity();
      }
      component.userResourceData(component.get('userResourcesResults'));
    },

    /**
     * Trigger handle toggle sections, based on element id.
     */
    onToggleAnswerSection(element) {
      let component = this;
      if (!component.$(element).hasClass('slide-up')) {
        component
          .$(element)
          .find('.user-answer-list')
          .slideUp();
        component.$(element).addClass('slide-up');
      } else {
        component
          .$(element)
          .find('.user-answer-list')
          .slideDown();
        component.$(element).removeClass('slide-up');
      }
    },

    /**
     * Trigger handle when show more button clicked
     */
    showMore() {
      let component = this;
      component.set('showMore', false);
      component.set('showLess', true);
      component
        .$(
          '.question-report-container #report-carousel-wrapper .active .question-background-cover'
        )
        .addClass('show-all');
    },

    /**
     * Trigger handle when show less button clicked
     */
    showLess() {
      let component = this;
      component.set('showMore', true);
      component.set('showLess', false);
      component
        .$(
          '.question-report-container #report-carousel-wrapper .active .question-background-cover'
        )
        .removeClass('show-all');
    },
    onClickDownload() {
      if (this.get('evidenceData').length) {
        let uploadUrls = [];
        this.get('evidenceData').forEach(result => {
          if (
            result.userId === this.get('selectedQuestion').id &&
            result.userName
          ) {
            const fileName = setDownloadPathForUrl(result.fileName);
            const fileItem = {
              fileUrl: fileName,
              orginalFileName: result.originalFileName,
              userName: result.userName,
              sequenceCode: this.get('selectedQuestion').order
            };
            uploadUrls.push(fileItem);
            this.set('evidenceUploadUrls', uploadUrls);
          }
        });
        const filename = `${this.get('collection').title}_${
          this.get('selectedQuestion').order
        }`;
        downloadAllSubmision(
          this.get('evidenceUploadUrls'),
          filename,
          null,
          true
        );
      }
    },
    reportClose() {
      let component = this;
      component.$().animate(
        {
          top: '100%'
        },
        400,
        function() {
          component.set('showPullUp', false);
        }
      );
    }
  },

  // -------------------------------------------------------------------------
  // Events

  didRender() {
    this.handleAppContainerScroll();
  },

  didDestroyElement() {
    this.handleAppContainerScroll();
  },

  /**
   * Function to triggered once when the component element is first rendered.
   */
  didInsertElement() {
    this.openPullUp();
    this.slideToSelectedQuestion();
    this.initialize();
    if (this.get('selectedQuestion.type') === 'SERP_WPM') {
      this.onReadActivity();
    }
  },
  // -------------------------------------------------------------------------
  // Properties

  /**
   * Maintains context data
   * @type {Object}
   */
  context: null,

  /**
   * ClassId belongs to this collection report.
   * @type {String}
   */
  classId: Ember.computed.alias('context.classId'),

  /**
   * CourseId belongs to this collection report.
   * @type {String}
   */
  courseId: Ember.computed.alias('context.courseId'),

  /**
   * Unit belongs to this collection report.
   * @type {String}
   */
  unit: Ember.computed.alias('context.unit'),

  /**
   * Lesson belongs to this question report.
   * @type {[type]}
   */
  lesson: Ember.computed.alias('context.lesson'),

  /**
   * Collection belongs to this question report.
   * @type {Object}
   */
  collection: Ember.computed.alias('context.collection'),

  /**
   * collectionId of this  question report.
   * @type {String}
   */
  collectionId: Ember.computed.alias('context.collection.id'),

  /**
   * Selected question for this report
   * @type {Object}
   */
  selectedQuestion: Ember.computed.alias('context.selectedQuestion'),

  /**
   * List of contents mapped to collection.
   * @type {Array}
   */
  contents: Ember.computed.alias('context.contents'),

  /**
   * List of questions mapped to collection.
   * @type {Array}
   */
  questions: Ember.computed('context.contents', function() {
    let contents = this.get('context.contents');
    return contents.filterBy('format', 'question');
  }),

  /**
   * Propery to hide the default pullup.
   * @property {showPullUp}
   */
  showPullUp: false,

  /**
   * List of class members
   * @type {Object}
   */
  classMembers: Ember.computed.alias('context.classMembers'),

  selectedUserId: Ember.computed.alias('context.selectedUserId'),

  /**
   * Stutent  report data
   * @type {Object}
   */
  studentReportData: Ember.A([]),

  /**
   * It maintains the state of loading
   * @type {Boolean}
   */
  isLoading: false,

  evidenceData: Ember.A([]),

  /**
   * This will have details about selected question report
   * @return {Object}
   */
  selectedQuestionReport: Ember.computed(
    'studentReportData',
    'selectedQuestion',
    function() {
      let component = this;
      let studentReportData = component.get('studentReportData');
      let selectedQuestionId = component.get('selectedQuestion.id');
      return studentReportData.findBy('id', selectedQuestionId);
    }
  ),

  evidenceDatas: Ember.computed('evidenceData', function() {
    let component = this;
    return !!(
      component.get('evidenceData') && component.get('evidenceData').length
    );
  }),

  /**
   * Maintains the state of show more button
   * @type {Boolean}
   */
  showMore: false,

  /**
   * Maintains the state of show less button
   * @type {Boolean}
   */
  showLess: false,

  //--------------------------------------------------------------------------
  // Methods

  slideToSelectedQuestion() {
    let component = this;
    let questions = component.get('questions');
    let selectedQuestion = component.get('selectedQuestion');
    let selectedIndex = questions.indexOf(selectedQuestion);
    component
      .$('.question-report-container #report-carousel-wrapper')
      .carousel(selectedIndex);
  },

  initialize: function() {
    const component = this;
    component.slideToSelectedQuestion();
    component.set('isLoading', true);
    const classId = component.get('classId');
    const courseId = component.get('courseId');
    const unitId = component.get('unit.id');
    const lessonId = component.get('lesson.id');
    const collectionId = component.get('collection.id');
    const collectionType = component.get('collection.format');
    return component
      .get('analyticsService')
      .findResourcesByCollection(
        classId,
        courseId,
        unitId,
        lessonId,
        collectionId,
        collectionType
      )
      .then(function(userResourcesResults) {
        component.set('userResourcesResults', userResourcesResults);
        component.userResourceData(userResourcesResults);
        if (!component.isDestroyed) {
          component.parseUserResourceResults(userResourcesResults);
          component.handleCarouselControl();
          component.set('isLoading', false);
        }
      });
  },
  userResourceData(userResourcesResults) {
    const component = this;
    let evidenceData = [];
    userResourcesResults.forEach(resource => {
      const user = component.get('classMembers').find(member => {
        if (member.id === resource.user) {
          return member;
        }
      });
      resource.resourceResults.map(result => {
        if (result.resourceId === component.get('selectedQuestion').id) {
          if (result.evidence) {
            result.evidence.map(item => {
              item.userName =
                user && user.username ? user.username : user.fullName;
              item.userId = result.resourceId;
              evidenceData.push(item);
            });
          }
          component.set('evidenceData', evidenceData);
        }
      });
    });
  },

  parseUserResourceResults(userResourcesResults) {
    let component = this;
    let questions = component.get('questions');
    let classMembers = component.get('classMembers');
    let resultSet = Ember.A();
    questions.forEach(question => {
      let questionId = question.get('id');
      let result = Ember.Object.create({
        id: questionId,
        question: question
      });
      let questionType = question.get('type');
      let correctAnswers = Ember.A([]);
      let wrongAnswers = Ember.A([]);
      let notAnswerUsers = Ember.A([]);
      let notGradedUsers = Ember.A([]);
      let gradedUsers = Ember.A([]);
      let correctAnswerUserCount = 0;
      let wrongAnswerUserCount = 0;
      classMembers.forEach(member => {
        let memberId = member.get('id');
        let userResourcesResult = userResourcesResults.findBy('user', memberId);
        let user = component.createUser(member);
        if (userResourcesResult) {
          let resourceResults = userResourcesResult.get('resourceResults');
          let resourceResult = resourceResults.findBy('resourceId', questionId);
          if (resourceResult) {
            let isCorrect = resourceResult.get('correct');
            let isGraded = resourceResult.get('isGraded');
            let userAnswer = resourceResult.get('userAnswer');
            if (userAnswer) {
              let answerObj = resourceResult.get('answerObject');
              let answerId = component.getAnswerId(userAnswer);
              let answer = answerObj.findBy('answerId', userAnswer);
              if (questionType !== 'OE') {
                if (isCorrect) {
                  component.answerGroup(
                    answerId,
                    answer,
                    answerObj,
                    correctAnswers,
                    userAnswer,
                    user
                  );
                  correctAnswerUserCount++;
                } else {
                  component.answerGroup(
                    answerId,
                    answer,
                    answerObj,
                    wrongAnswers,
                    userAnswer,
                    user
                  );
                  wrongAnswerUserCount++;
                }
              } else {
                if (isGraded) {
                  gradedUsers.pushObject(user);
                } else {
                  notGradedUsers.pushObject(user);
                }
              }
            } else {
              notAnswerUsers.pushObject(user);
            }
          } else {
            notAnswerUsers.pushObject(user);
          }
        } else {
          notAnswerUsers.pushObject(user);
        }
      });
      result.set('notAnswered', notAnswerUsers);
      result.set('correct', correctAnswers);
      result.set('wrong', wrongAnswers);
      result.set('notGraded', notGradedUsers);
      result.set('graded', gradedUsers);
      let memberCount = classMembers.length;
      result.set(
        'notAnswerUserPrecentage',
        Math.round((notAnswerUsers.length / memberCount) * 100)
      );
      result.set(
        'correctAnswerUserPrecentage',
        Math.round((correctAnswerUserCount / memberCount) * 100)
      );
      result.set(
        'wrongAnswerUserPrecentage',
        Math.round((wrongAnswerUserCount / memberCount) * 100)
      );
      result.set(
        'notGradedUserPrecentage',
        Math.round((notGradedUsers.length / memberCount) * 100)
      );
      result.set(
        'gradedUserPrecentage',
        Math.round((gradedUsers.length / memberCount) * 100)
      );
      if (questionType === 'OE') {
        result.set('responses', notGradedUsers.length + gradedUsers.length);
      } else {
        result.set('responses', correctAnswerUserCount + wrongAnswerUserCount);
      }
      resultSet.pushObject(result);
    });
    component.set('studentReportData', resultSet);
  },

  answerGroup(answerId, answer, answerObj, answerGroups, userAnswer, user) {
    let answerGroup = answerGroups.findBy('id', answerId);
    if (!answerGroup) {
      answerGroup = Ember.Object.create({
        id: answerId,
        answer: answer ? answer : answerObj,
        userAnswer: userAnswer,
        users: Ember.A([])
      });
      answerGroups.pushObject(answerGroup);
    }
    answerGroup.get('users').pushObject(user);
  },

  createUser(user) {
    return Ember.Object.create({
      id: user.get('id'),
      firstName: user.get('firstName'),
      lastName: user.get('lastName'),
      avatarUrl: user.get('avatarUrl')
    });
  },

  getAnswerId(userAnswer) {
    let answerId = userAnswer;
    if (Array.isArray(userAnswer)) {
      let id = userAnswer.map(answer => {
        if (answer instanceof Object) {
          return answer.selection ? '1' : '0';
        } else {
          return answer.toLowerCase();
        }
      });
      answerId = id.join('-');
    }
    return window.md5(answerId);
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

  handleCarouselControl() {
    let component = this;
    let selectedQuestion = component.get('selectedQuestion');
    let questions = component.get('questions');
    let currentIndex = questions.indexOf(selectedQuestion);
    if (questions.length - 1 === 0) {
      component
        .$(
          '.question-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
    } else {
      if (currentIndex === 0) {
        component
          .$(
            '.question-report-container #report-carousel-wrapper .carousel-control.left'
          )
          .addClass('in-active');
      } else {
        component
          .$(
            '.question-report-container #report-carousel-wrapper .carousel-control.left'
          )
          .removeClass('in-active');
      }
      if (currentIndex === questions.length - 1) {
        component
          .$(
            '.question-report-container #report-carousel-wrapper .carousel-control.right'
          )
          .addClass('in-active');
      } else {
        component
          .$(
            '.question-report-container #report-carousel-wrapper .carousel-control.right'
          )
          .removeClass('in-active');
      }
    }
    if (component.get('selectedUserId')) {
      component
        .$(
          '.question-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
    }
    // handle show more in carousel
    component
      .$(
        '.question-report-container #report-carousel-wrapper .question-background-cover'
      )
      .removeClass('show-all');
    let height = component
      .$(
        `.question-report-container #report-carousel-wrapper .question-background-cover:eq(${currentIndex})`
      )
      .height();
    let scrollHeight = component
      .$(
        `.question-report-container #report-carousel-wrapper .question-background-cover:eq(${currentIndex})`
      )
      .prop('scrollHeight');
    if (scrollHeight > height) {
      component.set('showMore', true);
      component.set('showLess', false);
    } else {
      component.set('showMore', false);
      component.set('showLess', false);
    }
  },
  onReadActivity() {
    const classId = this.get('context.classId');
    const collectionId = this.get('context.collection.id');
    const type =
      this.get('router.currentPath').split('.')[2] === 'course-map'
        ? 'LJ'
        : 'CA';
    const params = {
      classId: classId,
      collectionId: collectionId,
      questionId: this.get('selectedQuestion.id'),
      source: type
    };
    let readPromise;
    if (this.get('selectedQuestion').metadata.linked_content) {
      readPromise = this.get('courseService').getReadActivity(params);
      this.set('checkContent', true);
    } else {
      readPromise = this.get('courseService').NotLinkedActivity(params);
      this.set('checkContent', false);
    }
    readPromise.then(readData => {
      this.get('classService')
        .readClassMembers(classId)
        .then(memberData => {
          let tenantSetting = this.get(
            'tenantService'
          ).getStoredTenantSetting();
          let parsedTenantSettings = JSON.parse(tenantSetting);
          let wcgKey =
            parsedTenantSettings &&
            parsedTenantSettings.wpm_flag_config &&
            parsedTenantSettings.wpm_flag_config.wpm_flag_config
              ? parsedTenantSettings.wpm_flag_config.wpm_flag_config
              : DEFAULT_THRESHOLD_VALUE;

          const basePath = this.get('session.cdnUrls.user');
          const appRootPath = this.get(
            'configurationService.configuration.appRootPath'
          );
          memberData.details.forEach(item => {
            const thumbnailUrl = item.thumbnail
              ? basePath + item.thumbnail
              : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
            item.avatarUrl = thumbnailUrl;
            if (this.get('checkContent')) {
              readData.wpm_flags.students.map(readItem => {
                if (readItem.user_id === item.id) {
                  item.first_read_wpm_count = readItem.first_read_wpm_count;
                  item.second_read_wpm_count = readItem.second_read_wpm_count;
                  item.firstReadCount = getReadRange(
                    readItem.first_read_wpm_count,
                    wcgKey
                  );
                  item.secondReadCount = getReadRange(
                    readItem.second_read_wpm_count,
                    wcgKey
                  );
                }
              });
            } else {
              readData.wpm_flags.map(readNotLinkedData => {
                if (readNotLinkedData.user_id === item.id) {
                  item.wpm_count = readNotLinkedData.wpm_count;
                  item.wpmReadCount = getReadRange(
                    readNotLinkedData.wpm_count,
                    wcgKey
                  );
                }
              });
            }
          });
          this.set('memberData', memberData);
        });
      this.set('readActivity', readData);
    });
  }
});
