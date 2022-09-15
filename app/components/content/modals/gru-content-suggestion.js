import Ember from 'ember';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-content-suggestion'],

  // -------------------------------------------------------------------------
  // Services

  /**
   * @required collectionService
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @required assessmentService
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),
  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    let component = this;
    let mapLocation = component.get('mapLocation');
    let suggestedContent = mapLocation.suggestions[0];
    let currentContentContext = mapLocation.context;
    let currentItemId = currentContentContext.itemId;
    component.animateComponent();
    let currentContentPromise =
      currentContentContext.itemType === 'assessment'
        ? component.getAssessmentById(currentItemId)
        : component.getCollectionById(currentItemId);
    currentContentPromise.then(function(currentContent) {
      component.set('suggestedContent', suggestedContent);
      component.set('currentContent', currentContent);
    });
    Ember.$('body').addClass('system-suggested');
  },

  willDestroyElement() {
    this._super(...arguments);
    Ember.$('body').removeClass('system-suggested');
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Action triggered when the user accept a suggestion
     */
    onAcceptSuggestion() {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_STUDY_PLAYER_SUGGESTION_CONTINUE);
      component.sendAction('onAcceptSuggestion');
    },

    /**
     * Action triggered when the user ignore a suggestion
     */
    onIgnoreSuggestion() {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_STUDY_PLAYER_SUGGESTION_NOTNOW);
      component.sendAction('onIgnoreSuggestion');
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function animateComponent
   * Method to animate the component
   */
  animateComponent() {
    let component = this;
    component.$().animate(
      {
        bottom: '50px'
      },
      850
    );
  },

  /**
   * @function getCollectionById
   * Method to get a collection using ID
   */
  getCollectionById(collectionId) {
    let component = this;
    const collectionService = component.get('collectionService');
    return Ember.RSVP.hash({
      collection: collectionService.readCollection(collectionId)
    }).then(function(hash) {
      return hash.collection;
    });
  },

  /**
   * @function getAssessmentById
   * Method to get a assessment by ID
   */
  getAssessmentById(assessmentId) {
    let component = this;
    const assessmentService = component.get('assessmentService');
    return Ember.RSVP.hash({
      assessment: assessmentService.readAssessment(assessmentId)
    }).then(function(hash) {
      return hash.assessment;
    });
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('currentContent', function() {
    let standards = this.get('currentContent.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
      return TaxonomyTag.getTaxonomyTags(standards);
    }
  }),

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags which is available in the suggested content
   */
  suggestedTags: Ember.computed('suggestedContent', function() {
    let standards = this.get('suggestedContent.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
      return TaxonomyTag.getTaxonomyTags(standards);
    }
  }),

  /**
   * @property {String} suggestedContentType
   * Property for suggested content type
   */
  suggestedContentType: Ember.computed('suggestedContent.type', function() {
    const suggestedContent = this.get('suggestedContent');
    return suggestedContent
      ? suggestedContent.get('type')
      : CONTENT_TYPES.COLLECTION;
  }),

  /**
   * @property {Boolean} isAssessment
   * Property to check whether suggested content is an assessment or not
   */
  isAssessment: Ember.computed.equal(
    'suggestedContentType',
    CONTENT_TYPES.ASSESSMENT
  )
});
