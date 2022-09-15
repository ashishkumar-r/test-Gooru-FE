import Ember from 'ember';
/**
 *
 * Controls the access to the summary data for a
 * OE Question Rubric Grading
 */

export default Ember.Controller.extend({
  queryParams: [
    'classId',
    'courseId',
    'unitId',
    'lessonId',
    'studentId',
    'sessionId',
    'collectionId',
    'collectionType',
    'questionId',
    'role',
    'backUrl'
  ],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {RubricService} Service to retrieve rubric information
   */
  rubricService: Ember.inject.service('api-sdk/rubric'),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Question}
   */
  question: null,

  /**
   * @property {Rubric}
   */
  rubric: null,

  /**
   * @property {Context}
   */
  context: null,

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
   * Indicates if the student is playing the collection
   * @property {boolean}
   */
  isStudent: Ember.computed.equal('role', 'student'),

  /**
   * @property {RubricCategoryScore[]} List of categories score
   */
  categoriesScore: Ember.computed(
    'questionSummary.categoriesScore.[]',
    function() {
      let categories = Ember.A([]);
      if (this.get('questionSummary.categoriesScore.length')) {
        categories = this.get('questionSummary.categoriesScore');
      }
      return categories;
    }
  ),

  /**
   * @property {boolean} Shows if the question has score
   */
  hasScore: Ember.computed('questionSummary.maxScore', function() {
    let maxScore = this.get('questionSummary.maxScore');
    return maxScore && maxScore !== 0;
  })
});
