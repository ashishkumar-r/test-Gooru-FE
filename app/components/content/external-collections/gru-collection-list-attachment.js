import Ember from 'ember';
import { getFileType, getFileSubType } from 'gooru-web/utils/utils';
import ReferenceModel from 'gooru-web/models/content/oa/reference';
import ModalMixin from 'gooru-web/mixins/modal';

export default Ember.Component.extend(ModalMixin, {
  classNames: ['gru-collection-list-attachment'],
  /**
   */
  questionService: Ember.inject.service('api-sdk/question'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * property is used to assign/get Question Id of the assessments
   */
  questionId: null,

  /**
   * @property {model} reference model being edited
   */
  model: null,
  /**
   * @property {referenceSubType} supplied object from gru-reference definition of subTypes and associated mimetype for ui binding
   */
  referenceSubType: function() {
    return getFileSubType();
  }.property(),

  submissionType: function() {
    return getFileType();
  }.property(),
  /**
   * @property {subTypeMimeType} returns the mimeType for selected subType
   */
  subTypeMimeType: function() {
    let selectedSubType = this.get('model.subType') || 'others',
      selectedMimeType = this.get('referenceSubType').findBy(
        'display_name',
        selectedSubType
      )
        ? this.get('referenceSubType').findBy('display_name', selectedSubType)
          .mimeType
        : '';
    this.set('model.subType', selectedSubType);
    return selectedMimeType;
  }.property('model.subType'),

  isEditing: false,
  /**
   * List of error messages to present to the user for conditions that the loaded image does not meet
   * @prop {String[]}
   */
  filePickerErrors: null,

  // -------------------------------------------------------------------------
  // Events
  init() {
    this._super(...arguments);
    this.set('filePickerErrors', Ember.A());

    let chooseOne = this.get('i18n').t(
      'teacher-landing.class.class-settings.class-settings-sec.option-choose-one'
    ).string;

    let subTypeSel = Ember.Object.create({
      display_name: chooseOne
    });

    this.set('referenceSubType1', getFileSubType());

    let referenceInstance = this.getNewReferenceModel();

    referenceInstance.set('subTypeSel', subTypeSel);
    this.set('model', referenceInstance);
  },

  didInsertElement() {
    this._super(...arguments);
    let chooseOne = this.get('i18n').t(
      'teacher-landing.class.class-settings.class-settings-sec.option-choose-one'
    ).string;

    let subTypeSel = Ember.Object.create({
      display_name: chooseOne
    });

    this.set('referenceSubType1', getFileSubType());

    let referenceInstance = this.getNewReferenceModel();

    referenceInstance.set('subTypeSel', subTypeSel);
    this.set('model', referenceInstance);
  },
  /* -------------------------------------------------------------------------
   *** -------------------------------------------------------------------------
   * Actions*/

  actions: {
    /*
     * Action to delete uploaded exemplar attachments
     */
    deleteReference(refItem) {
      const component = this;
      let arr = component.get('references');
      let attr = 'filePath';
      let value = refItem.filePath;
      this.deleteReferenceItem(arr, attr, value);
    },

    /**
     * @function actions:disableButtons
     */
    // eslint-disable-next-line no-dupe-keys
    resetFileSelection() {
      // Reset the input element in the file picker
      // http://stackoverflow.com/questions/1043957/clearing-input-type-file-using-jquery/13351234#13351234
      var $fileInput = this.$('input[type="file"]');
      $fileInput
        .wrap('<form>')
        .closest('form')
        .get(0)
        .reset();
      $fileInput.unwrap();

      this.set('selectedFile', null);
    },

    /**
     *
     * @param {object} subType, UI selection of subtype
     */
    onSubTypeChange: function(subType) {
      this.get('model').set('subType', subType.display_name);
    },

    //GRU-file-picker-events action
    selectFile: function(file) {
      let type = 'uploaded';
      let reference = this.get('references');
      if (file) {
        let subType = getFileSubType(file.type);
        this.set('model.file', file);
        this.set('model.type', type);
        this.set('model.subType', subType);
        this.set('model.fileName', file.name);
        this.set('model.references', reference);

        var model = this.get('model');
        this.actions.showModal.call(
          this,
          'content.modals.gru-edit-attachment',
          model,
          null,
          null,
          null,
          false
        );
      }
    },
    /**
     * Function to set typeand subtype while on file uploading
     */
    updateURLRef: function() {
      const component = this;
      let editRefModel = component.get('model');
      this.set('model.type', 'remote');
      this.set('model.subType', 'url');
      component.validate().then(isValid => {
        if (isValid) {
          component.updateReference(editRefModel).then(() => {
            component.set('isLoading', false);
            let referenceInstance = component.getNewReferenceModel();
            this.set('model', referenceInstance);
          });
        }
      });
    }
  },
  /**
   * Function delete existing exemplar attachements based on requirement
   */
  deleteReferenceItem(arr, attr, value) {
    let i = arr.length;
    while (i--) {
      if (
        arr[i] &&
        arr[i].hasOwnProperty(attr) &&
        arguments.length > 2 &&
        arr[i][attr] === value
      ) {
        arr.splice(i, 1);
      }
    }
    const component = this;
    let refItem = arr;
    component.refreshReference(refItem);
  },
  /**
   * Function to reload when upload or deletion of file attachment completed
   */
  refreshReference(modelRef) {
    const component = this;
    let refsCol = modelRef;
    let newSource = refsCol.slice(0);
    Ember.set(this, 'references', newSource);
    component.set('references', refsCol);
  },
  /**
   * Function to update file attachment to the API service
   */
  updateReference(model) {
    const component = this;
    return component
      .get('questionService')
      .createReferences(model, model.location)
      .then(createdRefModel => {
        component.updateParent(createdRefModel);
        let referenceInstance = this.getNewReferenceModel();
        component.set('model', referenceInstance); // needed to break the ref
      });
  },
  /**
   * Function to create new Instances of file upload
   */
  getNewReferenceModel() {
    const component = this;
    let model = component.get('elementId');
    return ReferenceModel.create(Ember.getOwner(this).ownerInjection(), {
      questionId: model
    });
  },
  /**
   * Function to validate uploading attachments
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
