import Ember from 'ember';
import {
  PLAYER_EVENT_MESSAGE,
  PLAYER_EVENT_SOURCE
} from 'gooru-web/config/config';

/**
 * External Assessment Player Route
 */
export default Ember.Route.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @property {NavigateMapService}
   */
  navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

  /**
   * @requires service:api-sdk/assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @requires service:api-sdk/collection
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  learningToolService: Ember.inject.service('api-sdk/learning-tools'),

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Actrion triggered when close external assessment player
     */
    onClosePlayer() {
      let route = this;
      const controller = route.get('controller');
      let classId = controller.get('classId');
      let source = controller.get('source');
      let isIframeMode = controller.get('isIframeMode');
      let isPreviewReferrer = controller.get('isPreviewReferrer');
      let contentType = controller.get('type');
      let collectionId = controller.get('collectionId');
      route.controllerFor('player-external').stopPlayContentEvent(null, false);
      if (
        isPreviewReferrer &&
        (isPreviewReferrer === true || isPreviewReferrer === 'true')
      ) {
        route.transitionTo(
          contentType === 'collection-external'
            ? 'content.external-collections.edit'
            : 'content.external-assessments.edit',
          collectionId,
          {
            queryParams: {
              isLibraryContent: true,
              isPreviewReferrer: false,
              editing: false
            }
          }
        );
      } else {
        if (isIframeMode) {
          window.parent.postMessage(PLAYER_EVENT_MESSAGE.GRU_PUllUP_CLOSE, '*');
        } else if (source === PLAYER_EVENT_SOURCE.DAILY_CLASS) {
          route.transitionTo('student.class.class-activities', classId);
        } else {
          route.transitionTo('index');
        }
      }
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  model: function(params) {
    const route = this;
    let itemType = params.type;
    let resource =
      itemType === 'collection-external'
        ? route
          .get('collectionService')
          .readExternalCollection(params.collectionId)
        : route
          .get('assessmentService')
          .readExternalAssessment(params.collectionId);
    return Ember.RSVP.hash({
      externalResource: resource
    }).then(({ externalResource }) => {
      let learningToolId = externalResource.get('learningToolId')
        ? externalResource.get('learningToolId')
        : null;
      return Ember.RSVP.hash({
        toolDetails: learningToolId
          ? route
            .get('learningToolService')
            .getLearningToolInformation(learningToolId)
          : null
      }).then(({ toolDetails }) => {
        let mapLocation = Ember.Object.create({
          context: Ember.Object.create({
            classId: params.classId,
            courseId: externalResource.get('courseId'),
            unitId: externalResource.get('unitId'),
            collectionId: externalResource.get('id'),
            lessonId: externalResource.get('lessonId'),
            itemType: itemType
          })
        });

        return {
          source: params.source,
          mapLocation,
          externalResource,
          itemType,
          toolDetails,
          caContentId: params.caContentId
        };
      });
    });
  },

  setupController(controller, model) {
    window.parent.postMessage(PLAYER_EVENT_MESSAGE.GRU_LOADING_COMPLETED, '*');
    controller.set('mapLocation', model.mapLocation);
    controller.set('source', model.source);
    controller.set('resourceType', model.itemType);
    controller.set('externalResource', model.externalResource);
    controller.set('toolDetails', model.toolDetails);
    controller.set('caContentId', model.caContentId);
    if (model.toolDetails) {
      if (model.toolDetails.toolType !== 'LTI') {
        controller.initialize();
      } else {
        controller.intializeLtiTool();
      }
    }
    if (!this.get('session.isAnonymous') && !model.toolDetails) {
      controller.fetchActivityFeedbackCateory();
    }
  }
});
