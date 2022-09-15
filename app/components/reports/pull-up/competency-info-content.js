import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['competency-info-content'],

  /**
   * @property {String} selectedItem
   * Property to store selected item
   */
  selectedItem: Ember.computed('userId', function() {
    const component = this;
    return component.get('userId')
      ? this.get('isClassActivity')
        ? 'metadata'
        : 'journey'
      : 'metadata';
  }),

  actions: {
    selectItem(item) {
      const component = this;
      component.set('selectedItem', item);
    },

    onSuggestContent(collection, collectionType) {
      const component = this;
      component.sendAction('onSuggestContent', collection, collectionType);
    }
  }
});
