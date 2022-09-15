import DS from 'ember-data';

/**
 * Model to represent the Subjects obtained from the end-point
 * @typedef {Object} Subject
 */
export default DS.Model.extend({
  /**
   * @property {number} libraryId
   */
  libraryId: DS.attr('number'),

  /**
   * @property {string} library
   */
  library: DS.attr('string'),

  /**
   * @property {string} label
   */
  label: DS.attr('string'),

  /**
   * @property {string} subjectCode
   */
  subjectCode: DS.attr('string')
});
