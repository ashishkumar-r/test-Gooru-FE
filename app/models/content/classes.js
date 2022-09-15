import Ember from 'ember';

/**
 * Classes model
 *
 * @typedef {Object} ClassesModel
 */
export default Ember.Object.extend({
  /**
   * @property {String[]} List of classes where the user is owner
   */
  ownerList: [],

  /**
   * @property {String[]} List of classes where the user is collaborator
   */
  collaboratorList: [],

  /**
   * @property {String[]} List of classes where the user is member
   */
  memberList: [],

  /**
   * @property {Object} List of key values containing class id and student count
   */
  memberCount: {},

  /**
   * @property {Class[]} Detailed list of classes
   */
  classes: [],

  //
  // Methods
  /**
   * Retrieve the student active classes
   * @param {string}
   * @return {Class[]}
   */
  getStudentActiveClasses: function(userId) {
    const totalClasses = this.get('classes.length');
    return totalClasses
      ? this.get('classes').filter(function(aClass) {
        return !aClass.get('isArchived') && !aClass.isTeacher(userId);
      })
      : [];
  },

  /**
   * Retrieve the teacher active classes
   * @param {string}
   * @return {Class[]}
   */
  getTeacherActiveClasses: function(userId) {
    let activeClasslist = Ember.A([]);
    const totalClasses = this.get('classes.length');
    return totalClasses
      ? this.get('classes').filter(function(aClass) {
        if (
          !aClass.isArchived &&
            (aClass.roster_id === null ||
              (aClass.roster_id &&
                aClass.preference &&
                aClass.preference.framework &&
                aClass.preference.subject))
        ) {
          return (
            activeClasslist.pushObject(aClass) && aClass.isTeacher(userId)
          );
        }
      })
      : [];
  },

  /**
   * Retrieve the teacher archved classes
   * @param {string}
   * @return {Class[]}
   */
  getTeacherArchivedClasses: function() {
    const totalArchivedClasses = this.get('classes.length');
    return totalArchivedClasses
      ? this.get('classes').filter(function(archivedClass) {
        return archivedClass.get('isArchived');
      })
      : [];
  },

  /**
   * Retrieve the teacher incomplete classes
   * @return {Class[]}
   */
  getTeacherIncompleteClasses: function() {
    const totalIncompleteClasses = this.get('classes');
    return totalIncompleteClasses
      ? totalIncompleteClasses.filter(data => {
        return (
          data.roster_id &&
            !data.isArchived &&
            (data.preference === null ||
              data.preference.framework === null ||
              data.preference.subject === null)
        );
      })
      : [];
  }
});
