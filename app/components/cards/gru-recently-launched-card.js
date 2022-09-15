import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['gru-recently-launched-card'],

  actions: {
    onClickExplore(program) {
      this.sendAction('onClickExplore', program);
    }
  }
});
