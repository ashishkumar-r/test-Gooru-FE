import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['self-grading', 'gru-self-grading-items'],

  // -------------------------------------------------------------------------
  // Dependencies
  offlineActivityService: Ember.inject.service(
    'api-sdk/offline-activity/offline-activity'
  ),

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    component.loadItemsToGrade();
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when select an item to grade
    onSelectGradeItem(gradeItem) {
      const component = this;
      component.set('selectedGradeItem', gradeItem);
      component.set('isShowOaSelfGrading', true);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {UUID} userId
   * UserID of logged in user
   */
  userId: Ember.computed.alias('session.userId'),

  /**
   * @property {Boolean} isShowOaSelfGrading
   * Property to check whether to show self grading pull up or not
   */
  isShowOaSelfGrading: false,

  /**
   * @property {Array} selfGradeItems
   * List of self grading items
   */
  selfGradeItems: Ember.A([]),

  /**
   * @property {Array} itemsToGrade
   * List of items to grade
   */
  itemsToGrade: Ember.A([]),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadItemsToGrade
   * Method to load items to be graded
   */
  loadItemsToGrade() {
    let component = this;
    const selfGradeItems = component.get('selfGradeItems');
    let itemsToGrade = Ember.A([]);
    selfGradeItems.map(function(item) {
      let gradeItem;
      gradeItem = component.createOaGradeItemObject(item);
      if (gradeItem) {
        itemsToGrade.push(gradeItem);
      }
    });
    Ember.RSVP.all(itemsToGrade).then(function(gradeItems) {
      component.set('itemsToGrade', gradeItems);
    });
  },

  /**
   * Creates the grade item information for activity level
   * @param {[]} grade item
   * @param {item} item
   */
  createOaGradeItemObject: function(item) {
    const component = this;
    const activityId = item.get('collectionId');
    const contentType = item.get('collectionType');
    const classId = component.get('classId');
    const itemObject = Ember.Object.create();
    return new Ember.RSVP.Promise(function(resolve, reject) {
      component
        .get('offlineActivityService')
        .readActivity(activityId)
        .then(function(oaContent) {
          itemObject.setProperties({
            classId,
            content: oaContent,
            contentType
          });
          resolve(itemObject);
        }, reject);
    });
  }
});
