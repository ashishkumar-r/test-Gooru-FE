import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:performance
   */
  performanceService: Ember.inject.service('performance'),

  /**
   * Competency service dependency injection
   * @type {Object}
   */
  competencyService: Ember.inject.service('api-sdk/competency'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['competencies-pull-out-body'],
  // -------------------------------------------------------------------------
  // Properties

  /**
   * collection
   * @return {Object}
   */
  collection: null,

  /**
   * user id
   * @type {String}
   */
  userId: null,

  competency: null,

  //--------------------------------------------------------------------------
  // Observer
  //
  onChangeCompetencyData: Ember.observer('competencyData', function() {
    let component = this;
    component.getUserPerformance();
  }),

  /**
   *  Indicates showSignatureAssessment true or not
   * @type {Boolean}
   */
  showSignatureAssessment: Ember.computed.alias(
    'competency.showSignatureAssessment'
  ),
  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     *
     * Triggered when an menu item is selected
     * @param item
     */
    onClickCollectionTitle: function(collection) {
      let component = this;
      let userId = component.get('userId');
      let collectionId = collection.get('id');
      let sessionId = collection.get('sessionId');
      let summaryReportPromise = null;
      if (collection.get('collectionType') === 'assessment') {
        summaryReportPromise = component
          .get('performanceService')
          .getUserPerformanceResourceInAssessment(
            userId,
            null,
            null,
            null,
            collectionId,
            sessionId,
            null
          );
      } else {
        summaryReportPromise = component
          .get('performanceService')
          .getUserPerformanceResourceInCollection(
            userId,
            null,
            null,
            null,
            collectionId,
            sessionId,
            null
          );
      }
      Ember.RSVP.hash({
        resources: summaryReportPromise
      }).then(({ resources }) => {
        component.set('resources', resources);
        component.resetAccordionArrowBasedOnState();
      });
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  resetAccordionArrowBasedOnState: function() {
    let component = this;
    if (
      component
        .$(`#${component.get('elementId')}-heading > .panel-title a i`)
        .hasClass('fa-caret-down')
    ) {
      component
        .$(`#${component.get('elementId')}-heading > .panel-title a i`)
        .addClass('fa-caret-up')
        .removeClass('fa-caret-down');
    } else {
      component
        .$(`#${component.get('elementId')}-heading > .panel-title a i`)
        .addClass('fa-caret-down')
        .removeClass('fa-caret-up');
    }
  },

  /**
   * @function getUserPerformance
   * Method  fetch UserPerformanceCompetencyCollections
   */
  getUserPerformance() {
    let component = this;
    let userId = component.get('userId');
    let competencyData = component.get('competencyData');
    let competencyMatrixs = component.get('competencyMatrixs');
    return Ember.RSVP.hash({
      collections: component
        .get('competencyService')
        .getUserPerformanceCompetencyCollections(
          userId,
          competencyData.competencyCode
        )
    }).then(({ collections }) => {
      component.set('isLoading', false);
      let collectionData = Ember.A();
      let status;
      let statusMastered;
      if (
        competencyData.status === 2 ||
        competencyData.status === 3 ||
        competencyData.status === 4 ||
        competencyData.status === 5
      ) {
        status = 'Mastered';
        statusMastered = component.get('competencyStatus')
          ? component.get('competencyStatus')[competencyData.status]
          : null;
        collectionData = collections;
        if (!collectionData.length >= 1) {
          statusMastered = component.get('competencyStatus')
            ? component.get('competencyStatus')[2]
            : null;
        }
      } else if (competencyData.status === 1) {
        status = 'in progress';
        collectionData = collections;
      } else {
        status = 'Not Started';
      }
      component.set('collection', collectionData);
      component.set(
        'title',
        competencyData.courseName
          ? competencyData.courseName
          : competencyData.domainName
      );
      component.set('description', competencyData.competencyCode);
      let competency = {
        competencyStatus: status ? status : 'NA',
        date: competencyData.date,
        statusMastered: statusMastered ? statusMastered : null,
        competencyName: competencyData.competencyName,
        competencyCode: competencyData.competencyCode,
        competencySeq: competencyData.competencySeq,
        status: competencyData.status,
        domainCode: competencyData.domainCode,
        domainSeq: competencyData.domainSeq,
        showSignatureAssessment: competencyData.showSignatureAssessment,
        skyline: competencyData.skyline,
        xAxisSeq: competencyData.xAxisSeq,
        yAxisSeq: competencyData.yAxisSeq
      };
      component.set('competency', competency);
      let domainCode = competencyData.get('domainCode');
      let domainCompetencyList = competencyMatrixs.findBy(
        'domainCode',
        domainCode
      );
      component.set('domainCompetencyList', domainCompetencyList);
      component.set(
        'showSignatureAssessment',
        competencyData.showSignatureAssessment
      );
      component.set('showPullOut', true);
    });
  }
});
