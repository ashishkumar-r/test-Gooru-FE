import Ember from 'ember';
import Env from '../../config/environment';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['student-impersonate'],

  // -------------------------------------------------------------------------
  // Properties

  studentImpersonateFrame: false,

  impersonateUrl: '',

  // -------------------------------------------------------------------------
  // Dependencies

  session: Ember.inject.service(),

  /**
   * @property {Ember.Service} Session service
   */
  sessionService: Ember.inject.service('api-sdk/session'),

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    Ember.$('#impersonate-frame').on('load', function() {
      Ember.$('.student-impersonate #impersonate-frame')
        .contents()
        .find('body')
        .addClass('frame-app-readyonly');
    });
  },

  didDestroyElement() {
    window.impersonate = false;
    Ember.$('.student-impersonate #impersonate-frame')
      .contents()
      .find('body')
      .removeClass('frame-app-readyonly');
    const rootElement = Ember.$(Env.rootElement);
    rootElement.removeClass('app-readonly-mode');
  },

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    onClosePullUp() {
      const rootElement = Ember.$(Env.rootElement);
      rootElement.removeClass('app-readonly-mode');
      this.set('studentImpersonateFrame', false);
    }
  }
});
