import Ember from 'ember';
import MultipleChoiceUtil from './multiple-choice';
import AnswerObject from 'gooru-web/utils/question/answer-object';
/**
 * It contains convenience methods for grading and retrieving useful information
 * from True False questions
 *
 * # Answer object (structure required by the BE)
 *
 *   It is an array containing a single json object
 *
 *   text it contains True or False, based on user selection
 *   status could be correct or incorrect based on the user selection
 *   order is always 1
 *   answerId correspond to the answer choice id selected or 0 when the answerId is not provided
 *   skip is always false
 *
 * [{"text":"True","status":"correct","order":1,"answerId":1234,"skip":false}]
 *
 * # User answer (structure used by the FE)
 *
 *   It corresponds to the answerId selected by the user or false|true when the answerId is not provided
 *
 *  ie 123020
 *
 * @typedef {Object} TrueFalseUtil
 */
export default MultipleChoiceUtil.extend({
  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods
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

    /*
     When no answer is found the userAnswer brings true or false indicating the user selection
     */
    let text = answer ? answer.get('text') : userAnswer ? 'True' : 'False';

    /*
     When no answer if found the answerId should be 0
     */
    let answerId = answer ? userAnswer : 0;

    let answerObject = AnswerObject.create({
      text: text,
      correct: util.isCorrect(userAnswer),
      order: 1,
      answerId: answerId,
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
      let text = Ember.get(answerObject, 'text');
      let answerId = Ember.get(answerObject, 'answerId');

      /*
       When answerId = 0, we need to use the text to know the answer selected
       */
      userAnswer = !answerId ? text === 'True' : answerId;
    }

    return userAnswer;
  }
});
