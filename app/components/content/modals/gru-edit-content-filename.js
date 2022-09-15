import Ember from 'ember';
import ReferenceModel from 'gooru-web/models/content/oa/reference';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-edit-content-filename'],
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @property {MediaService} Media service API SDK
   */
  mediaService: Ember.inject.service('api-sdk/media'),

  /**
   * @requires service:api-sdk/offline-activity/offline-activity
   */
  activityService: Ember.inject.service(
    'api-sdk/offline-activity/offline-activity'
  ),
  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property hold uploaded file name
   */
  filename: '',
  /**
   * @property {model} reference model being edited
   */
  model: '',
  /**
   * @property {Array} references
   * property hold user reference list of data
   */
  references: Ember.A([]),

  /**
   * Indicate if it's waiting for createCollection callback
   */
  isLoading: false,
  /**
   * showing reference error message
   */
  isexistingName: false,
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
            component.toggleReference(editRefModel, fileId).then(() => {
              component.set('isLoading', false); // needed to break the ref
            });
          });
        }
      });
    },

    //Action triggered when click close
    closeModal: function() {
      let model = this.get('model');
      if (model.callback && model.callback.success()) {
        model.callback.success();
      }
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
   * update fileName to API
   */
  toggleReference(model, fileId) {
    const component = this;
    return component
      .get('activityService')
      .createReferences(model, fileId)
      .then(createdRefModel => {
        component.updateParent(model, createdRefModel, fileId);
        let referenceInstance = this.getNewReferenceModel();
        component.set('model', referenceInstance); // needed to break the ref
        this.triggerAction({
          action: 'closeModal'
        });
      });
  },
  /**
   * update reference data in UI without refresh
   */
  updateParent(model, createdRefModel, fileId) {
    let createdNewRef = Ember.Object.create({
      fileName: createdRefModel.fileName,
      id: createdRefModel.id,
      location: fileId,
      userType: model.userType,
      type: createdRefModel.type,
      subType: createdRefModel.subType,
      oaId: createdRefModel.oaId
    });
    let modelRef = model.get('references');
    modelRef.pushObject(createdNewRef);
  },
  /**
   * get oaId value from model
   */
  getNewReferenceModel() {
    return ReferenceModel.create(Ember.getOwner(this).ownerInjection(), {
      oaId: this.get('oaId')
    });
  },
  /**
   * Validates string by passing value
   */
  validate() {
    this.set('isexistingName', false);
    const component = this;
    let model = component.get('model');
    var didValidate;
    let uploadedCol = model
      .get('references')
      .findBy('fileName', model.get('fileName'));
    if (uploadedCol) {
      this.set('isexistingName', true);
    }
    if (model.get('fileName') !== '' && !uploadedCol) {
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
