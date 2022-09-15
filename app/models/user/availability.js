import DS from 'ember-data';

export default DS.Model.extend({
  /**
   * @property {number} availability response confirmStatus
   */
  confirmStatus: DS.attr('number'),
  /**
   * @property {boolean} availability response collaboratorCheck
   */
  collaboratorCheck: DS.attr('boolean'),
  /**
   * @property {boolean} availability boolean that determines whether it is available or not.
   */
  availability: DS.attr('boolean')
});
