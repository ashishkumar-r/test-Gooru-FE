import Ember from 'ember';

export default Ember.Controller.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  queryParams: ['unitId', 'lessonId'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Sets the current course builder location
     * @param unitId
     * @param lessonId
     */
    setLocation: function(unitId, lessonId = undefined) {
      this.set('unitId', unitId || null);
      this.set('lessonId', lessonId || null);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Profile[]} remixedUsers
   */
  remixedUsers: null,

  /**
   * @property {Profile[]} createdUsers
   */
  createdUsers: null,

  /**
   * @property {boolean}
   */
  isOwner: null,

  /**
   * @property  {string}
   */
  unitId: null,

  /**
   * @property {string}
   */
  lessonId: null,

  // -------------------------------------------------------------------------
  // Methods

  resetValues: function() {
    this.set('unitId', null);
    this.set('lessonId', null);
  }
});
