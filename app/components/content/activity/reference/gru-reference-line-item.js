import Ember from 'ember';
import {
  getOAType,
  getOASubType,
  getFileSubType,
  validURL
} from 'gooru-web/utils/utils';
import ReferenceModel from 'gooru-web/models/content/oa/reference';
import ModalMixin from 'gooru-web/mixins/modal';

export default Ember.Component.extend(ModalMixin, {
  classNames: ['gru-reference-line-item'],
  /**
   * @requires service:api-sdk/offline-activity/offline-activity
   */
  activityService: Ember.inject.service(
    'api-sdk/offline-activity/offline-activity'
  ),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @property {Array} parsedReference
   * property hold user reference list of data
   */
  parsedReference: Ember.A([]),

  // -------------------------------------------------------------------------
  // Props

  /**
   * Offline activity Id, which associates task with OA, supplied by caller
   */
  oaId: null,

  /**
   * @property {model} reference model being edited
   */
  model: null,
  /**
   * @property {Boolean} isLoading
   */
  isLoading: false,
  /**
   * @property {Boolean} isValidRefItem
   */
  isValidRefItem: Ember.computed(
    'model.fileName',
    'model.location',
    function() {
      return (
        this.get('model.fileName') &&
        this.get('model.location') &&
        validURL(this.get('model.location'))
      );
    }
  ),
  /**
   * @property {referenceSubType} supplied object from gru-reference definition of subTypes and associated mimetype for ui binding
   */
  referenceSubType: function() {
    return getOASubType();
  }.property(),

  submissionType: function() {
    return getOAType();
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

  isEditing: null,
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

    this.set('referenceSubType1', getOASubType());

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

    this.set('referenceSubType1', getOASubType());

    let referenceInstance = this.getNewReferenceModel();

    referenceInstance.set('subTypeSel', subTypeSel);
    this.set('model', referenceInstance);
  },
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // Actions

  actions: {
    deleteReference(refItem) {
      this.deleteReference(refItem);
    },
    prepareForSubmission(file) {
      this.set('selectedFile', file);
      this.get('onSelectFile')(file);
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

    /**
     * edit action //ToDo://revisit here
     */
    editContent: function() {
      this.set('model', this.get('model').copy());
      this.set('isEditing', true);
    },
    cancelEdit: function(/* params */) {
      //ToDo: Handle cancel
    },

    //GRU-file-picker-events action
    selectFile: function(file) {
      let component = this;
      let type = 'uploaded';
      let userType = component.get('userType');
      let reference = component.get('references');

      if (file) {
        let subType = getFileSubType(file.type);
        var model = component.get('model');
        model.setProperties({
          file: file,
          type: type,
          subType: subType,
          fileName: file.name,
          userType: userType,
          references: reference,
          callback: {
            success: function() {
              component.$('.ember-text-field').val('');
            }
          }
        });

        this.actions.showModal.call(
          this,
          'content.modals.gru-edit-content-filename',
          model,
          null,
          null,
          null,
          false
        );
      }
    },
    updateURLRef: function() {
      const component = this;
      let editRefModel = component.get('model');
      this.set('model.type', 'remote');
      this.set('model.subType', 'url');
      this.set('model.userType', this.get('userType'));
      this.set('isLoading', true);
      this.set('didValidate', true);
      component
        .updateReference(editRefModel)
        .then(() => {
          component.set('isLoading', false);
          let referenceInstance = component.getNewReferenceModel();
          this.set('model', referenceInstance);
          this.set('didValidate', false);
        })
        .catch(function() {
          component.set('isLoading', false);
        });
    }
  },
  /**
   * update fileName to API
   */
  updateReference(model) {
    const component = this;
    return component
      .get('activityService')
      .createReferences(model, model.location)
      .then(createdRefModel => {
        component.updateReferenceDetails(createdRefModel);
        let referenceInstance = this.getNewReferenceModel();
        component.set('model', referenceInstance); // needed to break the ref
      });
  },
  /**
   * update reference data in UI without refresh
   */
  updateReferenceDetails(reference) {
    const component = this;
    let refsCol = component.get('references');
    refsCol.pushObject(reference);
  },
  /**
   *get oaId value from model
   */
  getNewReferenceModel() {
    return ReferenceModel.create(Ember.getOwner(this).ownerInjection(), {
      oaId: this.get('oaId')
    });
  },

  didRender: function() {
    const $fileInput = this.$('input[type="file"]');
    if ($fileInput) {
      for (let i = 0; i < $fileInput.length; i++) {
        $fileInput[i].title = $fileInput[i].id;
      }
    }
  }
});
