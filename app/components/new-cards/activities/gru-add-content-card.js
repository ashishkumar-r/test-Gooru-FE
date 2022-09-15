import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import InstructionalCoacheMixin from 'gooru-web/mixins/instructional-coache-mixin';

export default Ember.Component.extend(InstructionalCoacheMixin, {
  classNames: ['new-cards', 'gru-add-content-card'],

  session: Ember.inject.service('session'),
  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  actions: {
    onAddActivity() {
      const component = this;
      const content = component.get('content');
      if (!component.get('isEmptyContent')) {
        // based on token we trigger action
        if (component.get('enableVideoConference')) {
          component.sendAction('onAddActivityPop', content);
        } else {
          component.sendAction('onAddActivity', content);
        }
      }
    },

    onShowDaterangePicker(id) {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_CA_SHOW_SCOPE_SEQUENCE_SCHEDULE);
      if (!component.get('isEmptyContent')) {
        component.set('isShowDaterangePicker', true);
        component.set('activityId', id);
      }
    },

    onCloseDaterangePicker() {
      const component = this;
      component.set('isShowDaterangePicker', false);
    },

    onScheduleByDate(startDate, endDate, conferenceContent = null) {
      const component = this;
      const content = conferenceContent
        ? Object.assign(component.get('content'), conferenceContent)
        : component.get('content');
      component.set('isShowDaterangePicker', false);
      component.sendAction('onAddActivity', content, startDate, endDate);
      const context = {
        classId: content.id,
        courseId: content.ownerId,
        additionalText: {
          title: content.title
        }
      };
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.ASSIGN_ACTIVITY, context);
    },
    onScheduleByMonth(month, year) {
      const component = this;
      const content = component.get('content');
      const isScheduleByMonth = true;
      component.set('isShowDaterangePicker', false);
      component.sendAction(
        'onAddActivity',
        content,
        null,
        null,
        month,
        year,
        isScheduleByMonth
      );
    },

    onShowContentPreview() {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_CA_SHOW_PREVIEW_SCOPE_SEQUENCE_CARD);
      const content = component.get('content');
      component.sendAction('onShowContentPreview', content);
    }
  },

  contentType: Ember.computed.alias('content.format'),

  isAssessment: Ember.computed.equal('contentType', CONTENT_TYPES.ASSESSMENT),

  isCollection: Ember.computed.equal('contentType', CONTENT_TYPES.COLLECTION),

  isOfflineActivity: Ember.computed.equal(
    'contentType',
    CONTENT_TYPES.OFFLINE_ACTIVITY
  ),

  isEmptyContent: Ember.computed('content', function() {
    const component = this;
    const content = component.get('content');
    if (content) {
      let contentType = content.get('format');
      return (
        (contentType === CONTENT_TYPES.COLLECTION &&
          parseInt(content.get('resourceCount')) === 0 &&
          parseInt(content.get('questionCount')) === 0) ||
        (contentType === CONTENT_TYPES.ASSESSMENT &&
          parseInt(content.get('questionCount')) === 0) ||
        (contentType === CONTENT_TYPES.OFFLINE_ACTIVITY &&
          parseInt(content.get('taskCount')) === 0)
      );
    }
  }),

  allowTwoDateRangePicker: true,

  enableVideoConference: Ember.computed.alias('session.enabledVideoConference'),

  isShowTaxonomyTag: false,

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  taxonomyTags: Ember.computed('content.standards.[]', function() {
    var standards = this.get('content.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
    }
    return TaxonomyTag.getTaxonomyTags(standards);
  }),

  isInstructionalCoache: Ember.computed(function() {
    return this.instructionalCoache();
  })
});
