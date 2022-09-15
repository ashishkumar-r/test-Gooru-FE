import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['legend-info-pull-up'],

  actions: {
    togglePullup() {
      this.toggleProperty('isLegendPullup');
    }
  }
});
