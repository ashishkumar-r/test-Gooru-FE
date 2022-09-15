import Ember from 'ember';
import { ROLES } from 'gooru-web/config/config';
import { generateUUID } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  classNames: ['gru-references'],

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service('session'),

  /**
   * @requires service:api-sdk/offline-activity/offline-activity
   */
  activityService: Ember.inject.service(
    'api-sdk/offline-activity/offline-activity'
  ),

  /**
   * Collection model as instantiated by the route. This is the clean model used when not editing
   * or after any collection changes have been saved.
   * @property {Collection}
   */
  activityModel: null,

  /**
   * Activity model dirty copy passed by caller, for saving exemplar and reference
   */
  model: null,
  /**
   * Collection model as passed by the route. The dirty model used for editing and saving changes to.
   * This is sent to parent for syncing.holds list of references in the activity
   * @property {references}
   */
  references: null,
  /**
   * property used to show student title
   */
  studentTitle: ROLES.STUDENT,
  /**
   * property used to show teacher title
   */
  teacherTitle: ROLES.TEACHER,
  /**
   * @property {studentReferences[]} List of student reference details
   */
  studentReferences: Ember.computed('references', function() {
    return this.get('references')
      .filterBy('userType', ROLES.STUDENT)
      .copy();
  }),
  /**
   * @property {teacherReferences[]} List of teacher reference details
   */
  teacherReferences: Ember.computed('references', function() {
    return this.get('references')
      .filterBy('userType', ROLES.TEACHER)
      .copy();
  }),
  /**
   * @property for  type of user
   */
  userType: '',

  isEditing: false,

  isExemplarEditing: false,

  oaId: null,

  /**
   * @property {Boolean} refOaId
   * Property used to change update references based on condition
   */
  isEditReference: false,

  /**
   * @property {Boolean} refOaId
   * Property to check oa id is valid or not
   */
  refOaId: null,

  /**
   * @property {Boolean} isValid
   * Property to check validation of field
   */
  isValid: false,

  exemplarUUID: Ember.computed(function() {
    return `exemplar${generateUUID()}`;
  }).property(),

  referenceUUID: Ember.computed(function() {
    return `reference${generateUUID()}`;
  }).property(),
  // -------------------------------------------------------------------------
  // Events
  init() {
    let component = this;
    component._super(...arguments);
  },
  // -------------------------------------------------------------------------
  // Properties

  createNewReference: null,

  actions: {
    /**
     * Action to save reference, and exemplar fields
     */
    updateContent: function() {
      this.get('updateContent')(this.get('model'));
      this.set('isEditing', false);
    },

    cancelEdit: function() {
      this.set('isEditing', false);
      let srcModelValue = this.get('activityModel.reference');
      this.set('model.reference', srcModelValue);
    },

    editContent() {
      this.set('isEditing', true);
    },

    /**
     * Action to save reference, and exemplar fields
     */
    updateExemplarContent: function() {
      this.get('updateContent')(this.get('model'));
      this.set('isExemplarEditing', false);
    },

    cancelExemplarEdit: function() {
      this.set('isExemplarEditing', false);
      let srcModelValue = this.get('activityModel.exemplar');
      this.set('model.exemplar', srcModelValue);
    },

    editExemplarContent() {
      this.set('isExemplarEditing', true);
    },

    /**
     * Action to save/ add reference
     */
    updateReferenceCollection(reference) {
      const component = this;
      let refsCol = component.get('references');
      refsCol.pushObject(reference);
      component.refreshReference();
      component.get('updateParent')();
    },

    /**
     * Action to delete reference
     */
    deleteReference(refitem) {
      const component = this;
      if (refitem && refitem.length > 0) {
        refitem = refitem[0];
      } else {
        return;
      }
      component.deleteReferenceItem(refitem);
    },

    /**
     * Action to delete url reference
     */
    deleteUrlReference(refitem) {
      const component = this;
      component.deleteReferenceItem(refitem);
    },

    /**
     * Action to edit reference
     */
    editReference(refitem) {
      const component = this;
      component.set('isEditReference', true);
      component.set('refOaId', refitem.id);
    },

    /**
     * Action to update reference
     */
    updateReference(refitem) {
      const component = this;
      if (refitem.fileName) {
        component.set('isEditReference', false);
        component.set('refOaId', null);
        component.set('isValid', false);
        return component.get('activityService').updateReferences(refitem);
      } else {
        component.set('isValid', true);
      }
    }
  },

  /**
   * Action to delete reference item
   */
  deleteReferenceItem(refitem) {
    const component = this;
    const userType = refitem.get('userType');
    component
      .get('activityService')
      .deleteReference(refitem)
      .then(refItem => {
        let refsCol =
          userType === 'student'
            ? component.get('studentReferences')
            : component.get('teacherReferences');
        refsCol.removeObject(refItem);
        component.refreshReference(refsCol, userType);
        component.get('updateParent')();
      });
  },

  /**
   * Action to refresh reference
   */
  refreshReference(refsCol, userType) {
    const component = this;
    if (userType === ROLES.STUDENT) {
      component.set('studentReferences', refsCol);
    } else {
      component.set('teacherReferences', refsCol);
    }
  },

  parsedReference: Ember.computed('references.[]', function() {
    const component = this;
    let uploadedCol = component
      .get('references')
      .filter(item => item.type === 'uploaded');
    let displayData = Ember.A([]);
    let displayItem = {
      refData: uploadedCol,
      count: uploadedCol.length
    };
    displayData.pushObject(displayItem);

    return displayData;
  })
});
