import AnswerObject from 'gooru-web/utils/question/answer-object';
import QuestionUtil from './question';
import Answer from 'gooru-web/models/content/answer';
import Ember from 'ember';
/**
 * It contains convenience methods for grading and retrieving useful information
 * for Fill in the bLank
 *
 * # Answer object (structure required by the BE)
 *  It is an array containing a json object for each input in the question
 *
 *  text contains the text entered in the specific input
 *  status could have correct or incorrect based on the text entered
 *  order contains the input index, is starts at 1
 *  answerId contains a reference to the question answer id
 *  skip is always false
 *
 * [{"text":"actions","status":"incorrect","order":1,"answerId":1234,"skip":false},
 *  {"text":"object","status":"incorrect","order":2,"answerId":1235,"skip":false}]
 *
 * # User answer (structure used by the FE)
 *  It is an array containing all the text entered by the user,
 *  If an input was left blank, it is still added to this array
 *  The order of the texts in the array mean the input it was filled for
 *
 *  ['black', '', 'blue']
 *
 * @typedef {Object} FillInTheBlankUtil
 */
const FillInTheBlankUtil = QuestionUtil.extend({
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
      correctAnswer[index] &&
      correctAnswer[index].trim().toUpperCase() ===
        answerChoice.trim().toUpperCase()
    );
  },

  /**
   * Gets the correct answer
   * @return {string[]} the correct answer for this question type
   */
  getCorrectAnswer: function() {
    const answers = this.getQuestionAnswers();
    return answers.map(function(answer) {
      return answer.get('text');
    });
  },

  /**
   * Returns a unique key representing the answer

   * @param { string[] } answer
   * @returns { string }
   *
   * @see '# User Answer' section at class comment
   * @see '# Answer Object' section at class comment
   */
  answerKey: function(answer) {
    return answer.join();
  },

  /**
   * Converts the model user answer into an answerObject format
   **
   * @param { string[] } userAnswer
   * @return {AnswerObject[]}
   *
   * @see '# User Answer' section at class comment
   * @see '# Answer Object' section at class comment
   */
  toAnswerObjects: function(userAnswer) {
    let util = this;
    return userAnswer.map(function(text, index) {
      let answer = util.getAnswerByText(text);
      return AnswerObject.create({
        text: text,
        correct: util.isAnswerChoiceCorrect(text, index),
        order: index + 1,
        answerId: answer ? answer.get('id') : 0,
        skip: false
      });
    });
  },

  /**
   * Converts an answerObject format to model userAnswer
   *
   * @param {AnswerObject[]} answerObjects
   * @return {string[]} answer texts
   *
   * @see '# User Answer' section at class comment
   * @see '# Answer Object' section at class comment
   */
  toUserAnswer: function(answerObjects) {
    answerObjects = answerObjects.sortBy('order');
    return !answerObjects || !answerObjects.length
      ? null //if not respond is provided
      : answerObjects.map(function(answerObject) {
        return Ember.get(answerObject, 'text');
      });
  },

  /**
   * FIB returns the question answers from text
   * Some questions got corrupted having more answers when saving the question, it
   * more accurate to generate the questions from text
   * @returns {Answer[]}
   */
  getQuestionAnswers: function() {
    const answersFromText = FillInTheBlankUtil.getQuestionAnswers(
      this.get('question')
    );
    const answers = this.get('question.answers');
    return answers.get('length') !== answersFromText.get('length')
      ? answersFromText
      : answers;
  }
});

FillInTheBlankUtil.reopenClass({
  /**
   * Regular expression used to parse the question text,
   * it ignores sqrt math expression
   */
  FIB_REGEX: {
    //this regex looks for all text in [], it has 2 groups, the first one to get the 4 letters before if any,
    // the second one the word in [], @see getCorrectAnswers
    global: /(.{4})?(\[[^[\]]+])/gi /* negative look behind is not supported in js :( /(?<!sqrt)(\[[^\[\]]+\])+/gi */
  },

  /**
   * Regular expression to math legacy fib question
   */
  LEGACY_REGEX: {
    text: '_______',
    single: /(_______)/,
    global: /(_______)+/gi
  },
  /**
   * Regular expression to math legacy scientific fib question
   */
  SCIENTIFIC_FIB_REGEX: {
    global: /\[](?!{)/
  },
  /**
   * Gets the correct answers from a text
   * @param text
   * @returns {String[]}
   */
  getCorrectAnswers: function(text) {
    const regExp = FillInTheBlankUtil.FIB_REGEX.global;
    let matches = regExp.exec(text);
    let answers = [];
    while (matches) {
      let include = matches[1] === undefined || matches[1] !== 'sqrt'; //when it is at the beginning of the line there is no group 1 //check it is not a sqrt expression, i.e sqrt[2]
      if (include) {
        answers.push(matches[2]); // return second group
      }

      matches = regExp.exec(text);
    }

    return answers;
  },

  /**
   * Convert a text into a fill in the blank display format
   * @param text
   * @returns {*}
   */
  toFibText: function(text) {
    if (text) {
      const inputText = FillInTheBlankUtil.LEGACY_REGEX.text;
      const regExp = FillInTheBlankUtil.FIB_REGEX.global;
      const replacer = function(match, p1 /*, p2, offset, text*/) {
        const replace = p1 === undefined || p1 !== 'sqrt';
        const newText = p1 === undefined ? inputText : `${p1}${inputText}`;
        return replace ? newText : match;
      };
      text = text.replace(regExp, replacer);
    }
    return text;
  },

  /**
   * Generate question answers
   * @param {Question} question
   * @return {Answer[]}
   */
  getQuestionAnswers: function(question) {
    const text = question.get('text');
    const owner = Ember.getOwner(question);
    const matchedAnswers = FillInTheBlankUtil.getCorrectAnswers(text);
    return matchedAnswers.map(function(answer, index) {
      return Answer.create(owner ? owner.ownerInjection() : undefined, {
        sequence: index + 1,
        text: answer.substring(1, answer.length - 1), // it removes []
        isCorrect: true,
        type: 'text'
      });
    });
  }
});

export default FillInTheBlankUtil;
