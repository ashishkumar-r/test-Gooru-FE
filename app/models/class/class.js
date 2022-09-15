import DS from 'ember-data';
/**
 * Model that contains the class information
 * @typedef {Object} Class
 */
export default DS.Model.extend({
  /**
   * @property {string} Student/Teacher name
   */
  name: DS.attr('string'),

  /**
   * @property {string} Class Code
   */
  code: DS.attr('string'),

  /**
   * @property {string} Greetings message
   */
  greetings: DS.attr('string'),

  /**
   * @property {string} Long description about the class
   */
  description: DS.attr('string'),

  /**
   * @property {string} Class start date
   */
  startDate: DS.attr('string'),

  /**
   * @property {string} Class end date
   */
  endDate: DS.attr('string'),

  /**
   * @property {string} Grades values separated by commas, e.g. 'K,1,2,3'
   */
  grades: DS.attr('string'),

  /**
   * @property {string} Visibility (true/false)
   */
  visibility: DS.attr('boolean'),

  /**
   * @property {string} Total members joined to the class
   */
  totalMembers: DS.attr('number'),

  /**
   * @property {{ id: string, username: string, avatarUrl: string}[]} An array of teachers with very basic teacher information
   */
  teachers: DS.attr(),

  /**
   * @property {string} Subject of the class
   */
  subject: DS.attr('string'),

  /**
   * @property {string} Course of the class
   */
  course: DS.attr('string'),

  /**
   * Indicates if a user is a teacher of this class
   * @param {string} userId user identifier
   * @returns {bool}
   */
  isTeacher: function(userId) {
    return this.get('teachers')
      .filterBy('id', userId)
      .get('length');
  },

  /**
   * Indicates if a user is a student of this class
   * @param {string} userId user identifier
   * @returns {bool}
   */
  isStudent: function(userId) {
    return !this.isTeacher(userId);
  }
});
