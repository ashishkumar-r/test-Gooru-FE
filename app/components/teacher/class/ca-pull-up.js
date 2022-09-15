import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['ca-pull-up'],

  classNameBindings: ['showPullUp:active'],

  actions: {
    togglePullUp() {
      let component = this;
      component.toggleProperty('showPullUp');
    }
  }
});
