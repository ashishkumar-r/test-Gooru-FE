import Ember from 'ember';
import QuestionMixin from 'gooru-web/mixins/reports/assessment/questions/question';
import FillInTheBlank from 'gooru-web/utils/question/fill-in-the-blank';

/**
 * Fill in the blank
 *
 * Component responsible for controlling the logic and appearance of a fill in the blank
 * question inside of the assessment report.
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend(QuestionMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'assessment', 'questions', 'gru-scientific-fib'],

  // -------------------------------------------------------------------------
  // Properties

  userAnswers: Ember.computed('userAnswer', function() {
    const component = this;
    let userAnswers = Ember.A([]);
    let userAnswer = component.get('userAnswer');
    if (userAnswer) {
      userAnswer.map(answer => {
        let answerValue = answer.split(':');
        userAnswers.pushObject({
          category: answerValue[0],
          value: answerValue[1]
        });
      });
    }
    return userAnswers;
  }),

  answer: Ember.computed('question.answerObject.[]', 'userAnswers', function() {
    let component = this;
    let answerDetails = component.get('question.answerDetails');
    let userAnswers = component.get('userAnswers')
      ? component.get('userAnswers')
      : '';
    let answerData = answerDetails.map(function(answerDetail) {
      const input = '<input type=\'text\' value=\'\' disabled/>';

      let questionTextParts =
        answerDetail.answer_text.indexOf(input) !== -1
          ? answerDetail.answer_text.split(input)
          : answerDetail.answer_text.split(
            FillInTheBlank.SCIENTIFIC_FIB_REGEX.global
          );
      let answerCategory = answerDetail.answer_category;
      if (userAnswers.length) {
        let userAnswerValue = userAnswers.filterBy(
          'category',
          answerDetail.answer_category
        );
        let answers = userAnswerValue.map(function(answer) {
          return {
            text: answer.value !== '' ? answer.value : ' ',
            class: 'answer'
          };
        });
        component.set('answers', answers);
      } else {
        let correctAnswer = answerDetail.correct_answer;
        let answers = correctAnswer.map(function(userAnswerObject) {
          return {
            text: userAnswerObject,
            class: 'answer correct'
          };
        });
        component.set('answers', answers);
      }

      let sentences =
        Array.isArray(questionTextParts) &&
        questionTextParts.map(function(questionTextPart) {
          return {
            text: questionTextPart,
            class: 'sentence'
          };
        });
      let answers = component.get('answers');
      sentences = answers && answers.length ? sentences : [];
      return component.mergeArrays(sentences, answers, answerCategory);
    });
    return answerData;
  }),

  // -------------------------------------------------------------------------
  // Methods
  /**
   * Merge sentences and answers arrays
   * @return {Array}
   */
  mergeArrays: function(sentences, answers, answerCategory) {
    let mergeArrays = Ember.A();
    answers.forEach(function(item, index) {
      mergeArrays.pushObject(sentences && sentences.get(index));
      mergeArrays.pushObject(item);
    });
    let answerByCategory = Ember.Object.create({
      category: answerCategory,
      value: mergeArrays
    });
    return answerByCategory;
  }
});
