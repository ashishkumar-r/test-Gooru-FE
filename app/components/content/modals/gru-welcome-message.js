import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @dependency {Service} Session service
   */
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['content', 'modals', 'gru-welcome-message'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Check if 'Dont show again' checkbox is selected and create variable on localStorage
     */
    close: function() {
      const $checkboxShowAgain = this.$('#dontShowAgain');

      if ($checkboxShowAgain.prop('checked')) {
        let localStorage = this.getLocalStorage();
        const userId = this.get('session.userId');
        const localStorageItem = `${userId}_dontShowWelcomeModal`;
        localStorage.setItem(localStorageItem, true);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Methods
});
