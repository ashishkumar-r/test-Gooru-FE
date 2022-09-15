import Ember from 'ember';

/**
 * Base question util class
 * This utility class defines the basic behavior for all question types
 * it contains convenience methods to grade and retrieve useful information
 * from question types
 *
 * @typedef {Object} QuestionUtil
 */

export default Ember.Object.extend({
  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Resource}
   */
  question: null,

  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods
  /**
   * Indicates if the answer is correct
   * Default implementation, it check if all answer choices are correct
   *
   * @param {Array} answer user answer
   * @return {boolean}
   */
  isCorrect: function(answer) {
    let utility = this;
    let correctAnswer = this.getCorrectAnswer();
    let correct = answer.get('length') === correctAnswer.get('length');
    answer.forEach(function(answerChoice, index) {
      correct = correct && utility.isAnswerChoiceCorrect(answerChoice, index);
    });

    return correct;
  },

  /**
   * Indicates if the answer choice is correct
   * @param { * } answerChoice
   */
  isAnswerChoiceCorrect: function(answerChoice) {
    Ember.Logger.warning(
      'The method getCorrectAnswer is not implemented',
      answerChoice
    );
  },

  /**
   * This method should be implemented at different question types
   *
   * @return {*} the correct answer choice id
   */
  getCorrectAnswer: function() {
    Ember.Logger.warning('The method getCorrectAnswer is not implemented');
  },

  /**
   * This returns the answers distribution
   *
   * @param { [] } userAnswers, i.e [2,1,3,2,1]
   * @return { { answer: *, count: number, key: string }[] }
   */
  distribution: function(userAnswers) {
    const util = this;
    const distributionMap = {};
    const distribution = Ember.A([]);
    const total = userAnswers.length;
    userAnswers.forEach(function(userAnswer) {
      let answerKey = util.answerKey(userAnswer);
      let answerDistribution = distributionMap[answerKey];
      let count = 0;
      let percentage = 0;
      if (!answerDistribution) {
        answerDistribution = Ember.Object.create({
          answer: userAnswer,
          count: count,
          percentage: percentage,
          key: answerKey
        });
        distribution.addObject(answerDistribution);
        distributionMap[answerKey] = answerDistribution;
      } else {
        count = answerDistribution.get('count');
      }
      count += 1;
      answerDistribution.set('count', count);
      answerDistribution.set('percentage', Math.round(count / total * 100));
    });
    return distribution;
  },

  /**
   * Returns a unique key representing the answer
   * @param answer
   * @returns {{}}
   */
  answerKey: function(answer) {
    return answer;
  },

  /**
   * Indicates if two answers are the same
   * @param answerA
   * @param answerB
   * @returns {boolean}
   */
  sameAnswer: function(answerA, answerB) {
    return this.answerKey(answerA) === this.answerKey(answerB);
  },

  /**
   * Converts the model user answer into an answerObject format
   * @param {*} userAnswer
   * @return {AnswerObject[]}
   */
  toAnswerObjects: function(userAnswer) {
    Ember.Logger.warning(
      'The method toAnswerObject is not implemented',
      userAnswer
    );
  },

  /**
   * Converts the model user answer into an answerObject format
   * @see gooru-web/utils/question/*
   * @param {*} userAnswer
   * @return {*[]}
   */
  toJSONAnswerObjects: function(userAnswer) {
    let json = [];
    if (userAnswer) {
      let answerObjects = this.toAnswerObjects(userAnswer);
      json = answerObjects.map(function(answerObject) {
        return {
          text: answerObject.get('text'),
          status: answerObject.get('status'),
          order: answerObject.get('order'),
          answerId: answerObject.get('answerId'),
          skip: answerObject.get('skip')
        };
      });
    }
    return json;
  },

  /**
   * Converts an answerObject format to model userAnswer
   * @param {AnswerObject[]} answerObjects
   */
  toUserAnswer: function(answerObjects) {
    Ember.Logger.warning(
      'The method toUserAnswer is not implemented',
      answerObjects
    );
  },

  /**
   * Gets an Answer by id
   * @param {string} answerId
   * @returns {Answer}
   */
  getAnswerById: function(answerId) {
    return this.getQuestionAnswers().findBy('id', answerId);
  },

  /**
   * Gets an Answer by text
   * @param {string} text
   * @returns {Answer}
   */
  getAnswerByText: function(text) {
    return this.getQuestionAnswers().findBy('text', text);
  },

  /**
   * Returns the question answers
   * @returns {Answer[]}
     */
  getQuestionAnswers: function() {
    return this.get('question.answers');
  }
});
