import Ember from 'ember';
export default Ember.Mixin.create({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/class
   */
  classService: Ember.inject.service('api-sdk/class'),

  // -------------------------------------------------------------------------
  // property

  isTagGoogleClassroom: Ember.computed('googleClassList', function() {
    const mixin = this;
    let classInfo =
      mixin.get('class') ||
      mixin.get('primaryClass') ||
      mixin.get('currentClass');
    let classSetting = classInfo.get('setting');
    let googleClassList = mixin.get('googleClassList');
    let hasSelectedClass = googleClassList
      ? googleClassList.findBy('id', classSetting.google_classroom_id)
      : null;
    return classSetting.get('google_classroom_id') && hasSelectedClass;
  }),

  googleClassroomName: Ember.computed('googleClassList', function() {
    const mixin = this;
    let classInfo =
      mixin.get('class') ||
      mixin.get('primaryClass') ||
      mixin.get('currentClass');
    let classSetting = classInfo.get('setting');
    let googleClassList = mixin.get('googleClassList');
    let hasSelectedClass = googleClassList
      ? googleClassList.findBy('id', classSetting.google_classroom_id)
      : null;
    return hasSelectedClass ? hasSelectedClass.name : '';
  }),

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Methods

  fetchClassList() {
    let mixin = this;
    mixin
      .get('classService')
      .fetchAccessToken()
      .then(token => {
        if (token) {
          mixin
            .get('classService')
            .fetchClassRoomList()
            .then(classList => {
              if (!mixin.get('isDestroyed')) {
                mixin.set('googleClassList', classList.response);
              }
            })
            .catch(function() {
              mixin.set('googleClassList', Ember.A([]));
            });
        }
      })
      .catch(function() {
        mixin.set('googleClassList', Ember.A([]));
      });
  },

  postAssignment: function(classroomId, assignmentsInfo) {
    const mixin = this;
    mixin
      .get('classService')
      .createClassroomAssignments(classroomId, assignmentsInfo)
      .then();
  }
});
