import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['gru-references'],

  /**
   * Activity model dirty copy passed by caller, for saving exemplar and reference
   */
  model: null,
  /**
   * Collection model as passed by the route. The dirty model used for editing and saving changes to.
   * This is sent to parent for syncing.holds list of references in the activity
   * @property {references}
   */
  references: null,

  isEditing: false,

  // -------------------------------------------------------------------------
  // Events
  init() {
    let component = this;
    component._super(...arguments);
  },
  // -------------------------------------------------------------------------
  // Properties

  createNewReference: null,

  actions: {
    /**
     * Action to save reference, and exemplar fields
     */
    updateContent: function() {
      this.get('updateContent')(this.get('model'));
      this.set('isEditing', false);
    },

    /**
     * Action to save/ add reference
     */

    updateReferenceCollection(reference) {
      const component = this;
      let refsCol = component.get('references');
      refsCol.pushObject(reference);
      component.refreshReference();
      component.get('updateParent')();
    },

    deleteReference(refitem) {
      const component = this;
      if (refitem && refitem.length > 0) {
        refitem = refitem[0];
      } else {
        return;
      }
      component.deleteReferenceItem(refitem);
    },

    deleteUrlReference(refitem) {
      const component = this;
      component.deleteReferenceItem(refitem);
    }
  },

  deleteReferenceItem(refitem) {
    const component = this;
    component
      .get('questionService')
      .deleteReference(refitem)
      .then(refItem => {
        let refsCol = component.get('references');
        refsCol.removeObject(refItem);
        component.refreshReference();
        component.get('updateParent')();
      });
  },
  refreshReference() {
    const component = this;
    let refsCol = component.get('references');
    let newSource = refsCol.slice(0);
    Ember.set(this, 'references', newSource);
    component.set('references', refsCol);
  }
});
