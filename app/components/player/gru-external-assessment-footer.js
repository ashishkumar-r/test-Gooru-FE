import Ember from 'ember';
import {
  PLAYER_EVENT_MESSAGE,
  EXTERNAL_PLAYER_ACTIONS
} from 'gooru-web/config/config';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-external-assessment-footer'],

  // ---------------------------------------------------------------------------
  // Properties

  hideContinue: false,

  isFullView: false,

  // -------------------------------------------------------------------------
  // Events
  didRender() {
    let component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered for the next button
     */
    playNext: function() {
      this.sendAction('playNext');
    },

    /**
     * Action triggered for the next button hover
     */
    onShowFeedback: function() {
      this.toggleProperty('isShowFeedback');
      this.sendAction('showFeedbackContainer');
    },

    /**
     * Action triggered for the next button move out
     */
    onCloseFeedback: function() {
      this.set('isShowFeedback', false);
    },

    /**
     * Action triggered when toggle screen mode
     */
    onToggleScreen() {
      let component = this;
      component.sendAction('onToggleScreen');
    },

    onExit(route, id) {
      let component = this;
      let isIframeMode = component.get('isIframeMode');
      if (isIframeMode) {
        window.parent.postMessage(PLAYER_EVENT_MESSAGE.GRU_PUllUP_CLOSE, '*');
      } else {
        component.sendAction('onExit', route, id);
      }
    },

    showTimer() {
      this.sendAction('showTimer');
    },

    onStartPlayer() {
      this.set('hideContinue', true);
      this.sendAction('onPlayerAction', EXTERNAL_PLAYER_ACTIONS.START);
    },

    toggleDetailPullup() {
      this.toggleProperty('isFullView');
      this.sendAction('toggleDetailPullup');
    }
  }
});
