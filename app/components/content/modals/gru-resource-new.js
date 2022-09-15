import Ember from 'ember';
import Resource from 'gooru-web/models/content/resource';
import {
  RESOURCE_TYPES,
  UPLOADABLE_TYPES,
  VIDEO_RESOURCE_TYPE,
  H5P_TOOL_RESOURCE_TYPES
} from 'gooru-web/config/config';
import ResourceValidations from 'gooru-web/validations/resource';
import {
  isVideoURL,
  inferUploadType,
  etlSecCalculation
} from 'gooru-web/utils/utils';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @property {ResourceService} Resource service API SDK
   */
  resourceService: Ember.inject.service('api-sdk/resource'),

  /**
   * @property {MediaService} Media service API SDK
   */
  mediaService: Ember.inject.service('api-sdk/media'),

  /**
   * @property {CollectionService} Collection service API SDK
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @property {ProfileService} Profile service API SDK
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @property {Service} Notifications service
   */
  notifications: Ember.inject.service(),

  /**
   * Maintains the session object.
   */
  session: Ember.inject.service('session'),

  fluencyService: Ember.inject.service('api-sdk/fluency'),

  tenantService: Ember.inject.service('api-sdk/tenant'),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-resource-new'],

  classNameBindings: ['component-class', 'contentURL:h5p-container'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    goBack() {
      this.set('existingResource', false);
      this.set('isH5PContent', false);
      this.set('isResourceUpload', false);
      this.set('isHtmlResource', false);
      this.loadData();
    },

    createResource: function(type) {
      const component = this;
      const resource = this.get('resource');
      const etlHrs = resource.get('resourceHours');
      const etlMins = resource.get('resourceMinutes');
      etlSecCalculation(resource, etlHrs, etlMins);
      if (this.get('isResourceUpload') && !this.get('resource.file')) {
        this.set(
          'emptyFileError',
          this.get('i18n').t('common.errors.file-upload-missing', {
            extensions: this.get('resource.extensions')
          })
        );
      } else {
        resource.set('isRemote', !component.get('isResourceUpload'));
        resource.validate().then(function({ validations }) {
          if (validations.get('isValid')) {
            type === 'edit'
              ? component.set('isLoadingMoreDetails', true)
              : component.set('isLoadingCreate', true);
            let resourceId, copiedResourceId;
            component.$('.resource-new button.add-btn').prop('disabled', true);
            component
              .handleResourceUpload(resource)
              .then(function(uploadedResource) {
                component
                  .get('resourceService')
                  .createResource(uploadedResource)
                  .then(function(newResource) {
                    resourceId = newResource.get('id');
                    if (component.get('model')) {
                      return component
                        .get('resourceService')
                        .copyResource(resourceId)
                        .then(function(copyResourceId) {
                          copiedResourceId = copyResourceId;
                          component
                            .get('parseEventService')
                            .postParseEvent(PARSE_EVENTS.CLICK_CREATE_RUBRIC);
                          return component
                            .get('collectionService')
                            .addResource(
                              component.get('model').get('id'),
                              copyResourceId
                            );
                        });
                    } else {
                      return Ember.RSVP.resolve(true);
                    }
                  })
                  .then(
                    function() {
                      if (type === 'edit') {
                        component.onNewResource(
                          copiedResourceId ? copiedResourceId : resourceId
                        );
                      } else {
                        component.get('router').router.refresh();
                        component.set('isLoadingCreate', false);
                        component.triggerAction({
                          action: 'closeModal'
                        });
                        if (resource.format === 'html') {
                          component.onNewResource(
                            copiedResourceId ? copiedResourceId : resourceId
                          );
                        }
                      }
                      component.updateFluency();
                      component
                        .$('.resource-new button.add-btn')
                        .prop('disabled', false);
                    },
                    function(data) {
                      component.set('isLoadingCreate', false);
                      component.set('isLoadingMoreDetails', false);
                      if (data.resourceId) {
                        //already exists
                        component.displayExistingResource(data.resourceId);
                      } else {
                        const message = component
                          .get('i18n')
                          .t('common.errors.resource-not-created').string;
                        component.get('notifications').error(message);
                      }
                      component
                        .$('.resource-new button.add-btn')
                        .prop('disabled', false);
                    }
                  );
              });
          }
          component.set('didValidate', true);
        });
      }
    },

    addTo: function() {
      const component = this;
      component.set('isLoadingAddTo', true);
      var resourceId = component.get('existingResource.id');
      var collectionId = component.get('model.id');
      component.$('.resource-new button.add-btn').prop('disabled', true);
      component
        .get('resourceService')
        .copyResource(resourceId)
        .then(copyId =>
          component.get('collectionService').addResource(collectionId, copyId)
        )
        .then(
          function() {
            component.updateFluency();
            component.get('router').router.refresh();
            component.set('isLoadingAddTo', false);
            component.triggerAction({
              action: 'closeModal'
            });
          },
          function(error) {
            var collectionType = this.get('i18n').t(
              `common.${this.get('collectionType').toLowerCase()}`
            );
            component.get('notifications').error(
              component
                .get('i18n')
                .t('common.errors.resource-not-added-to-collection', {
                  collectionType
                }).string
            );
            Ember.Logger.error(error);
            component.set('isLoadingAddTo', false);
            component.$('.resource-new button.add-btn').prop('disabled', false);
          }
        );
    },

    switchView: function() {
      var resource;
      this.toggleProperty('isResourceUpload');

      if (this.get('isResourceUpload')) {
        // Default upload type will be text (@see config/config.js#UPLOADABLE_TYPES)
        let defaultUploadType = UPLOADABLE_TYPES[1];
        resource = this.get('uploadResource');
        this.set('resource', resource);
        this.actions.selectUploadType.call(this, defaultUploadType);
      } else {
        resource = this.get('urlResource');
        this.set('resource', resource);
        this.actions.selectType.call(this, RESOURCE_TYPES[0]);
      }
    },

    switchHtmlContent: function() {
      var resource;
      resource = this.get('urlResource');
      this.set('resource', resource);
      this.actions.selectType.call(this, RESOURCE_TYPES[6]);
      this.toggleProperty('isHtmlResource');
      this.set('isResourceUpload', false);
      this.set('isH5PContent', false);
    },

    selectFile: function(file) {
      this.set('resource.file', file);

      if (file) {
        let uploadType = inferUploadType(file.name, UPLOADABLE_TYPES);
        this.actions.selectUploadType.call(this, uploadType);
      }
    },

    selectType: function(type) {
      if (!this.get('isVideo')) {
        this.set('resource.format', type);
      }
    },

    selectUploadType: function(uploadType) {
      if (uploadType) {
        this.set('resource.format', uploadType.value);
        this.set('resource.extensions', uploadType.validExtensions);
        this.set('resource.mimeType', uploadType.validType);
      }
    },

    onURLChange: function() {
      this.detectVimeoYoutubeVideoURL(this.get('resource.url'));
    },

    h5pContent: function() {
      this.set('isH5PContent', true);
    },

    generateContentURL: function(contentType, format) {
      this.set('showBackBtn', false);
      let accessToken = this.get('accessToken');
      let contentURL = `${window.location.protocol}//${window.location.host}/tools/h5p/new?accessToken=${accessToken}&contentType=${contentType}&format=${format}`;
      this.set('contentURL', contentURL);
      this.set('isLoading', true);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
    this.loadData();
  },

  loadData() {
    var resourceValidations = new ResourceValidations();

    var urlResourceFactory = Resource.extend(
      resourceValidations.getAllValidations()
    );
    var urlResource = urlResourceFactory.create(
      Ember.getOwner(this).ownerInjection(),
      {
        url: null,
        title: null,
        format: RESOURCE_TYPES[0]
      }
    );

    var uploadResourceFactory = Resource.extend(
      resourceValidations.getValidationsFor(['description', 'format', 'title'])
    );
    var uploadResource = uploadResourceFactory.create(
      Ember.getOwner(this).ownerInjection(),
      {
        title: null
      }
    );

    this.set('urlResource', urlResource);
    this.set('uploadResource', uploadResource);

    if (this.get('isResourceUpload')) {
      this.set('resource', uploadResource);
    } else {
      this.set('resource', urlResource);
    }
  },

  didReceiveAttrs() {
    const component = this;
    /**
     * method used to listen the events from iframe.
     **/
    function receiveMessage(event) {
      if (event.data === 'loading_completed') {
        if (!component.get('isDestroyed')) {
          component.set('isLoading', false);
        }
      } else if (
        event.data.message === 'cancel_event' ||
        event.data.message === 'submit_event'
      ) {
        if (event.data.message === 'submit_event') {
          if (!component.get('isDestroyed')) {
            if (component.get('model')) {
              let resourceId = event.data.clonedEvent.content.contentId;
              component
                .get('resourceService')
                .copyResource(resourceId)
                .then(function(copyResourceId) {
                  return component
                    .get('collectionService')
                    .addResource(
                      component.get('model').get('id'),
                      copyResourceId
                    );
                })
                .then(function() {
                  component.get('router').router.refresh();
                });
            } else {
              component.get('router').router.refresh();
            }
          }
        }
        component.triggerAction({
          action: 'closeModal'
        });
      }
    }

    window.addEventListener('message', receiveMessage, false);
  },
  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {String} list of all valid extension per gooru-web/config/config#UPLOAD_TYPES
   */
  allValidExtensions: Ember.computed('resource.format', function() {
    var extensions = UPLOADABLE_TYPES.find(
      item => item.value === this.get('resource.format')
    );
    return extensions.validExtensions;
  }),

  uploadableTypes: Ember.computed(function() {
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    const visibilityContentTypes =
      tenantSettings &&
      tenantSettings.ui_element_visibility_settings &&
      tenantSettings.ui_element_visibility_settings.visibility_content_types
        ? tenantSettings.ui_element_visibility_settings.visibility_content_types
        : this.get('visibilityContentTypes');
    UPLOADABLE_TYPES.map(function(uploadType) {
      Ember.set(
        uploadType,
        'isShow',
        visibilityContentTypes.other_resources[uploadType.value]
      );
    });
    return UPLOADABLE_TYPES;
  }),

  h5pContentTypes: Ember.computed(function() {
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    const visibilityContentTypes =
      tenantSettings &&
      tenantSettings.ui_element_visibility_settings &&
      tenantSettings.ui_element_visibility_settings.visibility_content_types
        ? tenantSettings.ui_element_visibility_settings.visibility_content_types
        : this.get('visibilityContentTypes');
    H5P_TOOL_RESOURCE_TYPES.map(function(h5p) {
      Ember.set(
        h5p,
        'isShow',
        visibilityContentTypes.interactive_resources[h5p.id]
      );
    });
    return H5P_TOOL_RESOURCE_TYPES;
  }),

  /**
   * @type {?String} specific class
   */
  'component-class': null,

  /**
   * @type {String} emptyFileError
   */
  emptyFileError: null,

  /**
   * @type {String} selectedType
   */
  isResourceUpload: false,

  isHtmlResource: false,

  /**
   * @type {Resource} resource
   */
  resource: null,

  /**
   * @type {String} selectedType
   */
  selectedType: Ember.computed.alias('resource.format'),

  /**
   * @type {Resource} resource
   */
  existingResource: null,

  /**
   * @type {String[]} resourceTypes
   */
  resourceTypes: Ember.computed('isVideo', 'selectedType', function() {
    const isVideo = this.get('isVideo');
    const selectedType = this.get('selectedType');
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    const visibilityContentTypes =
      tenantSettings &&
      tenantSettings.ui_element_visibility_settings &&
      tenantSettings.ui_element_visibility_settings.visibility_content_types
        ? tenantSettings.ui_element_visibility_settings.visibility_content_types
        : this.get('visibilityContentTypes');
    return RESOURCE_TYPES.map(function(resourceType) {
      return Ember.Object.create({
        name: resourceType,
        disabled: resourceType !== VIDEO_RESOURCE_TYPE && isVideo,
        active: resourceType === selectedType,
        isShow: visibilityContentTypes.other_resources[resourceType]
      });
    });
  }),
  isShowFluencyLevel: Ember.computed(function() {
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    return tenantSettings && tenantSettings.fluency_level === 'on';
  }),

  /**
   * Indicate if it's waiting for createResource callback
   */
  isLoadingCreate: false,
  /**
   * Indicate if it's waiting for createResource and Edit callback
   */
  isLoadingMoreDetails: false,
  /**
   * Indicate if it's waiting for addTo callback
   */
  isLoadingAddTo: false,
  /**
   * Indicate if the new resource is a video from youtube or vimeo
   */
  isVideo: false,

  /**
   * Indicate if it's H5p tool content
   */
  isH5PContent: false,

  /**
   * @property {String}
   */
  accessToken: Ember.computed.alias('session.token-api3'),

  contentURL: null,

  /**
   * @property {boolean} isShowH5PCreation is true only show the interactive buuton
   */
  isShowH5PCreation: Ember.computed.alias(
    'configuration.GRU_FEATURE_FLAG.isShowH5PCreation'
  ),

  /**
   * Indicates the status of the spinner
   * @property {Boolean}
   */
  isLoading: false,

  visibilityContentTypes: Ember.computed.alias(
    'configuration.visibility_content_types'
  ),

  showBackBtn: Ember.computed(
    'isH5PContent',
    'isResourceUpload',
    'isHtmlResource',
    function() {
      return (
        this.get('isH5PContent') ||
        this.get('isResourceUpload') ||
        this.get('isHtmlResource')
      );
    }
  ),

  // -------------------------------------------------------------------------
  // Observers

  clearEmptyFileError: Ember.observer(
    'resource.file',
    'selectedType',
    function() {
      if (this.get('emptyFileError')) {
        this.set('emptyFileError', null);
      }
    }
  ),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Create a resource (url/upload)
   * @param {Resource}
   * @return {Promise.<Resource>}
   */
  handleResourceUpload: function(resource) {
    return new Ember.RSVP.Promise(
      function(resolve) {
        if (this.get('isResourceUpload')) {
          this.get('mediaService')
            .uploadContentFile(resource.file)
            .then(function(filename) {
              resource.set('url', filename);
              resolve(resource);
            });
        } else {
          // Nothing to upload ... return resource as is.
          resolve(resource);
        }
      }.bind(this)
    );
  },

  /**
   * After a resource is saved
   * @param {Resource} newResource
   */
  onNewResource: function(newResourceId) {
    const component = this;
    component.set('isLoadingMoreDetails', false);
    component.triggerAction({
      action: 'closeModal'
    });

    const collectionId = this.get('model.id');
    if (collectionId) {
      const queryParams = {
        queryParams: {
          collectionId: collectionId,
          editing: true
        }
      };
      component
        .get('router')
        .transitionTo('content.resources.edit', newResourceId, queryParams);
    } else {
      const queryParams = {
        queryParams: {
          editing: true
        }
      };
      component
        .get('router')
        .transitionTo('content.resources.edit', newResourceId, queryParams);
    }
  },

  updateFluency() {
    const component = this;
    if (
      component.get('model.metadata') &&
      component.get('model.metadata.fluency') &&
      component.get('isShowFluencyLevel')
    ) {
      const fluData = Ember.Object.create({});
      fluData.fluency = component.get('model.metadata.fluency');
      component
        .get('fluencyService')
        .updateFluencyLevel(fluData, 'collections', component.get('model.id'));
    }
  },

  /**
   * Display an existing resource
   * @param {string} resourceId
   */
  displayExistingResource: function(resourceId) {
    const component = this;
    const resourceService = component.get('resourceService');
    const profileService = component.get('profileService');
    var existingResource;
    component.$('.gru-input.url input').prop('disabled', true);
    resourceService
      .readResource(resourceId)
      .then(function(resource) {
        existingResource = resource;
        return profileService.readUserProfile(resource.get('owner'));
      })
      .then(function(owner) {
        existingResource.set('owner', owner);
        component.set('existingResource', existingResource);
      });
  },

  detectVimeoYoutubeVideoURL: function(url) {
    if (isVideoURL(url)) {
      this.set('isVideo', true);
      this.set('resource.format', VIDEO_RESOURCE_TYPE);
    } else {
      this.set('isVideo', false);
    }
  }
});
