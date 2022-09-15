import Ember from 'ember';

/**
 * Model for items (units and lessons) in the content builder. It wraps the model of a Unit
 * or Lesson with additional properties useful for the display of their data.
 *
 * @typedef {Object} BuilderItem
 */
export default Ember.Object.extend({
  /**
   * @property {Boolean} isExpanded - Is the builder item expanded or collapsed?
   */
  isExpanded: false,

  /**
   * @property {Boolean} isEditing - Is the builder item being edited or not?
   */
  isEditing: false,

  /**
   * @property {Boolean} isEditing - Is the builder item being edited or not?
   */
  isNew: Ember.computed.not('data.id'),

  /**
   * @property {Content/Unit|Content/Lesson} model - Builder item content
   */
  data: null
});
