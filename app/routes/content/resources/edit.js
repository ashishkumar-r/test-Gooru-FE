import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import EditResourceValidations from 'gooru-web/validations/edit-resource';
import Resource from 'gooru-web/models/content/resource';

export default Ember.Route.extend(PrivateRouteMixin, {
  queryParams: {
    collectionId: {},
    editing: {},
    isLibraryContent: false,
    hasCollaborator: false,
    primaryLanguage: {
      refreshModel: true
    }
  },

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/resource
   */
  resourceService: Ember.inject.service('api-sdk/resource'),

  /**
   * @requires service:api-sdk/collection
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @requires service:century-skill/century-skill
   */
  centurySkillService: Ember.inject.service('century-skill'),

  // -------------------------------------------------------------------------
  // Events

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('collectionId', undefined);
      controller.set('isCollection', undefined);
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  model: function(params) {
    const route = this;
    var resource = route
      .get('resourceService')
      .readResource(params.resourceId)
      .then(function(resource) {
        return route
          .get('profileService')
          .readUserProfile(resource.owner)
          .then(function(owner) {
            var EditResourceValidation = Resource.extend(
              EditResourceValidations
            );
            var editResource = EditResourceValidation.create(
              Ember.getOwner(route).ownerInjection()
            );
            // standards and info are not coming inside modelProperties
            var properties = resource
              .modelProperties()
              .concat([
                'standards',
                'info',
                'centurySkills',
                'playerMetadata',
                'freeFormTag'
              ]);
            editResource.merge(resource, properties);
            editResource.set('owner', owner);
            return editResource;
          });
      });
    var isEditing = params.editing;
    var collection = null;
    const isLibraryContent = params.isLibraryContent;

    if (params.collectionId) {
      collection = route
        .get('collectionService')
        .readCollection(params.collectionId);
    }

    return Ember.RSVP.hash({
      resource: resource,
      collection: collection,
      isEditing: !!isEditing,
      isLibraryContent,
      primaryLanguage: params.primaryLanguage
    });
  },

  setupController(controller, model) {
    const route = this;
    controller.set('resource', model.resource);
    controller.set('collection', model.collection);
    controller.set('isEditing', model.isEditing);
    controller.set('isLibraryContent', model.isLibraryContent);
    controller.set('primaryLanguage', model.primaryLanguage);

    route
      .get('centurySkillService')
      .findCenturySkills()
      .then(function(centurySkillsArray) {
        controller.set('centurySkills', centurySkillsArray.toArray());
      });
    controller.set('tempResource', model.resource.copy());
  }
});
