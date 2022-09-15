import Ember from 'ember';
import QuestionMixin from 'gooru-web/mixins/reports/assessment/questions/question';

/**
 * Open Ended Question
 *
 * Component responsible for controlling the logic and appearance of an open
 * ended question inside of the assessment report
 *
 */
export default Ember.Component.extend(QuestionMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: [
    'reports',
    'assessment',
    'questions',
    'gru-scientific-free-response'
  ],

  // -------------------------------------------------------------------------
  // Properties

  answer: Ember.computed('answerObj', function() {
    let answerDetails = this.get('answerObj');
    let userAnswers = Ember.A([]);
    if (answerDetails) {
      answerDetails.map(function(answer) {
        let answerValue = answer.text
          ? answer.text.split(':')
          : answer.category;
        userAnswers.pushObject({
          category: answer.text
            ? answerValue
              ? answerValue[0]
              : ''
            : answerValue,
          value: answer.text
            ? answerValue
              ? answerValue[1]
              : ''
            : answer.value
        });
      });
    }
    return userAnswers;
  })

  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods
});
