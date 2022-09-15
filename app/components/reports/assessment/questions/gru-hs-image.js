import Ember from 'ember';
import QuestionMixin from 'gooru-web/mixins/reports/assessment/questions/question';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

// constants
import { DEFAULT_IMAGES } from 'gooru-web/config/config';

/**
 * Hot spot image
 *
 * Component responsible for show the hot spot image, which option is selected
 * and the correct option.
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend(QuestionMixin, ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'assessment', 'questions', 'gru-hs-image'],

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  answers: Ember.computed('question.answerObject.[]', 'anonymous', function() {
    let component = this;
    let question = component.get('question');
    let questionUtil = component.getQuestionUtil(question);
    let userAnswers = component.get('userAnswer');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath

    if (component.get('showCorrect')) {
      userAnswers = questionUtil.getCorrectAnswer();
    }

    let answers = question.get('answers');
    let anonymous = this.get('anonymous');
    return answers.map(function(answer) {
      let userAnswerCorrect = false;
      let selected = false;

      if (userAnswers.includes(answer.get('id'))) {
        userAnswerCorrect = questionUtil.isAnswerChoiceCorrect(
          answer.get('id')
        );
        selected = true;
      }
      let elementClass = anonymous
        ? 'anonymous'
        : userAnswerCorrect
          ? 'correct'
          : 'incorrect';
      return {
        image: answer.get('text')
          ? answer.get('text')
          : appRootPath + DEFAULT_IMAGES.QUESTION_PLACEHOLDER_IMAGE,
        selected: selected,
        class: elementClass
      };
    });
  })

  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods
});
