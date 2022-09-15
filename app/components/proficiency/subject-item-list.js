import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['proficiency', 'subject-item-list'],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Object}
   * Property to store user selected object
   */
  selectedItem: null,

  /**
   * @property {Array}
   * Property to store list of taxonomy subjects
   */
  taxonomySubjects: null,

  //------------------------------------------------------------------------
  // actions
  actions: {
    /**
     * Action triggered when the user select a subject item
     */
    onSelectItem(item) {
      let component = this;
      component.set('selectedItem', item);
      component.sendAction('onSelectItem', item);
    }
  }
});
