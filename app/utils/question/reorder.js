import QuestionUtil from './question';
import Ember from 'ember';
import AnswerObject from 'gooru-web/utils/question/answer-object';
/**
 * It contains convenience methods for grading and retrieving useful information
 * for Reorder questions
 *
 * # Answer object (structure required by the BE)
 *
 *   It is an array containing a json object for each user selection
 *
 *   text it contains the text of user selection
 *   status could be correct or incorrect based on the user selection
 *   order it represents the order selected by the user for this specific selection
 *   answerId correspond to the answer choice id selected
 *   skip is always false
 *
 * [{"text":"1","status":"correct","order":1,"answerId":1234,"skip":false},
 * {"text":"2","status":"correct","order":3,"answerId":1234,"skip":false},
 * {"text":"3","status":"correct","order":2,"answerId":1234,"skip":false}]
 *
 * # User answer (structure used by the FE)
 *
 *   It is an array of answerId in the correct order
 *
 *  ie [1203, 20304, 20304]
 *
 * @typedef {Object} ReorderUtil
 */
export default QuestionUtil.extend({
  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods
  /**
   * Indicates if the answer choice is correct
   * @param { string } answerChoice
   * @param { number } index position of the answer
   *
   * @see '# User Answer' section at class comment
   */
  isAnswerChoiceCorrect: function(answerChoice, index) {
    let correctAnswer = this.getCorrectAnswer();
    return (
      correctAnswer.includes(answerChoice) &&
      correctAnswer.indexOf(answerChoice) === index
    );
  },

  /**
   * Gets the correct answer
   * @return {string[]} returns the correct order for answer choice ids
   *
   * @see '# User Answer' section at class comment
   * @see '# Answer Object' section at class comment
   */
  getCorrectAnswer: function() {
    const answers = this.get('question.answers').sortBy('order');
    return answers.map(function(answer) {
      return answer.get('id');
    });
  },

  /**
   * Returns a unique key representing the answer
   * For Roerder the answer is an array of answer ids
   *
   * @param { string[] } answer i.e ['answerId_1', 'answerId_2', 'answerId_3']
   * @returns { string }
   *
   * @see '# User Answer' section at class comment
   */
  answerKey: function(answer) {
    return answer.join();
  },

  /**
   * Converts the model user answer into an answerObject format
   *
   * @param { string[] } userAnswer answer ids in selected order
   * @return {AnswerObject[]}
   *
   * @see '# User Answer' section at class comment
   * @see '# Answer Object' section at class comment
   */
  toAnswerObjects: function(userAnswer) {
    let util = this;
    return userAnswer.map(function(answerId, index) {
      let answer = util.getAnswerById(answerId);
      return AnswerObject.create({
        text: answer.get('text'),
        correct: util.isAnswerChoiceCorrect(answerId, index),
        order: index + 1,
        answerId: answerId,
        skip: false
      });
    });
  },

  /**
   * Converts an answerObject format to model userAnswer
   *
   * @param {AnswerObject[]} answerObjects
   * @return {string[]} answer ids in selected order
   *
   * @see '# User Answer' section at class comment
   * @see '# Answer Object' section at class comment
   */
  toUserAnswer: function(answerObjects) {
    answerObjects = answerObjects.sortBy('order');
    return !answerObjects || !answerObjects.length
      ? null //if not respond is provided
      : answerObjects.map(function(answerObject) {
        return Ember.get(answerObject, 'answerId');
      });
  }
});
