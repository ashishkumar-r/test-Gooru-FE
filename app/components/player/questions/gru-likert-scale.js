import Ember from 'ember';
import { LIKERT_UI_TEMPLATES } from 'gooru-web/config/config';

export default Ember.Component.extend({
  classNames: ['gru-likert-scale'],

  answer: Ember.computed('answers', function() {
    const answers = this.get('answers');
    return answers && answers.length ? answers[0] : null;
  }),

  answers: Ember.computed('question', function() {
    return this.get('question.answers');
  }),

  activeComponent: Ember.computed('answer', function() {
    const answer = this.get('answer');
    const activeType = LIKERT_UI_TEMPLATES.find(
      item => item.ratingType === answer.uiDisplayGuide.ratingType
    );
    return `content/likert-scale/${activeType.component}`;
  })
});
