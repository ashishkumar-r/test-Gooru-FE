import Ember from 'ember';
import RemixBaseModal from 'gooru-web/components/content/modals/gru-base-remix';

export default RemixBaseModal.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Service} Assessment service API SDK
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @property {Service} Collection service API SDK
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @property {Service} Resource service API SDK
   */
  resourceService: Ember.inject.service('api-sdk/resource'),

  fluencyService: Ember.inject.service('api-sdk/fluency'),

  tenantService: Ember.inject.service('api-sdk/tenant'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-resource-remix'],

  isShowFluencyLevel: Ember.computed(function() {
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    return tenantSettings && tenantSettings.fluency_level === 'on';
  }),
  // -------------------------------------------------------------------------
  // Actions

  copyContent: function(resource) {
    return this.get('resourceService').copyResource(
      resource.get('id'),
      resource.get('title')
    );
  },

  updateContent: function(resource) {
    const component = this;
    let collectionId = component.get('collectionId');
    if (
      component.get('model').collection.metadata &&
      component.get('model').collection.metadata.fluency &&
      component.get('isShowFluencyLevel')
    ) {
      const fluData = Ember.Object.create({});
      fluData.fluency = component.get('model').collection.metadata.fluency;
      component
        .get('fluencyService')
        .updateFluencyLevel(fluData, 'collections', collectionId);
    }
    return collectionId
      ? component
        .get('collectionService')
        .addResource(collectionId, resource.get('id'))
      : Ember.RSVP.resolve();
  },

  showSuccessNotification: function(resource) {
    var component = this;
    var successMsg = component.get('i18n').t('common.remix-resource-success', {
      resourceTitle: resource.get('title')
    });
    var resourceEditUrl = component
      .get('router')
      .generate('content.resources.edit', resource.get('id'));
    var edit = component.get('i18n').t('common.edit');
    component
      .get('notifications')
      .success(
        `${successMsg} <a class="btn btn-success" href="${resourceEditUrl}">${edit}</a>`
      );
  },

  showFailureNotification: function() {
    const message = this.get('i18n').t('common.errors.resource-not-copied')
      .string;
    this.get('notifications').error(message);
  },

  init: function() {
    this._super(...arguments);
    this.set('collectionId', this.get('model.collectionId'));
  },

  collectionId: null,

  isCollection: null
});
