import Ember from 'ember';
import { PLAYER_EVENT_MESSAGE } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  didRender() {
    let component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-player-summary-footer'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered for the next button
     */
    parentNext: function() {
      this.sendAction('parents');
      this.get('parseEventService').postParseEvent(PARSE_EVENTS.CONFIRM_NEXT);
    },

    /**
     * Action triggered for the next button hover
     */
    onShowFeedback: function() {
      this.set('isShowFeedback', true);
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
      this.get('parseEventService').postParseEvent(PARSE_EVENTS.PLAYER_EXIT);
      if (isIframeMode) {
        window.parent.postMessage(PLAYER_EVENT_MESSAGE.GRU_PUllUP_CLOSE, '*');
      } else {
        component.sendAction('onExit', route, id);
      }
    },

    showTimer() {
      this.sendAction('showTimer');
    },

    showFeedbackContainer() {
      this.sendAction('showFeedbackContainer');
    },

    onClosePlayer() {
      this.sendAction('onClosePlayer');
    },

    goBack() {
      this.sendAction('goBack');
    }
  }
});
