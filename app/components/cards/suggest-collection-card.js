import Ember from 'ember';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import InstructionalCoacheMixin from 'gooru-web/mixins/instructional-coache-mixin';

export default Ember.Component.extend(InstructionalCoacheMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['cards', 'suggest-collection-card'],

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Events
  didRender() {
    var component = this;
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

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when the user play collection
     * It'll open the player in new tab
     */
    onPlayCollection(collectionId) {
      if (this.get('collection').format === 'collection') {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_LJ_MILESTONE_REPORT_SUGGEST_COLLECTION_PLAY
        );
      } else if (this.get('collection').format === 'assessment') {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_LJ_MILESTONE_REPORT_SUGGEST_ASSESSMENT_PLAY
        );
      }

      let collectionUrl = `${
        window.location.origin
      }/player/${collectionId}?type=${this.get('collection').format}`;
      window.open(collectionUrl);
    },

    // Action triggered when click suggestion button
    onSuggestCollection(collection) {
      var component = this;
      if (collection.format === 'collection') {
        component
          .get('parseEventService')
          .postParseEvent(
            PARSE_EVENTS.CLICK_LJ_MILESTONE_REPORT_SUGGEST_COLLECTION_ADD
          );
      } else if (collection.format === 'assessment') {
        component
          .get('parseEventService')
          .postParseEvent(
            PARSE_EVENTS.CLICK_LJ_MILESTONE_REPORT_SUGGEST_ASSESSMENT_ADD
          );
      }

      this.sendAction('onSuggestCollection', collection);
    },

    /**
     * Action triggered when add collection to dca.
     * @param  {Object} collection
     */
    onAddCollectionToDCA(collection) {
      var component = this;
      if (collection.format === 'collection') {
        component
          .get('parseEventService')
          .postParseEvent(
            PARSE_EVENTS.CLICK_GROWTH_SUGGESTION_COLLECTION_ADD_TODAY_CLASS
          );
      } else if (collection.format === 'assessment') {
        component
          .get('parseEventService')
          .postParseEvent(
            PARSE_EVENTS.CLICK_GROWTH_SUGGESTION_ASSESSMENT_ADD_TODAY_CLASS
          );
      }

      this.sendAction('onAddCollectionToDCA', collection);
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
    }
  }
});
