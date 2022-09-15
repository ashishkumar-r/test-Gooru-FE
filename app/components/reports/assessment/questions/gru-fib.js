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

  classNames: ['reports', 'assessment', 'questions', 'gru-fib'],

  // -------------------------------------------------------------------------
  // Properties
  answer: Ember.computed('question.answerObject.[]', 'anonymous', function() {
    let component = this;
    let question = component.get('question');
    let questionUtil = this.getQuestionUtil(question);
    let questionText =
      Ember.get(question, 'fibText') || Ember.get(question, 'text');
    let questionTextParts = questionText.split(
      FillInTheBlank.LEGACY_REGEX.text
    );
    let userAnswers = component.get('userAnswer');
    let anonymous = component.get('anonymous');
    if (component.get('showCorrect')) {
      userAnswers = questionUtil.getCorrectAnswer();
    }

    let elementClass = 'anonymous';

    // use the anwerobject overall status value to decide whether to underline
    // the user answer in Green or in Red. If overall status value reports user
    // got it incorrect, then try to look at individual answer object..needed
    //    as there can be >=1 blanks at FIB and we try to point out as best as
    //    we can as to the specific blank that is incorrectly answered by user
    let userAnswerObjects = questionUtil.toAnswerObjects(userAnswers);
    let answers = userAnswerObjects.map(function(userAnswerObject, index) {
      if (!userAnswerObject.skip && userAnswerObject.status === 'correct') {
        elementClass = anonymous ? 'anonymous' : 'correct';
      } else {
        let userAnswerCorrect = questionUtil.isAnswerChoiceCorrect(
          userAnswerObject.get('text'),
          index
        );

        elementClass = anonymous
          ? 'anonymous'
          : userAnswerCorrect
            ? 'correct'
            : 'incorrect';
      }

      return {
        text: userAnswerObject.get('text'),
        class: `answer ${elementClass}`
      };
    });

    let sentences = questionTextParts.map(function(questionTextPart) {
      return {
        text: questionTextPart,
        class: 'sentence'
      };
    });

    sentences = userAnswers && userAnswers.length ? sentences : [];
    return this.mergeArrays(sentences, answers);
  }),

  // -------------------------------------------------------------------------
  // Methods
  /**
   * Merge sentences and answers arrays
   * @return {Array}
   */
  mergeArrays: function(sentences, answers) {
    answers.forEach(function(item, index) {
      sentences.insertAt(index * 2 + 1, item);
    });
    return sentences;
  }
});
