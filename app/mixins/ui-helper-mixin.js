import Ember from 'ember';
import { appLocales } from 'gooru-web/utils/utils';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Mixin.create(ConfigurationMixin, {
  session: Ember.inject.service(),

  tenantService: Ember.inject.service('api-sdk/tenant'),

  setTitle(routeName, selectionDetails, defaultValue, customTitle) {
    let title = 'Gooru Navigator';
    let currntUser = this.get('session');
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    const applicationName =
      tenantSettings &&
      tenantSettings.ui_element_visibility_settings &&
      tenantSettings.ui_element_visibility_settings.application_name
        ? tenantSettings.ui_element_visibility_settings.application_name
        : null;

    if (defaultValue) {
      title = 'Gooru Navigator';
    } else if (customTitle) {
      title = 'Navigator for Instructor';
    } else if (currntUser.get('role') === 'teacher') {
      title = 'Navigator for Instructor';
    } else if (currntUser.get('role') === 'student') {
      title = 'Navigator for Learners';
    }
    if (routeName) {
      title += ` | ${routeName}`;
    }
    if (selectionDetails) {
      title += `: ${selectionDetails}`;
    }
    if (applicationName) {
      title = applicationName;
    }
    document.title = title;
  },

  setHTMLLang(lang) {
    const langArray = this.get('configuration.LANGUAGE') || appLocales();
    const selectedLangObject = langArray.findBy('id', lang);
    if (selectedLangObject && selectedLangObject.langCode) {
      $('html')[0].lang = selectedLangObject.langCode;
    } else {
      $('html')[0].lang = 'en';
    }
  },

  saveTourWalkThrough(page, value) {
    const mixin = this;
    const settingsKey = 'tourWalk';
    let tourWalk = mixin.getTourWalkThrough() || {};
    let currntUser = mixin.get('session');
    let userId = currntUser.get('userId');
    tourWalk[userId] = tourWalk[userId] || [];
    if (value && !mixin.checkTourWalkCompleted(page)) {
      tourWalk[userId].push(page);
      window.localStorage.setItem(settingsKey, JSON.stringify(tourWalk));
    }
  },

  getTourWalkThrough() {
    const settingsKey = 'tourWalk';
    let tourWalk = JSON.parse(window.localStorage.getItem(settingsKey));
    return tourWalk;
  },

  checkTourWalkCompleted(page) {
    const mixin = this;
    let currntUser = mixin.get('session');
    let userId = currntUser.get('userId');
    let tourWalk = mixin.getTourWalkThrough() || {};
    tourWalk[userId] = tourWalk[userId] || [];
    return tourWalk[userId].includes(page);
  },

  goForTour(page, primaryComponent) {
    const mixin = this;
    Ember.run.scheduleOnce('afterRender', function() {
      if (!mixin.checkTourWalkCompleted(page)) {
        $(`${primaryComponent} .gru-tour button`).click();
      }
    });
  },

  checkElementRender(elementRender) {
    let element = $(`${elementRender}`);
    if (element && element.length > 0) {
      return true;
    } else {
      return false;
    }
  },

  getVersionStatus(userId) {
    return JSON.parse(window.localStorage.getItem(userId.concat('_whatsNew')));
  },

  setVersionStatus(userId, status) {
    window.localStorage.setItem(
      userId.concat('_whatsNew'),
      JSON.stringify(status)
    );
  }
});
