import Ember from 'ember';
import QuestionUtil from './question';
import AnswerObject from 'gooru-web/utils/question/answer-object';
/**
 * It contains convenience methods for grading and retrieving useful information
 * for MC questions
 *
 * # Answer object (structure required by the BE)
 *
 *   It is an array containing a single json object
 *
 *   text contains the text entered by the user
 *   status could be correct or incorrect based on the user selection
 *   order is always 1
 *   answerId corresponds to the answer choice id selected
 *   skip is always false
 *
 * [{"text":"Apple","status":"correct","order":1,"answerId":1234,"skip":false}]
 *
 * # User answer (structure used by the FE)
 *
 *   It corresponds to the answerId selected by the user
 *
 *  ie 123020
 *
 * @typedef {Object} MultipleChoiceUtil
 */
export default QuestionUtil.extend({
  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods
  /**
   * Indicates if the answer is correct
   * It overrides the default implementation
   *
   * @param {string} answer user answer
   * @return {boolean}
   *
   * @see '# User Answer' section at class comment
   */
  isCorrect: function(answer) {
    return this.isAnswerChoiceCorrect(answer);
  },

  /**
   * Indicates if the answer choice is correct
   * @param { boolean } answerChoice
   */
  isAnswerChoiceCorrect: function(answerChoice) {
    return this.getCorrectAnswer() === answerChoice;
  },

  /**
   * Gets the correct answer
   *
   * @return {string} the correct answer choice id
   *
   * @see '# User Answer' section at class comment
   */
  getCorrectAnswer: function() {
    const answers = this.get('question.answers');
    const correctAnswer = answers.filterBy('isCorrect', true);
    return correctAnswer.get('length')
      ? correctAnswer.get('firstObject.id')
      : undefined;
  },

  /**
   * Returns a unique key representing the answer
   * For multiple choice the answer id is already unique
   * @param {number} answer i.e 1
   * @returns {number} i.e 1
   *
   * @see '# User Answer' section at class comment
   */
  answerKey: function(answer) {
    return answer;
  },

  /**
   * Converts the model user answer into an answerObject format
   *
   * @param {string} userAnswer answer choice id
   * @return {AnswerObject[]}
   *
   * @see '# User Answer' section at class comment
   * @see '# Answer Object' section at class comment
   */
  toAnswerObjects: function(userAnswer) {
    let util = this;
    let answer = util.getAnswerById(userAnswer);
    let answerObject = AnswerObject.create({
      text: answer.get('text'),
      correct: util.isCorrect(userAnswer),
      order: 1,
      answerId: userAnswer,
      skip: false
    });
    return Ember.A([answerObject]);
  },

  /**
   * Converts an answerObject format to model userAnswer
   *
   * @param {AnswerObject[]} answerObjects
   * @return {string} answer id
   *
   * @see '# User Answer' section at class comment
   * @see '# Answer Object' section at class comment
   */
  toUserAnswer: function(answerObjects) {
    let userAnswer = null;
    if (answerObjects.get('length')) {
      let answerObject = Ember.get(answerObjects, 'firstObject');
      userAnswer = Ember.get(answerObject, 'answerId');
    }

    return userAnswer;
  }
});
