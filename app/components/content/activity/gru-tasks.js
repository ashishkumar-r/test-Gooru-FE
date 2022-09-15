import Ember from 'ember';

export default Ember.Component.extend({
  /**------------------------------------------------------------------------------------------------
   * Structure
   *    -tasks Layout,
   *        -list of tasks
   *        -- Line item of each task
   *        -- Invoke New Task
   *            -- Invoke Submission Layout
   *                -- List of submissions
   *                -- New Submission
   * ------------------------------------------------------------------------------------------------
   * Models
   *  Parent Models : Receives activityModel, editingActivity Model
   *  Own Models :
   *     editingActivity> Tasks : List of Task Models
   *      editingActivity> Tasks > Task : Task Entity Model
   *        editingActivity> Tasks > Task > submissions : List of Submission Models
   *         editingActivity> Tasks > Task > submissions > submission: Submission Entity Model
   * ------------------------------------------------------------------------------------------------
   *    UI Interaction:
   *         Load from Tasks tab click, or scroll down if mandatory OA is created
   *         Detects empty Tasks collection > Open New Task creation, otherwise show list of tasks, AND
   *         Task Creation form at the end. Saving task adds to task list again with empty task creation form
   *
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
   * Collection model as instantiated by the route. This is the clean model used when not editing
   * or after any collection changes have been saved.
   * @property {Collection}
   */
  activityModel: null,

  /**
   * Collection model as passed by the route. The dirty model used for editing and saving changes to.
   * This is sent to parent for syncing.
   * @property {Collection}
   */
  tasks: null,

  sortedTasks: Ember.observer('tasks', function() {
    const component = this;
    let tasksCol = component.get('tasks');
    tasksCol = tasksCol.sortBy('id');
    return tasksCol;
  }),

  isExpanded: false,

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['content', 'gru-task'],
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    addNewTask() {
      const component = this;
      if (component.get('task') !== 'dummy' && !component.get('task')) {
        component.set('task', 'dummy');
      }
    },
    cancelTask() {
      const component = this;
      component.get('updateParent')();
      if (component.get('task')) {
        component.set('task', null);
      }
    },
    updateTaskCollection(task) {
      const component = this;
      let tasksCol = component.get('tasks');
      component.removeItemIfFromCollection(tasksCol, task, 'id');
      tasksCol.pushObject(task);
      tasksCol = tasksCol.sortBy('id');
      Ember.set(this, 'tasks', tasksCol);
      component.get('updateParent')();
      if (component.get('task')) {
        component.set('task', null);
      }
    },

    removeLineItem(task) {
      const component = this;
      component.removeTask(task).then(task => {
        let tasksCol = component.get('tasks');
        component.removeItemIfFromCollection(tasksCol, task, 'id');
        component.get('updateParent')();
      });
    },

    updateExpanded(isExpanded) {
      Ember.set(this, 'isExpanded', isExpanded);
    }
  },

  removeItemIfFromCollection(col, item, field) {
    let curItem = col.findBy(field, item[field]);
    if (curItem) {
      col.removeObject(curItem);
    }
  },
  // -------------------------------------------------------------------------
  // Events
  init() {
    this._super(...arguments);
  },
  // -------------------------------------------------------------------------
  // Properties
  removeTask(task) {
    const component = this;
    return component.get('activityService').removeTask(task);
  }
});
