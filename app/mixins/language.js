import Ember from 'ember';
import Env from 'gooru-web/config/environment';

export default Ember.Mixin.create({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * device_language_key
   */
  device_language_key: 'deviceLanguage',

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyServices: Ember.inject.service('api-sdk/taxonomy'),

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Methods

  getLocalStorage: function() {
    return window.localStorage;
  },

  changeLanguages(classes) {
    const mixin = this;
    if (classes.preference && classes.preference.subject) {
      let subjectCode = classes.preference.subject.split('.')[0];
      let whichLocalSet = mixin
        .getLocalStorage()
        .getItem(mixin.device_language_key);
      return Ember.RSVP.hash({
        gradeList: mixin.get('taxonomyServices').fetchGradesBySubject({
          subject: classes.preference.subject,
          fw_code: classes.preference.framework
        })
      }).then(({ gradeList }) => {
        let readingLevel;
        if (classes.gradeCurrent) {
          let grade = gradeList.findBy('id', classes.gradeCurrent);
          if (grade) {
            readingLevel = grade.readingLevel;
          }
        }
        mixin
          .get('profileService')
          .loadScripts(whichLocalSet, subjectCode, readingLevel)
          .then(response => {
            if (response && Object.entries(response).length !== 0) {
              mixin.get('i18n').addTranslations(whichLocalSet, response);
              mixin.setupDefaultLanguage(whichLocalSet);
              mixin
                .getLocalStorage()
                .setItem(mixin.device_language_key, whichLocalSet);
            }
          });
      });
    }
  },

  changeLanguageHomePage() {
    const mixin = this;
    let defaultLocale = Env.i18n.defaultLocale;
    let deviceLanguage = mixin
      .getLocalStorage()
      .getItem(mixin.device_language_key);
    let whichLocalSet = deviceLanguage ? deviceLanguage : defaultLocale;
    mixin
      .get('profileService')
      .loadScript(whichLocalSet)
      .then(response => {
        mixin.get('i18n').addTranslations(whichLocalSet, response);
        mixin.setupDefaultLanguage(whichLocalSet);
        mixin
          .getLocalStorage()
          .setItem(mixin.device_language_key, whichLocalSet);
      });
  },

  /**
   * Setups the application default language
   * @param {lang}  // default language to use
   */
  setupDefaultLanguage: function(lang) {
    if (lang !== undefined) {
      this.set('i18n.locale', lang);
      if (lang === 'ar') {
        const rootElement = Ember.$(Env.rootElement);
        rootElement.addClass('changeDir');
        rootElement.removeClass('changeDirDefault');
      } else {
        const rootElement = Ember.$(Env.rootElement);
        rootElement.removeClass('changeDir');
        rootElement.addClass('changeDirDefault');
      }
    }
  }
});
