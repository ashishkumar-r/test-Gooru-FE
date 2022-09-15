import Ember from 'ember';
import Env from '../config/environment';

export default Ember.Mixin.create({
  /**
   * @property {Service} Profile service
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  setAccessibilitySettingsAPI(data) {
    let settingsObject = data.accessibility_settings;
    let accessibility_settings = {
      screen_zoom_value:
        settingsObject && settingsObject.screen_zoom_value
          ? settingsObject.screen_zoom_value
          : 1,
      is_high_contrast_enabled:
        settingsObject && settingsObject.is_high_contrast_enabled
          ? settingsObject.is_high_contrast_enabled
          : false
    };
    let settingsKey = 'accessibility_settings';
    window.localStorage.setItem(
      settingsKey,
      JSON.stringify(accessibility_settings)
    );
    this.applyAccessibilityToDom(
      accessibility_settings.screen_zoom_value,
      accessibility_settings.is_high_contrast_enabled
    );
  },

  setAccessibilitySettingsFromLocal: function() {
    let settings = 'accessibility_settings';
    let accessibilitySettings = JSON.parse(
      window.localStorage.getItem(settings)
    );
    let screenZoomValuePageSet =
      accessibilitySettings && accessibilitySettings.screen_zoom_value
        ? accessibilitySettings.screen_zoom_value
        : 1;

    let highContrastVisibilityPageSet =
      accessibilitySettings && accessibilitySettings.is_high_contrast_enabled
        ? accessibilitySettings.is_high_contrast_enabled
        : false;
    this.applyAccessibilityToDom(
      screenZoomValuePageSet,
      highContrastVisibilityPageSet
    );
  },

  isHighContrastAvailable() {
    let highContrast = $(
      `link[rel=stylesheet][href='${Env.rootURL}assets/high-contrast.css']`
    );
    if (highContrast.length > 0) {
      return true;
    } else {
      return false;
    }
  },

  applyAccessibilityToDom(
    screenZoomValuePageSet,
    highContrastVisibilityPageSet
  ) {
    $('html').css('zoom', screenZoomValuePageSet);
    if (highContrastVisibilityPageSet) {
      if (!this.isHighContrastAvailable()) {
        $(
          'head #highContrastCssFile'
        )[0].href = `${Env.rootURL}assets/high-contrast.css`;
      }
    } else {
      if (this.isHighContrastAvailable()) {
        $('head #highContrastCssFile')[0].href = '';
      }
    }
  }
});
