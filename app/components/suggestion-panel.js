import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import InstructionalCoacheMixin from 'gooru-web/mixins/instructional-coache-mixin';

export default Ember.Component.extend(InstructionalCoacheMixin, {
  /**
   * @property {String} source value when playing a collection/assessment
   */
  source: null,

  /**
   * @property {String} collectionType suggested content type
   */
  collectionType: null,

  /**
   * @property {Object} content suggested content
   */
  content: null,

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  session: Ember.inject.service('session'),

  isInstructionalCoache: Ember.computed(function() {
    return this.instructionalCoache();
  }),
  actions: {
    onSuggestContent(content, collectionType) {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_PROFICIENCY_CHARTS_SUGGESTION);
      component.sendAction('onSuggestContent', content, collectionType);
    },

    onPreviewContent() {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_PROFICIENCY_CHARTS_SUGGESTION_PRE);
      component.sendAction('onPreviewContent', this.content);
    },

    playContent() {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_PROFICIENCY_CHARTS_SUGGESTION_PLAY);
      const content = component.get('content');
      const contentId = content.get('collection.id');
      let queryParams = {
        classId: component.get('class.id'),
        collectionId: contentId,
        role: 'student',
        source: component.get('source'),
        type: component.get('collectionType'),
        isIframeMode: true
      };
      if (component.get('isTeacherSuggestion')) {
        queryParams.pathId = content.id;
        queryParams.pathType = 'proficiency.teacher';
      }
      let playerContent = content.get('collection');
      playerContent.set('format', component.get('collectionType'));
      component.sendAction(
        'playContent',
        queryParams,
        contentId,
        playerContent
      );
    }
  }
});
