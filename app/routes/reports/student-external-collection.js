import Ember from 'ember';

export default Ember.Route.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @requires service:api-sdk/assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @requires service:api-sdk/collection
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Methods

  model: function(params) {
    const route = this;
    let itemType = params.type;
    let collectionId = params.collectionId;
    let collection =
      itemType === 'collection-external'
        ? route.get('collectionService').readExternalCollection(collectionId)
        : route.get('assessmentService').readExternalAssessment(collectionId);
    return Ember.RSVP.hash({
      collection: collection
    }).then(({ collection }) => {
      return {
        collection,
        score: params.score,
        timespent: params.timespent
      };
    });
  },

  setupController(controller, model) {
    this._super(...arguments);
    if (model && model.collection) {
      controller.set('collection', model.collection);
      controller.set('collectionObj', model.collection);
      controller.set('score', Number(model.score));
      controller.set('timespent', Number(model.timespent));
      if (!this.get('session.isAnonymous')) {
        controller.fetchActivityFeedbackCateory();
      }
    }
  }
});
