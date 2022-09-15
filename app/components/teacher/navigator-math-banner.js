import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Component.extend(ConfigurationMixin, {

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['navigator-math-banner'],

  // -------------------------------------------------------------------------
  // Service
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @type {I18nService} Service to retrieve translations information
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Actions
  actions: {

    /**
     * Action triggered when click join class
     */
    onJoinDemoClass() {
      let component = this;
      component.joinCoTeacherIntoClass();
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function joinCoTeacherIntoClass
   * Method to join into a class as a co-teacher
   */
  joinCoTeacherIntoClass() {
    const component = this;
    const configuration = component.get('configurationService.configuration');
    let classService = component.get('classService');
    let classCode = configuration.get('demoClass.code');
    let classId = configuration.get('demoClass.id');
    let joinActionPromise = classService.joinCoTeacherIntoClass(classCode);
    return joinActionPromise.then(function() {
      component.set('status', component.get('i18n').t('teacher-landing.navigator-banner.success-message'));
      component.set('isJoinedSuccessfully', true);
      component.sendAction('updateClass', classId);
    }).catch(function() {
      component.set('status', component.get('i18n').t('teacher-landing.navigator-banner.error-message'));
      component.set('isJoinedSuccessfully', false);
    });
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Boolean} isJoinedSuccessfully
   */
  isJoinedSuccessfully: false,

  /**
   * @property {String} status
   */
  status: null
});
