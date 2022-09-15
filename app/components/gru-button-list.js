import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['button-list'],

  actions: {
    selectItem(item) {
      const component = this;
      component.sendAction('onSelectItem', item);
    }
  }
});
