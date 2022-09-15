import Ember from 'ember';
import StoreMixin from '../../mixins/store';

export default Ember.Service.extend(StoreMixin, {
  /**
   * Returns all the subjects provided by the end-point
   * @returns {*|Promise.<T>}
   */
  readAll: function() {
    return this.get('store').findAll('subject').then(function(subjects) {
      return subjects;
    });
  }
});
