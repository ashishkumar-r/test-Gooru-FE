import Ember from 'ember';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import { SCREEN_SIZES } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import InstructionalCoacheMixin from 'gooru-web/mixins/instructional-coache-mixin';

export default Ember.Component.extend(InstructionalCoacheMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['cards', 'dca-search-collection-card'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/class-activity
   */
  classActivityService: Ember.inject.service('api-sdk/class-activity'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  session: Ember.inject.service(),

  //
  // -------------------------------------------------------------------------
  // Events
  didRender() {
    let component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * collection object
   * @type {Object}
   */
  collection: null,

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('collection.standards.[]', function() {
    let standards = this.get('collection.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
      return TaxonomyTag.getTaxonomyTags(standards);
    }
  }),

  isInstructionalCoache: Ember.computed(function() {
    return this.instructionalCoache();
  }),

  /**
   * Maintains collection type
   * @type {String}
   */
  contentType: null,

  /**
   * Selected collection for scheduling
   * @type {Object}
   */
  selectedCollectionForSchedule: null,

  /**
   * Class Id
   * @type {String}
   */
  classId: null,

  /**
   * @property {Boolean} isMediumScreen
   * Property to check whether loading card in medium screen or not
   */
  isMediumScreen: Ember.computed(function() {
    return SCREEN_SIZES.MEDIUM >= screen.width;
  }),

  /**
   * @property {Boolean} showSuggestionBtn
   */
  showSuggestionBtn: false,

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when the user play collection
     * It'll open the player in new tab
     */
    onPlayCollection(collection) {
      const component = this;
      if (collection.format === 'collection') {
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_GROWTH_SUGGESTION_COLLECTION_PLAY);
      } else if (collection.format === 'assessment') {
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_GROWTH_SUGGESTION_ASSESSMENT_PLAY);
      }
      component.sendAction('onPreviewContent', collection);
    },

    /**
     * Action triggered when add collection to dca.
     * @param  {Object} collection
     */
    onAddCollectionToDCA(collection) {
      if (collection.format === 'collection') {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_GROWTH_SUGGESTION_COLLECTION_ADD_TODAY_CLASS
        );
      } else if (collection.format === 'assessment') {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_GROWTH_SUGGESTION_ASSESSMENT_ADD_TODAY_CLASS
        );
      }
      this.sendAction('onAddContentToDCA', collection);
    },

    /**
     * Action get triggered when schedule content to CA got clicked
     */
    onScheduleContentToDCA(content, event) {
      if (content.format === 'collection') {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_GROWTH_SUGGESTION_COLLECTION_SCHEDULE_LATER
        );
      } else if (content.format === 'assessment') {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_GROWTH_SUGGESTION_ASSESSMENT_SCHEDULE_LATER
        );
      }
      this.sendAction('onScheduleContentToDCA', content, event);
    },

    // Action triggered when click suggestion button
    onSuggestContent(collection) {
      if (collection.format === 'collection') {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_GROWTH_SUGGESTION_COLLECTION_SUGGEST_STUDENT
        );
      } else if (collection.format === 'assessment') {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_GROWTH_SUGGESTION_ASSESSMENT_SUGGEST_STUDENT
        );
      }
      this.sendAction('onSuggestContent', collection);
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  serializerSearchContent(content, contentId, date, forMonth, forYear) {
    return Ember.Object.create({
      id: contentId,
      added_date: date,
      collection: content,
      activityDate: date,
      forMonth,
      forYear,
      usersCount: -1,
      isActive: false
    });
  }
});
