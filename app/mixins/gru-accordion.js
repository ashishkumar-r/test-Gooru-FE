import Ember from 'ember';

/**
 * Properties in common for all accordion components
 *
 * @mixin
 */
export default Ember.Mixin.create({
  // -------------------------------------------------------------------------
  // Properties

  /**
   * @prop {Class} currentClass - class to use as context for the retrieval
   * of information
   */
  currentClass: null,

  /**
   * @prop {Number} index - position of the item in the visibleItems list
   */
  index: null,

  /**
   * @prop {Bool} expanded - is the accordion expanded or collapsed?
   */
  isExpanded: false,

  /**
   * @prop {Bool} isTeacher - is the accordion owner a teacher or not?
   */
  isTeacher: false,

  /**
   * @prop {Ember.RSVP.Promise} items - children of the accordion
   * Will resolve to {Unit[] | Lesson[] | Collection[]}
   */
  items: null,

  /**
   * @prop {Unit | Lesson} model - accordion root
   */
  model: null,

  /**
   * @prop {Unit[] | Lesson[] | Collection[]} visibleItems - Items set to be visible
   */
  visibleItems: Ember.computed.filterBy('items.content', 'visibility', true),

  // -------------------------------------------------------------------------
  // Methods

  /*
   * If 'accordionId' coincides with this accordion's id, it means this accordion
   * should be open; otherwise, it should be closed.
   *
   * @function
   * @param {String} accordionId
   * @return undefined
   */
  updateAccordionById: function(accordionId) {
    if (accordionId && accordionId === this.get('model.id')) {
      if (!this.get('isExpanded')) {
        // If not expanded, open the accordion by simulating a click on the anchor in the heading
        this.$(`#${this.get('elementId')}-heading > .panel-title a`).click();
      }
    } else {
      if (this.get('isExpanded')) {
        // If expanded, close the accordion by simulating a click on the anchor in the heading
        this.$(`#${this.get('elementId')}-heading > .panel-title a`).click();
      }
    }
  }
});
