import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['reports', 'assessment', 'questions', 'gru-match-question'],

  answers: Ember.computed('question.answers', function() {
    let answers = this.get('question.answers');
    return answers;
  }),

  leftArray: Ember.computed('answers', function() {
    return this.get('answers');
  }),

  rightArray: Ember.computed('answers', function() {
    const showCorrect = this.get('showCorrect');
    const answerObj = this.get('answerObj') || [];
    const userAnswers = Ember.A([]);
    const ansSeq = answerObj.mapBy('text');
    const questionAnswer = this.get('answers');
    ansSeq.forEach(userSeq => {
      const ansObj = questionAnswer.find(item => {
        return (
          `${item.sequence},${item.leftValue},${item.rightValue},${item.rightValShuffleOrder}` ===
          userSeq
        );
      });
      userAnswers.pushObject(ansObj);
    });
    return showCorrect ? this.get('answers') : userAnswers;
  })
});
