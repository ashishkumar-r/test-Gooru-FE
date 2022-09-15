import Ember from 'ember';
import { PLAYER_EVENT_SOURCE } from 'gooru-web/config/config';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(tenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['ca-student-suggestion-panel'],

  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @requires service:api-sdk/suggest
   */
  suggestService: Ember.inject.service('api-sdk/suggest'),

  actions: {
    onClosePullUp() {
      const component = this;
      component.set('showStudentList', false);
    },
    onPullUpClose() {
      const component = this;
      component.closePullUp();
    },

    openStudentList(suggestion) {
      const component = this;
      component.set('selectedSuggestion', suggestion);
      component.set('showStudentList', true);
    },

    onPlayCASuggestionContent(suggestionContent) {
      const component = this;
      const contentId = suggestionContent.get('suggestedContentId');
      const collectionType = suggestionContent.get('suggestedContentType');
      const classId = component.get('classId');

      let queryParams = {
        collectionId: contentId,
        classId,
        role: 'teacher',
        source: PLAYER_EVENT_SOURCE.CLASS_ACTIVITY,
        type: collectionType,
        isIframeMode: true
      };

      component.set(
        'playerUrl',
        component.get('router').generate('player', contentId, { queryParams })
      );
      component.set('isOpenPlayer', true);
      component.set('playerContent', suggestionContent);
      let content = component.get('playerContent');
      content.set('format', collectionType);
    },

    closePullUp() {
      const component = this;
      component.set('isOpenPlayer', false);
    }
  },

  //--------------------------------------------------------------------------
  // Events

  init() {
    const component = this;
    component._super(...arguments);
    component.fetchSuggestionContent();
  },

  didInsertElement() {
    const component = this;
    component.openPullUp();
  },
  //--------------------------------------------------------------------------
  // Methods
  fetchSuggestionContent() {
    const component = this;
    const classId = component.get('classId');
    const activity = component.get('activity');
    const caId = activity.get('id');
    const context = {
      scope: PLAYER_EVENT_SOURCE.CLASS_ACTIVITY,
      caIds: [caId],
      detail: true
    };
    component
      .get('suggestService')
      .fetchSuggestionsByCAId(classId, context)
      .then(content => {
        let suggestions = content.get('suggestions');
        component.set('suggestions', suggestions);
      });
  },

  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    let component = this;
    component.$().animate(
      {
        top: '10%'
      },
      400
    );
  },

  closePullUp() {
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.sendAction('onClosePullUp');
      }
    );
  }
});
