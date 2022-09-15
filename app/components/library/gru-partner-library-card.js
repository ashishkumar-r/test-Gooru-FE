import Ember from 'ember';

/**
 * Library card
 *
 * Component responsible of showing the library information in cards, so that most useful information is summarized there.
 * @module
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-partner-library-card'],

  // -------------------------------------------------------------------------
  // Events

  init() {
    let component = this;
    component._super(...arguments);
  },

  didRender() {
    let component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    selectLibrary() {
      const component = this;
      let library = component.get('content');
      if (!component.get('onSelectLibrary')) {
        let queryParams = {
          libraryId: library.get('id'),
          type: 'library'
        };
        component.get('router').transitionTo('library-search', {
          queryParams
        });
      } else {
        component.sendAction('onSelectLibrary', library);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Library} content
   */
  content: null,

  /**
   * @property {boolean} Indicates if library has 1 or more courses
   */
  hasCourses: Ember.computed.gt('content.courseCount', 0),

  /**
   * @property {boolean} Indicates if library has 1 or more collections
   */
  hasCollections: Ember.computed.gt('content.collectionCount', 0),

  /**
   * @property {boolean} Indicates if library has 1 or more assessments
   */
  hasAssessments: Ember.computed.gt('content.assessmentCount', 0),

  /**
   * @property {boolean} Indicates if library has 1 or more resources
   */
  hasResources: Ember.computed.gt('content.resourceCount', 0),

  /**
   * @property {boolean} Indicates if library has 1 or more questions
   */
  hasQuestions: Ember.computed.gt('content.questionCount', 0),

  /**
   * @property {boolean} Indicates if library has 1 or more rubrics
   */
  hasRubrics: Ember.computed.gt('content.rubricCount', 0),

  /**
   * @property {boolean} Indicates if library has 1 or more oA
   */
  hasOfflineActivity: Ember.computed.gt('content.offlineActivityCount', 0),

  redirectUrl: Ember.computed(function() {
    let shortName = this.get('content.shortName');
    let libraryUrl = `library/${shortName}`;
    let defaultUrl = `${libraryUrl}/content/courses`;
    if (this.get('hasCourses')) {
      return defaultUrl;
    } else if (this.get('hasCollections')) {
      return `${libraryUrl}/content/collections`;
    } else if (this.get('hasAssessments')) {
      return `${libraryUrl}/content/assessments`;
    } else if (this.get('hasResources')) {
      return `${libraryUrl}/content/resources`;
    } else if (this.get('hasQuestions')) {
      return `${libraryUrl}/content/questions`;
    } else {
      return defaultUrl;
    }
  })

  // -------------------------------------------------------------------------
  // Methods
});
