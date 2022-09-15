import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'backdrop-pull-ups', 'pull-up-dca-question-report'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/analytics
   */
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when the user invoke the pull up.
     **/
    onPullUpClose() {
      this.closePullUp();
    },

    onClickPrev() {
      let component = this;
      component
        .$(
          '.dca-question-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let questions = component.get('questions');
      let selectedElement = component.$(
        '.dca-question-report-container #report-carousel-wrapper .item.active'
      );
      let currentIndex = selectedElement.data('item-index');
      let selectedIndex = selectedElement.data('item-index') - 1;
      if (currentIndex === 0) {
        selectedIndex = questions.length - 1;
      }
      component.set('selectedQuestion', questions.objectAt(selectedIndex));
      component
        .$('.dca-question-report-container #report-carousel-wrapper')
        .carousel('prev');
      component.handleCarouselControl();
    },

    onClickNext() {
      let component = this;
      component
        .$(
          '.dca-question-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let questions = component.get('questions');
      let selectedElement = component.$(
        '.dca-question-report-container #report-carousel-wrapper .item.active'
      );
      let currentIndex = selectedElement.data('item-index');
      let selectedIndex = currentIndex + 1;
      if (questions.length - 1 === currentIndex) {
        selectedIndex = 0;
      }
      component.set('selectedQuestion', questions.objectAt(selectedIndex));
      component
        .$('.dca-question-report-container #report-carousel-wrapper')
        .carousel('next');
      component.handleCarouselControl();
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
          '.dca-question-report-container #report-carousel-wrapper .active .question-background-cover'
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
          '.dca-question-report-container #report-carousel-wrapper .active .question-background-cover'
        )
        .removeClass('show-all');
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
   * Selected activityDate belongs to this collection report.
   * @type {String}
   */
  activityDate: Ember.computed.alias('context.activityDate'),

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
      .$('.dca-question-report-container #report-carousel-wrapper')
      .carousel(selectedIndex);
  },

  initialize: function() {
    const component = this;
    component.slideToSelectedQuestion();
    component.set('isLoading', true);
    const classId = component.get('classId');
    const collectionId = component.get('collection.id');
    const collectionType = component.get('collection.format');
    let activityDate = component.get('activityDate');
    return component
      .get('analyticsService')
      .getDCAPerformance(classId, collectionId, collectionType, activityDate)
      .then(function(userResourcesResults) {
        if (!component.isDestroyed) {
          component.parseUserResourceResults(userResourcesResults);
          component.handleCarouselControl();
          component.set('isLoading', false);
        }
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

  closePullUp() {
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
          '.dca-question-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
    } else {
      if (currentIndex === 0) {
        component
          .$(
            '.dca-question-report-container #report-carousel-wrapper .carousel-control.left'
          )
          .addClass('in-active');
      } else {
        component
          .$(
            '.dca-question-report-container #report-carousel-wrapper .carousel-control.left'
          )
          .removeClass('in-active');
      }
      if (currentIndex === questions.length - 1) {
        component
          .$(
            '.dca-question-report-container #report-carousel-wrapper .carousel-control.right'
          )
          .addClass('in-active');
      } else {
        component
          .$(
            '.dca-question-report-container #report-carousel-wrapper .carousel-control.right'
          )
          .removeClass('in-active');
      }
    }
    // handle show more in carousel
    component
      .$(
        '.dca-question-report-container #report-carousel-wrapper .question-background-cover'
      )
      .removeClass('show-all');
    let height = component
      .$(
        `.dca-question-report-container #report-carousel-wrapper .question-background-cover:eq(${currentIndex})`
      )
      .height();
    let scrollHeight = component
      .$(
        `.dca-question-report-container #report-carousel-wrapper .question-background-cover:eq(${currentIndex})`
      )
      .prop('scrollHeight');
    if (scrollHeight > height) {
      component.set('showMore', true);
      component.set('showLess', false);
    } else {
      component.set('showMore', false);
      component.set('showLess', false);
    }
  }
});
