import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['competency-content-report'],

  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @requires service:api-sdk/competency
   */
  competencyService: Ember.inject.service('api-sdk/competency'),

  /**
   * @requires service:api-sdk/search
   */
  searchService: Ember.inject.service('api-sdk/search'),

  /**
   * @requires service:api-sdk/search
   */
  suggestService: Ember.inject.service('api-sdk/suggest'),

  /**
   * Session object of logged in user
   * @type {Object}
   */
  session: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    let component = this;
    component.set('learningMapData', null);
    component.loadCompetencyPerformanceData();
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    onConfirmSuggest(collection, collectionType, competencyCode) {
      const component = this;
      const studentList = component.get('studentListForSuggestion');
      if (studentList && studentList.length) {
        studentList.map(student => {
          component.suggestContent(
            student.userId,
            collection,
            collectionType,
            competencyCode
          );
        });
      } else {
        const userId = component.get('userId');
        component.suggestContent(
          userId,
          collection,
          collectionType,
          competencyCode
        );
      }
    },

    playContent(queryParams, contentId, content) {
      const component = this;
      component.sendAction('playContent', queryParams, contentId, content);
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadCompetencyPerformanceData
   * Method to load individual competency performance of the user
   */
  loadCompetencyPerformanceData() {
    const component = this;
    const userId = component.get('userId');
    if (userId) {
      return Ember.RSVP.hash({
        collectionPerformances: component.fetchUserCompetencyPerformance()
      }).then(({ collectionPerformances }) => {
        component.set('collectionPerformances', collectionPerformances);
      });
    }
  },

  /**
   * @function fetchUserCompetencyPerformance
   * Method to fetch competency performance of an user
   */
  fetchUserCompetencyPerformance() {
    const component = this;
    const userId = component.get('userId');
    const competencyService = component.get('competencyService');
    const competencyCode = component.get('competency.competencyCode');
    return new Ember.RSVP.resolve(
      competencyService.getUserPerformanceCompetencyCollections(
        userId,
        competencyCode
      )
    );
  },

  suggestContent(userId, collection, collectionType, competencyCode) {
    const component = this;
    let contextParams = {
      user_id: userId,
      class_id: component.get('classId'),
      suggested_content_id: collection.get('id'),
      suggestion_origin: 'teacher',
      suggestion_originator_id: component.get('session.userId'),
      suggestion_criteria: 'performance',
      suggested_content_type: collectionType,
      suggested_to: 'student',
      suggestion_area: 'proficiency',
      tx_code: competencyCode,
      tx_code_type: 'competency'
    };
    component.get('suggestService').suggestContent(contextParams);
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Array} collectionPerformances
   */
  collectionPerformances: Ember.A([]),

  /**
   * @property {Boolean} isLoading
   */
  isLoading: false,

  /**
   * @property {Boolean} isStudent
   */
  isStudent: false,

  /**
   * @property {String} classId
   */
  classId: Ember.computed.alias('class.id'),

  /**
   * @property {Boolean} showSignatureAssessment
   */
  showSignatureAssessment: Ember.computed('competency', function() {
    let component = this;
    return component.get('competency.showSignatureAssessment');
  }),

  onCompetencyChange: Ember.observer('competency', function() {
    let component = this;
    component.set('learningMapData', null);
    let showSignatureAssessment = component.get(
      'competency.showSignatureAssessment'
    );
    component.set('showSignatureAssessment', showSignatureAssessment);
    component.loadCompetencyPerformanceData();
  })
});
