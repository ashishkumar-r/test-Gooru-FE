import Ember from 'ember';
import TaskModel from 'gooru-web/models/content/oa/task';

export default Ember.Component.extend({
  /**------------------------------------------------------------------------------------------------
   * Create/edit task, update parent for changes
   * ------------------------------------------------------------------------------------------------*/

  // -------------------------------------------------------------------------
  // Dependencies

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
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service('session'),

  /**
   * Offline activity Id, which associates task with OA, supplied by caller
   */
  oaId: null,

  /**
   * Instance of TaskModel
   */
  model: null,

  isEditing: true,

  /**
   * @param {Boolean } didValidate - value used to check if input has been validated or not
   */
  didValidate: false,

  isExpandedChild: false,

  description: Ember.computed.alias('model.description'),

  /**
   * Toggle Options
   * @property {Ember.Array}
   */
  switchOptions: Ember.A([
    Ember.Object.create({
      label: 'common.yes',
      value: true
    }),
    Ember.Object.create({
      label: 'common.no',
      value: false
    })
  ]),

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['content', 'gru-tasks-edit'],
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Updates parent for changes
     */
    updateParent(task) {
      const component = this;
      component.get('updateParent')(task);
    },

    /**
     * Save content
     */
    updateContent() {
      const component = this;
      component.saveTask().then(task => {
        component.sendAction('updateParent', task);
      });
    },
    removeLineItem() {
      const component = this;
      component.get('removeLineItem')(component.get('model'));
    },
    /**
     * Reset dirty model with clean model
     */
    cancelChanges() {
      const component = this;
      component.get('cancelTask')();
      component.collapseAll();
      component.showAllHeaders();
    },

    updateSubmissionCollection() {
      //ToDo: Impl
    },

    expandTitle() {
      const component = this;
      component.collapseAll();
      component.showAllHeaders();
      let componentHead = component.$('.panel-default > a .associated-rubric');
      componentHead.addClass('hidden');
    },

    updateEvidence(isChecked) {
      this.set('model.isEvidenceRequired', isChecked);
    }
  },

  /**
   * Hides all expanded collapsible sections
   */
  collapseAll() {
    $(
      '#accordion > .gru-tasks-edit > .panel-default > .panel-collapse.collapse.in'
    ).removeClass('in');
  },

  /**
   * Shows all the header pans associated with collapsible panels
   */
  showAllHeaders() {
    $(
      '#accordion > .gru-tasks-edit > .panel-default > a   .associated-rubric'
    ).removeClass('hidden');
  },

  // -------------------------------------------------------------------------
  // Events
  init() {
    this._super(...arguments);
  },

  didInsertElement() {
    this._super(...arguments);
    const component = this;
    if (!(component.get('model') && component.get('model').id)) {
      let componentHead = component.$('.panel-default > a');
      Ember.run(() => componentHead.click()); //show new task form expanded
    }
    if (!component.get('model.id')) {
      component.set('model.isEvidenceRequired', true);
    }
  },

  didReceiveAttrs() {
    this._super(...arguments);
    const component = this;
    component.prepareModelForComponent();
  },

  /**
   * Prepares a new Model for new task creation for a new task
   * For edit flow uses existing model
   * In both the cases model is enriched with Owner for validation purpose
   */
  prepareModelForComponent() {
    const component = this;
    if (component.get('model') && component.get('model').id) {
      let modelOrig = component.get('model'),
        model = TaskModel.create(
          Ember.getOwner(component).ownerInjection(),
          modelOrig
        );
      component.set('model', model);
    } else {
      let taskInstance = TaskModel.create(
        Ember.getOwner(component).ownerInjection()
      );
      taskInstance.set('oaId', component.get('oaId'));
      taskInstance.set('oaTaskSubmissions', Ember.A([]));
      component.set('model', taskInstance);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Save tasks as per configured mode: edit/create, default mode is create new
   * Returns promise
   */
  validate() {
    const component = this;
    let model = component.get('model');
    // model = TaskModel.create(Ember.getOwner(this).ownerInjection(), modelo);
    var didValidate = new Ember.RSVP.Promise(function(resolve) {
      if (model) {
        model.validate().then(
          ({ validations }) => resolve(validations.get('isValid')),
          () => resolve(false)
        );
      }
    });
    component.set('didValidate', didValidate);
    return didValidate;
  },
  saveTask() {
    const component = this;
    let model = component.get('model');
    return new Ember.RSVP.Promise(function(resolve) {
      component.validate().then(isValid => {
        if (isValid) {
          if (model && model.id) {
            resolve(
              component
                .get('activityService')
                .updateTask(model.oaId, model.id, model)
            );
          } else {
            resolve(component.get('activityService').createTask(model));
          }
        }
      });
    });
  }
});
