import Ember from 'ember';

export default Ember.Controller.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  classService: Ember.inject.service('api-sdk/class'),

  session: Ember.inject.service('session'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @property {Service} Notifications service
   */
  notifications: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Join class event
     * @param {string} code
     */
    joinClass: function(code) {
      const controller = this;
      controller.set('allowedCode', true);
      controller.set('validCode', true);
      controller.set('notMember', true);

      controller.get('classService').joinClass(code).then(
        function(classId) {
          if (!classId) {
            //no class is provided when is already joined to that class
            controller.set('isLoading', false);
            controller.set('notMember', null);
          } else {
            controller.send('updateUserClasses'); // Triggers the refresh of user classes in top header
            controller.transitionToRoute('student.class.course-map', classId);
          }
        },
        function(error) {
          controller.set('isLoading', false);
          if (error.code === 'restricted') {
            controller.set('allowedCode', null);
          } else if (error.code === 'not-found') {
            controller.set('validCode', null);
          } else {
            let message = controller
              .get('i18n')
              .t('common.errors.can-not-join-class').string;
            controller.get('notifications').error(message);
          }
        }
      );
    }
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * Indicates if the code is valid, false when the class is not found
   * @property {boolean}
   */
  validCode: true,

  /**
   * Indicates if the code is allowed, false if the user can't join that class
   * @property {boolean}
   */
  allowedCode: true,

  /**
   * Indicates if user is not a member of this class
   * @property {boolean}
   */
  notMember: true,

  /**
   * Indicate if it's waiting for join class callback
   */
  isLoading: false
});
