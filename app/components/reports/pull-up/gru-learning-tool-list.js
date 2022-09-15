import Ember from 'ember';
import noteToolMixin from 'gooru-web/mixins/note-tool-mixin';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend(noteToolMixin, tenantSettingsMixin, {
  classNames: ['gru-learning-tool-list'],

  session: Ember.inject.service(),

  learningToolService: Ember.inject.service('api-sdk/learning-tools'),

  isShowLearningTool: false,

  learningTools: Ember.A([]),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  didInsertElement() {
    if (this.get('showLearningTool') && !this.get('session.isAnonymous')) {
      const noteFrame = document.querySelector('#noteIframe');
      if (noteFrame && $('#note-tool-div').css('display') === 'none') {
        noteFrame.contentWindow.location.reload();
      }
      this.fetchLearningTools();
    }
  },

  // --------------------------------------------------------------------------
  // Actions
  actions: {
    onClose() {
      this.set('isShowLearningTool', false);
    },

    noteToolCall() {
      const route = this.get('router');
      let sourceDetails = window.sourceDetailsNoteTool;
      if (route.currentRouteName) {
        sourceDetails.source = route.currentRouteName;
      }
      const playerIframe = document.querySelector('#iframe-player');
      if (playerIframe) {
        const playerSide = playerIframe.contentWindow.sourceDetailsNoteTool;
        if (playerSide.source) {
          sourceDetails.source = playerSide.source;
        }
        sourceDetails = { ...playerSide, ...sourceDetails };
      }
      this.displayToggleNote(sourceDetails);
      this.set('isShowLearningTool', false);
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_NOTE_TAKING_TOOL
      );
    }
  },

  // ---------------------------------------------------------------------------
  // Methods
  fetchLearningTools() {
    let component = this;
    component
      .get('learningToolService')
      .fetchLearningTool()
      .then(learingTool => {
        component.set('learningTools', learingTool);
      });
  }
});
