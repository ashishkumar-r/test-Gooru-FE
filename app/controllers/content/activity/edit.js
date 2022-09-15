import Ember from 'ember';

export default Ember.Controller.extend({
  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Boolean} allowBack
   */
  allowBack: true,

  /**
   * @property {Boolean} isIndependentOA
   * Property to check, whether it's independent offline activity
   */
  isIndependentOA: false,

  /**
   * @property {Boolean} allowBackToCourse
   * Property to decide whether back redirecto to course edit or profile page
   */
  allowBackToCourse: true
});
