import Ember from 'ember';
//  import ReferenceModel from 'gooru-web/models/content/oa/reference';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-edit-attachment'],
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @property {MediaService} Media service API SDK
   */
  mediaService: Ember.inject.service('api-sdk/media'),

  /**
   * @requires service:api-sdk/offline-activity/offline-activity
   */
  resourceService: Ember.inject.service('api-sdk/question'),
  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property hold uploaded file name
   */
  filename: null,
  /**
   * @property {model} reference model being edited
   */
  model: null,
  /**
   * @property {Array} references
   * property hold user reference list of data
   */
  references: Ember.A([]),

  /**
   * Indicate if it's waiting for createCollection callback
   */
  isLoading: false,
  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
    if (this.get('model')) {
      let content = this.get('model');
      this.set('filename', content);
    }
  },
  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * when sumbit filename edit option
     */
    updateContent: function() {
      const component = this;
      component.validate().then(isValid => {
        if (isValid) {
          component.set('isLoading', true);
          let editRefModel = component.get('model');
          component.uploadSelectedFile().then(function(fileId) {
            let references = editRefModel.get('references');
            let newRefModal = Ember.Object.create({
              filePath: fileId,
              fileName: component.get('model.fileName'),
              subType: component.get('model.subType'),
              type: component.get('model.type')
            });
            references.pushObject(newRefModal);
            component.triggerAction({
              action: 'closeModal'
            });
          });
        }
      });
    },

    //Action triggered when click close
    closeModal: function() {
      this.set('isLoading', false);
      this.triggerAction({
        action: 'closeModal'
      });
    }
  },
  /**
   * uploading files
   */
  uploadSelectedFile() {
    const component = this;
    let fileToUpload = this.get('model').file;
    let fileIdPromise = new Ember.RSVP.resolve(fileToUpload);
    if (fileToUpload) {
      fileIdPromise = component
        .get('mediaService')
        .uploadContentFile(fileToUpload);
    }
    return fileIdPromise;
  },

  /**
   * update reference data in UI without refresh
   */
  updateParent(model, createdRefModel, fileId) {
    const component = this;
    let createdNewRef = Ember.Object.create({
      fileName: createdRefModel.fileName,
      id: createdRefModel.id,
      location: fileId,
      type: createdRefModel.type,
      subType: createdRefModel.subType
    });
    let modelRef = model.get('reference');
    modelRef.pushObject(createdNewRef);
    component.refreshReference();
  },

  /**
   * Validates string by passing value
   */
  validate() {
    const component = this;
    let model = component.get('model');
    var didValidate;
    if (model.get('type') === 'uploaded') {
      didValidate = new Ember.RSVP.Promise(function(resolve) {
        resolve(true);
      });
    } else {
      didValidate = new Ember.RSVP.Promise(function(resolve) {
        if (model) {
          model.validate().then(
            ({ validations }) => resolve(validations.get('isValid')),
            () => resolve(false)
          );
        }
      });
    }
    component.set('didValidate', didValidate);
    return didValidate;
  }
});
