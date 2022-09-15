import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['gru-wpm-reading-table'],

  //--------------------------------------------------------------------------------------------
  //Properties

  question: null,

  hasLinkContent: Ember.computed('question.hasLinkContent', function() {
    return this.get('question.hasLinkContent');
  }),

  wpmResource: Ember.computed('question.wpmResource', function() {
    return this.get('question.wpmResource') || null;
  })
});
