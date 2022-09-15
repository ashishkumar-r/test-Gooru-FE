import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['uploaded-item'],
  /**------------------------------------------------------------------------------------------------
   * list submission, update parent for removal
   * ------------------------------------------------------------------------------------------------*/

  // -------------------------------------------------------------------------
  // Attributes
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Updates parent for removal
     */
    removeLineItem() {
      const component = this;
      component.get('removeLineItem')(component.get('submission'));
    },

    updateSubmissionCollection() {
      const component = this;
      component.get('updateSubmissionCollection')(
        component.get('submission').taskSubmissionSubType
      );
    }
  },
  // -------------------------------------------------------------------------
  // Events
  init() {
    this._super(...arguments);
  }
  // -------------------------------------------------------------------------
  // Properties
});
