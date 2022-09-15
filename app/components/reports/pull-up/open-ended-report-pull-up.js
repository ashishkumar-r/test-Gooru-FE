import Ember from 'ember';
import Context from 'gooru-web/models/result/context';
import {
  CONTENT_TYPES
} from 'gooru-web/config/config';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Ember.Service} Service to retrieve an assessment result
   */
  userSessionService: Ember.inject.service('api-sdk/user-session'),

  /**
   * @type {RubricService} Service to retrieve rubric information
   */
  rubricService: Ember.inject.service('api-sdk/rubric'),

  /**
   * @type {ProfileService} Service to retrieve question information
   */
  questionService: Ember.inject.service('api-sdk/question'),

  /**
   * @property {Ember.Service} Service to retrieve an assessment result
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  classNames: ['open-ended-report-pull-up'],

  actions: {
    closeAll() {
      this.sendAction('onClosePullUp');
    },

    onPullUpClose() {
      this.closePullUp();
    }
  },

  // -------------------------------------------------------------------------
  // Events

  /**
   * Function to triggered once when the component element is first rendered.
   */
  didInsertElement() {
    this.openPullUp();
    this.loadData();
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Propery to hide the default pullup.
   * @property {showPullUp}
   */
  showPullUp: false,

  /**
   * @property {JSON}
   */
  context: null,

  /**
   * Propery to show question thumbnail.
   * @property {String}
   */
  questionThumbnail: null,

  /**
   * Propery to show the question title or description.
   * @property {String}
   */
  questionText: null,

  /**
   * @property {Question}
   */
  question: null,

  /**
   * @property {Rubric}
   */
  rubric: null,

  /**
   * @property {ResourceResult} questionResult
   */
  questionResult: null,

  /**
   * @property {RubricGrade} questionSummary
   */
  questionSummary: null,

  /**
   * @property {string} indicates if it is a student or teacher view
   */
  role: null,

  /**
   * @property {String}
   */
  collectionType: null,

  /**
   * @property {String}
   */
  collectionTitle: String,

  /**
   * @property {Boolean}
   */
  isLoading: true,

  /**
   * @property {boolean} Shows if the question has score
   */
  hasScore: null,

  /**
   * @property {RubricCategoryScore[]} List of categories score
   */
  categoriesScore: null,

  //--------------------------------------------------------------------------
  // Methods

  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    let component = this;
    component.$().animate({
      top: '10%'
    },
    400
    );
  },

  /**
   * Function to animate the  pullup from top to bottom
   */
  closePullUp() {
    let component = this;
    component.$().animate({
      top: '100%'
    },
    400,
    function() {
      component.set('showPullUp', false);
    }
    );
  },

  /**
   * Function to load the  initial data
   */
  loadData() {
    let component = this;
    let context = component.get('context');
    component.getRubricQuestionSummary(context).then(function(model) {
      const questionResults = model.questionResult.resourceResults;
      const questionResult = questionResults ? questionResults.findBy(
        'resourceId',
        model.question.get('id')
      ) : null;
      component.set(
        'questionText',
        model.question.get('description') || model.question.get('title')
      );
      component.set('questionThumbnail', model.question.get('thumbnail'));
      component.set('question', model.question);
      component.set('rubric', model.question.get('rubric'));
      component.set('questionSummary', model.summary);
      component.set('questionResult', questionResult);
      component.set('collectionType', model.context.collectionType);
      component.set('hasScore', component.getScore());
      component.set('categoriesScore', component.getCategoryScore());
      component.set('isLoading', false);
    });
  },

  /**
   * Function to get score
   */
  getScore() {
    let component = this;
    let maxScore = component.get('questionSummary.maxScore');
    return maxScore && maxScore !== 0;
  },

  /**
   * Function to get categories score
   */
  getCategoryScore() {
    let component = this;
    let categories = Ember.A([]);
    if (component.get('questionSummary.categoriesScore.length')) {
      categories = component.get('questionSummary.categoriesScore');
    }
    return categories;
  },

  /**
   * Function to get rubric question summary
   */
  getRubricQuestionSummary(params) {
    const component = this;
    const context = component.getContext(params);
    const classId = params.classId;
    const courseId = params.courseId;
    const collectionId = params.collectionId;
    const questionId = params.questionId;
    const sessionId = params.sessionId;
    const studentId = params.studentId;
    const collectionType = params.collectionType;

    const questionPromise = component
      .get('questionService')
      .readQuestion(questionId);
    const summaryPromise = courseId ? component
      .get('rubricService')
      .getRubricQuestionSummary(
        studentId,
        classId,
        courseId,
        collectionId,
        questionId,
        sessionId
      ) :
      component
        .get('rubricService')
        .getRubricQuestionSummaryForDCA(
          studentId,
          classId,
          collectionId,
          questionId,
          sessionId
        );
    const isCollection = collectionType === CONTENT_TYPES.COLLECTION;
    const session = !isCollection ? sessionId : null;

    if (session) {
      context.set('sessionId', session);
    }

    const performancePromise = component
      .get('performanceService')
      .findAssessmentResultByCollectionAndStudent(context);
    return Ember.RSVP.hash({
      question: questionPromise,
      context,
      summary: summaryPromise,
      sessionId,
      questionResult: performancePromise
    });
  },

  /**
   * Get the player context
   * @param params
   * @returns {Context}
   */
  getContext: function(params) {
    const collectionType = params.collectionType;
    const classId = params.classId;
    const courseId = params.courseId;
    const collectionId = params.collectionId;
    const userId = params.studentId;
    const unitId = params.unitId;
    const lessonId = params.lessonId;

    return Context.create({
      collectionType,
      userId,
      collectionId,
      courseId,
      classId,
      unitId,
      lessonId
    });
  }
});
