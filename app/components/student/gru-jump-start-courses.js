import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['gru-jump-start-courses'],

  actions: {
    goBack() {
      this.sendAction('goBack');
    }
  }
});
